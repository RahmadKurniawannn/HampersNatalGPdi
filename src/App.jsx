import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import OrderDetail from './pages/OrderDetail';
import CartDrawer from './components/CartDrawer';
import Admin from './pages/Admin';
import AdminAuth from './pages/AdminAuth';
import { products as initialProducts } from './data/products';
import { isSupabaseConfigured, supabase } from './lib/supabase';

const mapDatabaseProduct = product => ({
  id: product.id,
  name: product.name,
  category: product.category,
  basePrice: product.base_price,
  image: product.image,
  description: product.description,
  weight: product.weight,
  packaging: product.packaging || '',
  includes: product.includes || [],
});

const toDatabaseProduct = product => ({
  id: product.id,
  name: product.name,
  category: product.category,
  base_price: product.basePrice,
  image: product.image,
  description: product.description,
  weight: product.weight,
  packaging: product.packaging || '',
  includes: product.includes,
});

function App() {
  const [currentView, setCurrentView] = useState({ name: 'home' });
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [products, setProducts] = useState(initialProducts);
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    if (!supabase) return undefined;

    supabase.from('products').select('*').order('id').then(({ data, error }) => {
      if (error || !data?.length) return;
      const databaseProducts = data.map(mapDatabaseProduct);
      const databaseById = new Map(databaseProducts.map(product => [product.id, product]));
      const mergedProducts = initialProducts.map(product => databaseById.get(product.id) || product);
      const customProducts = databaseProducts.filter(product => !initialProducts.some(initial => initial.id === product.id));
      setProducts([...mergedProducts, ...customProducts]);
    });
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

    const loadAdminSession = async nextSession => {
      setSession(nextSession);
      if (!nextSession) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', nextSession.user.id)
        .maybeSingle();
      const adminAccess = profile?.role === 'admin';
      setIsAdmin(adminAccess);

      if (adminAccess) {
        const { data: existingProducts } = await supabase.from('products').select('id').limit(1);
        if (!existingProducts?.length) {
          await supabase.from('products').upsert(initialProducts.map(toDatabaseProduct));
        }
        const { data: users } = await supabase
          .from('profiles')
          .select('id, email, role, created_at')
          .order('created_at', { ascending: false });
        setAdminUsers(users || []);
      }
      setAuthReady(true);
    };

    supabase.auth.getSession().then(({ data }) => loadAdminSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => loadAdminSession(nextSession));

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleNavigate = (viewName, params = {}) => {
    setCurrentView({ name: viewName, ...params });
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
    handleNavigate('home');
  };

  const handleAddToCart = (item) => {
    setCartItems(prev => [...prev, item]);
    setIsCartOpen(true);
  };

  const handleOrderNow = (item) => {
    setCartItems(prev => [...prev, item]);
    setIsCartOpen(false);
    handleNavigate('order');
  };

  const handleRemoveFromCart = (indexToRemove) => {
    setCartItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveProduct = async product => {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .upsert(toDatabaseProduct(product))
        .select()
        .single();
      if (!error) {
        product = mapDatabaseProduct(data);
      } else {
        throw error;
      }
    } else {
      throw new Error('Supabase belum dikonfigurasi. Produk tidak disimpan.');
    }

    setProducts(prev => {
      const exists = prev.some(item => item.id === product.id);
      return exists ? prev.map(item => item.id === product.id ? product : item) : [...prev, product];
    });
  };

  const handleDeleteProduct = async productId => {
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
    } else {
      throw new Error('Supabase belum dikonfigurasi. Produk tidak dihapus.');
    }
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  const handleUploadImage = async file => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi. Gambar tidak diunggah.');

    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const filePath = `${crypto.randomUUID()}-${safeFileName}`;
    const { error } = await supabase.storage.from('product-images').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    return supabase.storage.from('product-images').getPublicUrl(filePath).data.publicUrl;
  };

  const handleRefreshAdminUsers = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });
    setAdminUsers(data || []);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const renderView = () => {
    switch (currentView.name) {
      case 'home':
        return <Home products={products} onNavigate={handleNavigate} />;
      case 'catalog':
        return <Catalog products={products} onNavigate={handleNavigate} />;
      case 'detail':
        return <ProductDetail 
          productId={currentView.id} 
          products={products}
          onNavigate={handleNavigate} 
          onAddToCart={handleAddToCart}
          onOrderNow={handleOrderNow}
        />;
      case 'order':
        return <OrderDetail items={cartItems} total={cartTotal} onNavigate={handleNavigate} />;
      case 'admin':
        if (!authReady || !session || !isAdmin) {
          return <AdminAuth onNavigate={handleNavigate} hasSession={Boolean(session)} />;
        }
        return <Admin products={products} adminUsers={adminUsers} onRefreshAdminUsers={handleRefreshAdminUsers} onNavigate={handleNavigate} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} onUploadImage={handleUploadImage} onLogout={handleLogout} />;
      case 'admin-register':
        return <AdminAuth mode="register" onNavigate={handleNavigate} />;
      default:
        return <Home products={products} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base font-sans">
      <Navbar 
        cartCount={cartCount}
        onNavigate={handleNavigate} 
        currentView={currentView.name} 
        onCartOpen={() => setIsCartOpen(true)}
        isAuthenticated={Boolean(session && isAdmin)}
        onLogout={handleLogout}
      />
      
      <main className="flex-grow">
        {renderView()}
      </main>

      <Footer onNavigate={handleNavigate} />

      <CartDrawer
        items={cartItems}
        total={cartTotal}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemove={handleRemoveFromCart}
        onClear={() => setCartItems([])}
        onOrder={() => {
          setIsCartOpen(false);
          handleNavigate('order');
        }}
      />
    </div>
  );
}

export default App;