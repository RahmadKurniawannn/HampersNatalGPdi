import { useCallback, useEffect, useRef, useState } from 'react';
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

const mapDatabaseProduct = product => {
  const initialProduct = initialProducts.find(initial => initial.id === product.id);
  const isLocalAsset = /^(?:\.\/|\/)?assets\//.test(product.image || '');

  return {
    id: product.id,
    name: product.name,
    category: product.category || 'Hampers',
    basePrice: product.base_price,
    image: isLocalAsset ? initialProduct?.image || product.image : product.image || initialProduct?.image,
    description: product.description,
    weight: product.weight,
    packaging: product.packaging || '',
    includes: product.includes || [],
  };
};

const toDatabaseProduct = product => ({
  id: product.id,
  name: product.name,
  category: product.category || 'Hampers',
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
  const [authError, setAuthError] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const [products, setProducts] = useState(supabase ? [] : initialProducts);
  const [productsLoading, setProductsLoading] = useState(Boolean(supabase));
  const [productsError, setProductsError] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersError, setAdminUsersError] = useState('');
  const productChangesDuringLoad = useRef(new Map());
  const hasLoadedProducts = useRef(false);

  const loadProducts = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('products').select('*').order('id');
      if (error) {
        throw error;
      }

      const loadedProducts = new Map((data || []).map(product => {
        const mappedProduct = mapDatabaseProduct(product);
        return [mappedProduct.id, mappedProduct];
      }));
      productChangesDuringLoad.current.forEach((product, productId) => {
        if (product) loadedProducts.set(productId, product);
        else loadedProducts.delete(productId);
      });
      productChangesDuringLoad.current.clear();
      hasLoadedProducts.current = true;
      setProducts([...loadedProducts.values()]);
    } catch (error) {
      console.error('Gagal memuat produk dari Supabase:', error);
      setProductsError('Produk tidak dapat dimuat. Periksa koneksi dan konfigurasi Supabase, lalu coba lagi.');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadProducts, 0);
    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  const retryProducts = () => {
    setProductsLoading(true);
    setProductsError('');
    loadProducts();
  };

  useEffect(() => {
    if (!supabase) return undefined;

    const loadAdminSession = async nextSession => {
      setSession(nextSession);
      setAuthError('');
      if (!nextSession) {
        setIsAdmin(false);
        setAdminUsers([]);
        setAdminUsersError('');
        setAuthReady(true);
        return;
      }

      setAuthReady(false);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', nextSession.user.id)
        .maybeSingle();
      if (profileError) {
        console.error('Gagal memverifikasi akses admin:', profileError);
        setIsAdmin(false);
        setAdminUsers([]);
        setAuthError('Akses admin tidak dapat diverifikasi. Periksa koneksi dan konfigurasi Supabase, lalu coba lagi.');
        setAuthReady(true);
        return;
      }

      const adminAccess = profile?.role === 'admin';
      setIsAdmin(adminAccess);

      if (adminAccess) {
        try {
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, email, role, created_at')
            .order('created_at', { ascending: false });
          if (usersError) {
            console.error('Gagal memuat daftar akun admin:', usersError);
            setAdminUsersError('Daftar akun tidak dapat dimuat. Periksa koneksi lalu coba refresh.');
          } else {
            setAdminUsersError('');
          }
          setAdminUsers(users || []);
        } catch (usersError) {
          console.error('Gagal memuat daftar akun admin:', usersError);
          setAdminUsersError('Daftar akun tidak dapat dimuat. Periksa koneksi lalu coba refresh.');
          setAdminUsers([]);
        }
      } else {
        setAdminUsers([]);
        setAdminUsersError('');
      }
      setAuthReady(true);
    };

    let authLoadTimer;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      clearTimeout(authLoadTimer);
      authLoadTimer = setTimeout(() => {
        loadAdminSession(nextSession).catch(error => {
          console.error('Gagal memuat sesi admin:', error);
          setIsAdmin(false);
          setAdminUsers([]);
          setAuthError('Sesi admin tidak dapat dimuat. Periksa koneksi lalu coba lagi.');
          setAuthReady(true);
        });
      }, 0);
    });

    return () => {
      clearTimeout(authLoadTimer);
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleNavigate = (viewName, params = {}) => {
    setCurrentView({ name: viewName, ...params });
    window.scrollTo(0, 0);
  };

  const handleNavigateToHowToOrder = () => {
    setCurrentView({ name: 'home' });
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById('cara-pesan')?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  };

  const handleLogout = async () => {
    setLogoutError('');
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      setSession(null);
      setIsAdmin(false);
      handleNavigate('home');
    } catch (error) {
      console.error('Gagal keluar dari akun admin:', error);
      setLogoutError(`Gagal keluar: ${error.message}`);
    }
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
    if (!hasLoadedProducts.current) {
      productChangesDuringLoad.current.set(product.id, product);
    }
  };

  const handleDeleteProduct = async productId => {
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
    } else {
      throw new Error('Supabase belum dikonfigurasi. Produk tidak dihapus.');
    }
    setProducts(prev => prev.filter(product => product.id !== productId));
    if (!hasLoadedProducts.current) {
      productChangesDuringLoad.current.set(productId, null);
    }
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
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Gagal memuat daftar akun admin:', error);
      throw error;
    }
    setAdminUsers(data || []);
    setAdminUsersError('');
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
          key={currentView.id}
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
          return <AdminAuth onNavigate={handleNavigate} hasSession={Boolean(session)} authError={authError} />;
        }
        return <Admin products={products} adminUsers={adminUsers} adminUsersError={adminUsersError} logoutError={logoutError} onRefreshAdminUsers={handleRefreshAdminUsers} onNavigate={handleNavigate} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} onUploadImage={handleUploadImage} onLogout={handleLogout} />;
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
        onNavigateToHowToOrder={handleNavigateToHowToOrder}
        currentView={currentView.name} 
        onCartOpen={() => setIsCartOpen(true)}
        isAuthenticated={Boolean(session && isAdmin)}
        onLogout={handleLogout}
      />
      
      <main className="flex-grow">
        {(productsLoading || productsError) && (
          <div className="border-b border-gray-200 bg-white px-5 py-3 text-center text-sm text-muted sm:px-8" role="status">
            {productsError ? (
              <span>
                {productsError}{' '}
                <button onClick={retryProducts} className="font-medium text-primary underline underline-offset-2">
                  Coba lagi
                </button>
              </span>
            ) : 'Memuat produk...'}
          </div>
        )}
        {renderView()}
      </main>

      <Footer onNavigate={handleNavigate} onNavigateToHowToOrder={handleNavigateToHowToOrder} />

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