import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: Record<string, unknown>, status = 200) => new Response(
  JSON.stringify(body),
  {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  },
);

Deno.serve(async request => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const authorization = request.headers.get('Authorization');
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) {
    return jsonResponse({ error: 'Authentication required.' }, 401);
  }

  let payload: { email?: unknown; password?: unknown };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: 'Enter a valid email address.' }, 400);
  }
  const password = typeof payload.password === 'string' ? payload.password : '';
  if (password.length < 6) {
    return jsonResponse({ error: 'Password must be at least 6 characters long.' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Missing Supabase environment configuration for create-admin-user.');
    return jsonResponse({ error: 'Admin account service is not configured.' }, 500);
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: callerResult, error: callerError } = await callerClient.auth.getUser(accessToken);
  if (callerError || !callerResult.user) {
    return jsonResponse({ error: 'Your session is invalid. Please sign in again.' }, 401);
  }

  const { data: callerProfile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', callerResult.user.id)
    .maybeSingle();
  if (profileError) {
    console.error('Unable to verify caller admin role:', profileError);
    return jsonResponse({ error: 'Could not verify admin access.' }, 500);
  }
  if (callerProfile?.role !== 'admin') {
    return jsonResponse({ error: 'Only admins can create admin accounts.' }, 403);
  }

  const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !createData.user) {
    console.error('Admin account creation failed:', createError);
    return jsonResponse({ error: createError?.message || 'Admin account could not be created.' }, 400);
  }

  const { data: profile, error: roleError } = await adminClient
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', createData.user.id)
    .select('id, email, role, created_at')
    .single();
  if (roleError) {
    console.error('Unable to grant admin role to created user:', roleError);
    const { error: cleanupError } = await adminClient.auth.admin.deleteUser(createData.user.id);
    if (cleanupError) {
      console.error('Unable to remove user after role grant failure:', cleanupError);
    }
    return jsonResponse({ error: 'Account was created, but admin access could not be granted. Please check the Supabase profile trigger and retry.' }, 500);
  }

  return jsonResponse({ user: profile });
});
