import { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AdminAuth = ({ onNavigate, hasSession = false, authError = '' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    let result;
    try {
      result = await supabase.auth.signInWithPassword({ email, password });
    } catch (requestError) {
      setError(`Permintaan autentikasi gagal: ${requestError.message}`);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    onNavigate('admin');
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-base px-5 py-12 sm:px-8">
      <div className="w-full max-w-md border border-gray-200 bg-white p-6 sm:p-9">
        <div className="border-b border-gray-200 pb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Area pengelola</p>
          <h1 className="mt-3 font-serif text-3xl text-main">Masuk ke admin</h1>
          <p className="mt-3 text-sm font-light leading-relaxed text-muted">
            Kelola produk, gambar, harga, dan isi hampers dari satu tempat.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mt-6 border-l-2 border-primary bg-base px-4 py-3 text-sm leading-relaxed text-muted">
            Mode Supabase belum aktif. Tambahkan konfigurasi environment untuk menggunakan login.
          </div>
        )}

        {hasSession && isSupabaseConfigured && !authError && (
          <div className="mt-6 border-l-2 border-primary bg-base px-4 py-3 text-sm leading-relaxed text-muted">
            Akun ini belum memiliki akses admin. Minta pemilik Supabase mengubah role akun menjadi <strong>admin</strong>.
          </div>
        )}

        {authError && (
          <div className="mt-6 border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <label className="block text-sm text-main">
            Email admin
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="mt-2 w-full border border-gray-200 px-4 py-3 font-light outline-none transition-colors focus:border-primary"
              placeholder="admin@contoh.com"
              required
            />
          </label>
          <label className="block text-sm text-main">
            Password
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="mt-2 w-full border border-gray-200 px-4 py-3 font-light outline-none transition-colors focus:border-primary"
              placeholder="Password akun admin"
              required
            />
          </label>

          {error && <p className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary py-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isLoading ? 'Memproses...' : 'Masuk ke admin'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-4 text-xs text-muted">
          <button onClick={() => onNavigate('home')} className="hover:text-primary focus:outline-none focus-visible:underline">Kembali ke website</button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
