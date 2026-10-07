const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);

const CartDrawer = ({ items, total, isOpen, onClose, onRemove, onClear, onOrder }) => (
  <>
    {isOpen && (
      <button
        className="fixed inset-0 z-50 bg-main/30 cursor-default"
        onClick={onClose}
        aria-label="Tutup keranjang"
      />
    )}

    <aside
      className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-base shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'}`}
      aria-hidden={!isOpen}
      inert={!isOpen}
      aria-label="Keranjang belanja"
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-5 sm:px-7">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary">Pesananmu</p>
          <h2 className="mt-1 font-serif text-2xl text-main">Keranjang</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-muted transition-colors hover:text-main focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Tutup keranjang"
        >
          <span className="text-2xl leading-none" aria-hidden>&times;</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="font-serif text-2xl text-main">Keranjang masih kosong</p>
          <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-muted">
            Pilih hampers favoritmu dan pesanan akan muncul di sini.
          </p>
          <button
            onClick={onClose}
            className="mt-7 bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Lihat koleksi
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
            <div className="space-y-6">
              {items.map((item, index) => (
                <article key={`${item.product.id}-${index}`} className="flex gap-4 border-b border-gray-200 pb-6">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-24 w-20 flex-shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-serif text-lg leading-tight text-main">{item.product.name}</h3>
                      <button
                        onClick={() => onRemove(index)}
                        className="text-xs text-muted underline-offset-2 hover:text-primary hover:underline focus:outline-none focus-visible:underline"
                        aria-label={`Hapus ${item.product.name}`}
                      >
                        Hapus
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted">Jumlah: {item.quantity}</p>
                    {(item.greetingFrom || item.greetingTo) && (
                      <div className="mt-2 space-y-1 text-xs leading-relaxed text-muted">
                        {item.greetingFrom && <p>Dari: {item.greetingFrom}</p>}
                        {item.greetingTo && <p>Untuk: {item.greetingTo}</p>}
                      </div>
                    )}
                    <p className="mt-3 text-sm font-medium text-main">{formatPrice(item.totalPrice)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white px-5 py-5 sm:px-7">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="font-serif text-2xl text-main">{formatPrice(total)}</span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-muted">
              Biaya pengiriman akan dikonfirmasi setelah detail pesanan dikirim.
            </p>
            <button
              onClick={onOrder}
              className="w-full bg-primary py-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Order Sekarang
            </button>
            <button
              onClick={onClear}
              className="mt-3 w-full py-2 text-xs text-muted transition-colors hover:text-primary focus:outline-none focus-visible:underline"
            >
              Kosongkan keranjang
            </button>
          </div>
        </>
      )}
    </aside>
  </>
);

export default CartDrawer;