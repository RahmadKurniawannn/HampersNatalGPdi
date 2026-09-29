import { useState } from 'react';

const Catalog = ({ products, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const filtered = products
    .filter(product => {
      const query = searchQuery.trim().toLowerCase();
      return !query || `${product.name} ${product.description}`.toLowerCase().includes(query);
    })
    .sort((first, second) => {
      if (sortBy === 'price-low') return first.basePrice - second.basePrice;
      if (sortBy === 'price-high') return second.basePrice - first.basePrice;
      return first.id - second.id;
    });

  // First product is the featured one (large), rest go into the grid
  const [featured, ...rest] = filtered;

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="bg-base min-h-screen">
      {/* Page header — left-aligned, not centered */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-10 border-b border-gray-200/60">
        <nav className="text-xs text-muted mb-6 flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-primary transition-colors focus:outline-none focus-visible:underline"
          >
            Beranda
          </button>
          <span>/</span>
          <span className="text-main">Hampers Natal</span>
        </nav>
        <div>
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl text-main">Koleksi Natal 2026</h1>
            <p className="mt-3 text-muted font-light max-w-xl">
              Temukan bingkisan Natal yang tepat untuk orang-orang berarti.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="mb-12 flex flex-col gap-4 border-b border-gray-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Cari hampers</span>
            <input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Cari hampers..."
              className="w-full border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-main outline-none transition-colors placeholder:text-gray-400 focus:border-primary"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden>⌕</span>
          </label>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <p className="text-sm text-muted">{filtered.length} hampers ditemukan</p>
            <label className="flex items-center gap-2 text-sm text-muted">
              <span className="sr-only">Urutkan produk</span>
              <select
                value={sortBy}
                onChange={event => setSortBy(event.target.value)}
                className="border border-gray-300 bg-white px-3 py-3 text-sm text-main outline-none focus:border-primary"
              >
                <option value="featured">Pilihan utama</option>
                <option value="price-low">Harga terendah</option>
                <option value="price-high">Harga tertinggi</option>
              </select>
            </label>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-main">Hampers tidak ditemukan</p>
            <p className="mt-3 text-sm font-light text-muted">Coba gunakan kata kunci lain.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-6 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Reset pencarian
            </button>
          </div>
        )}

        {featured && (
          <>
            <button
              type="button"
              className="group mb-20 grid w-full cursor-pointer grid-cols-1 gap-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:grid-cols-2"
              onClick={() => onNavigate('detail', { id: featured.id })}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
              <div className="bg-white flex flex-col justify-center px-10 py-12 lg:px-16">
                <h2 className="font-serif text-3xl sm:text-4xl text-main mb-4 leading-snug">
                  {featured.name}
                </h2>
                <p className="text-muted font-light leading-relaxed mb-8">
                  {featured.description}
                </p>
                <div className="flex items-center gap-6">
                  <span className="text-xl font-medium text-main">{formatPrice(featured.basePrice)}</span>
                  <span className="text-sm text-primary font-medium group-hover:underline underline-offset-2">
                    Lihat detail
                  </span>
                </div>
              </div>
            </button>

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                {rest.map(product => (
                  <button
                    key={product.id}
                    onClick={() => onNavigate('detail', { id: product.id })}
                    className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                  >
                    <div className="aspect-[4/5] overflow-hidden mb-5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                      />
                    </div>
                    <h3 className="font-serif text-xl text-main mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted font-light mb-3 line-clamp-2">{product.description}</p>
                    <p className="text-base font-medium text-main">{formatPrice(product.basePrice)}</p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Catalog;
