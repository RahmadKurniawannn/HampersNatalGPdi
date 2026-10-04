import { useState, useEffect } from 'react';

const ProductDetail = ({ productId, products, onNavigate, onAddToCart, onOrderNow }) => {
  const [quantity, setQuantity] = useState(1);
  const [greetingFrom, setGreetingFrom] = useState('');
  const [greetingTo, setGreetingTo] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const product = products.find(item => item.id === productId) || null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <p className="text-muted font-light">Produk tidak ditemukan.</p>
      </div>
    );
  }

  const total = product.basePrice * quantity;

  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  const handleAddToCart = () => {
    onAddToCart({ product, quantity, greetingFrom, greetingTo, totalPrice: total });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  const handleOrderNow = () => {
    onOrderNow({ product, quantity, greetingFrom, greetingTo, totalPrice: total });
  };

  return (
    <div className="bg-base min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-0">
        <nav className="text-xs text-muted flex items-center gap-2" aria-label="Navigasi halaman">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-primary transition-colors focus:outline-none focus-visible:underline"
          >
            Beranda
          </button>
          <span aria-hidden>/</span>
          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex min-h-10 items-center gap-2 border border-gray-300 px-3 text-sm text-main transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span aria-hidden="true">&larr;</span>
            Kembali ke katalog
          </button>
          <span aria-hidden>/</span>
          <span className="text-main">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* LEFT: image (5 cols) — sticky on desktop */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-3 text-xs text-muted font-light">
                Berat: {product.weight}
              </p>
            </div>
          </div>

          {/* RIGHT: content (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">

            <p className="mb-3 text-sm text-primary">{product.category || 'Hampers'}</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-main leading-tight mb-4">
              {product.name}
            </h1>

            {/* Base price */}
            <p className="text-2xl font-medium text-main mb-6">{fmt(product.basePrice)}</p>

            <p className="text-muted font-light leading-relaxed mb-10 max-w-lg">
              {product.description}
            </p>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-10" />

            {/* Included items — plain list, no card wrapper */}
            <div className="mb-10">
              <h2 className="font-serif text-xl text-main mb-5">Yang sudah termasuk</h2>
              <ul className="space-y-3">
                {product.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-main font-light">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Greeting message */}
            <div className="mb-10">
              <h2 className="font-serif text-xl text-main mb-2">Pesan hangat</h2>
              <p className="text-sm text-muted font-light mb-4">
                Isi nama pengirim dan penerima untuk kartu ucapan. Opsional.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm text-main">
                  Dari saya
                  <input
                    type="text"
                    maxLength={60}
                    value={greetingFrom}
                    onChange={event => setGreetingFrom(event.target.value)}
                    placeholder="Nama pengirim"
                    className="mt-2 w-full border border-gray-200 bg-white px-4 py-3 text-sm font-light text-main outline-none transition-colors placeholder:text-gray-400 focus:border-primary"
                  />
                </label>
                <label className="text-sm text-main">
                  Untuk dia
                  <input
                    type="text"
                    maxLength={60}
                    value={greetingTo}
                    onChange={event => setGreetingTo(event.target.value)}
                    placeholder="Nama penerima"
                    className="mt-2 w-full border border-gray-200 bg-white px-4 py-3 text-sm font-light text-main outline-none transition-colors placeholder:text-gray-400 focus:border-primary"
                  />
                </label>
              </div>
            </div>

            {/* Divider before order summary */}
            <div className="border-t border-gray-200 mb-8" />

            {/* Price breakdown */}
            <div className="mb-6 space-y-2 text-sm">
              <div className="flex justify-between text-muted font-light">
                <span>{product.name}</span>
                <span>{fmt(product.basePrice)}</span>
              </div>
              <div className="flex justify-between text-muted font-light">
                <span>Jumlah</span>
                <span>x{quantity}</span>
              </div>
            </div>

            {/* Quantity + total + CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Quantity */}
              <div className="flex items-center border border-gray-300 bg-white flex-shrink-0">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-main hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary text-lg"
                  aria-label="Kurangi jumlah"
                >
                  &minus;
                </button>
                <span className="w-10 text-center text-main font-medium" aria-live="polite">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-11 h-11 flex items-center justify-center text-main hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary text-lg"
                  aria-label="Tambah jumlah"
                >
                  +
                </button>
              </div>

              {/* Total */}
              <div className="flex-grow">
                <p className="text-xs text-muted mb-0.5">Total</p>
                <p className="font-serif text-3xl text-main">{fmt(total)}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`w-full border border-primary py-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isAdded
                    ? 'bg-main text-white cursor-default border-main'
                    : 'text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isAdded ? 'Sudah ditambahkan' : 'Masukkan ke Keranjang'}
              </button>
              <button
                onClick={handleOrderNow}
                className="w-full bg-primary py-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Order Sekarang
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
