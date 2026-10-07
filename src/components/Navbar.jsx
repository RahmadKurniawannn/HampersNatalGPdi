import { useState } from 'react';
import logo from '../assets/GPDI.png';

const Navbar = ({ cartCount = 0, onNavigate, onNavigateToHowToOrder, currentView, onCartOpen, isAuthenticated, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNav = (e, view) => {
    e.preventDefault();
    onNavigate(view);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-base/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex h-[4.75rem] items-center justify-between">

          {/* Logo */}
          <button
            onClick={(e) => handleNav(e, 'home')}
            className="flex flex-shrink-0 items-center gap-3 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <img src={logo} alt="GPdI" className="h-10 w-auto" />
            <span className="hidden border-l border-gray-300 pl-3 text-left sm:block">
              <span className="block text-[10px] font-medium tracking-[0.18em] text-primary">GPdI</span>
              <span className="mt-0.5 block font-serif text-sm text-main">Hampers Natal</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            <button
              onClick={(e) => handleNav(e, 'catalog')}
              className={`border-b-2 pb-1 text-sm transition-colors ${
                currentView === 'catalog' || currentView === 'detail'
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-main hover:border-primary hover:text-primary'
              } focus:outline-none focus-visible:underline`}
            >
              Katalog Produk
            </button>
            <button
              onClick={() => onNavigateToHowToOrder()}
              className={`border-b-2 pb-1 text-sm transition-colors ${currentView === 'home' ? 'border-primary font-medium text-primary' : 'border-transparent text-main hover:border-primary hover:text-primary'} focus:outline-none focus-visible:underline`}
            >
              Cara Pesan
            </button>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-5 md:flex">
            <button
              onClick={onCartOpen}
              className={`border border-gray-300 px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${cartCount > 0 ? 'border-primary font-medium text-primary' : 'text-muted hover:border-main hover:text-main'}`}
              aria-label={`Buka keranjang, ${cartCount} item`}
            >
              Keranjang{cartCount > 0 ? ` (${cartCount})` : ''}
            </button>
            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="rounded-sm border border-primary px-5 py-2 text-sm text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Keluar
              </button>
            ) : (
              <button
                onClick={() => onNavigate('admin')}
                className={`rounded-sm px-5 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${currentView === 'admin' ? 'bg-primary-dark text-white' : 'bg-primary text-white hover:bg-primary-dark'}`}
                aria-current={currentView === 'admin' ? 'page' : undefined}
              >
                Kelola
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-main p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200/80 bg-base">
          <div className="px-5 py-6 flex flex-col gap-5">
            <button
              onClick={(e) => handleNav(e, 'catalog')}
              className="text-left text-lg text-main hover:text-primary transition-colors focus:outline-none"
            >
              Katalog Produk
            </button>
            <button
              onClick={() => {
                onNavigateToHowToOrder();
                setIsOpen(false);
              }}
              className="text-left text-lg text-main hover:text-primary transition-colors focus:outline-none"
            >
              Cara Pesan
            </button>
            <div className="border-t border-gray-200/80 pt-5 flex items-center justify-between">
              <button
                onClick={onCartOpen}
                className="text-sm text-muted hover:text-main transition-colors"
              >
                {cartCount > 0 ? `Keranjang (${cartCount})` : 'Keranjang kosong'}
              </button>
              {isAuthenticated ? (
                <button onClick={onLogout} className="text-sm text-primary underline underline-offset-4">
                  Keluar
                </button>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setIsOpen(false);
                  }}
                  className="text-sm text-white bg-primary px-5 py-2"
                >
                  Kelola
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
