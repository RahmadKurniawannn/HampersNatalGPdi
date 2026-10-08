import logo from '../assets/GPDI.png';

const Footer = ({ onNavigate, onNavigateToHowToOrder }) => {
  return (
    <footer className="bg-primary-dark pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <div className="mb-14 flex flex-col gap-7 border-b border-red-100/15 pb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-widest text-red-100/65">Natal dimulai dari perhatian</p>
            <h2 className="mt-3 max-w-lg font-serif text-3xl leading-tight text-white sm:text-4xl">
              Temukan bingkisan untuk orang yang berarti.
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="self-start border border-red-100/70 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:self-auto"
          >
            Lihat koleksi
          </button>
        </div>

        {/* Top row */}
        <div className="grid grid-cols-1 gap-12 border-b border-red-100/15 pb-12 sm:grid-cols-3">

          {/* Brand column */}
          <div className="sm:col-span-1">
            <div className="mb-5 inline-flex bg-white p-2">
              <img
                src={logo}
                alt="GPdI"
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="max-w-xs text-sm font-light leading-relaxed text-red-100/65">
              Hampers Natal GPdI. Dirangkai dengan perhatian, dikirim dengan kasih.
            </p>
          </div>

          {/* Links column */}
          <div>
            <p className="mb-5 text-xs font-medium uppercase tracking-widest text-white">Jelajahi</p>
            <ul className="space-y-3 text-sm font-light text-red-100/65">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors focus:outline-none focus-visible:underline"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-white transition-colors focus:outline-none focus-visible:underline"
                >
                  Hampers Natal
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToHowToOrder}
                  className="hover:text-white transition-colors focus:outline-none focus-visible:underline"
                >
                  Cara Pesan
                </button>
              </li>
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <p className="mb-5 text-xs font-medium uppercase tracking-widest text-white">Bicarakan pesanan</p>
            <ul className="space-y-3 text-sm font-light text-red-100/65">
              <li>
                <a href="mailto:halo@gpdi-hampers.com" className="transition-colors hover:text-white focus:outline-none focus-visible:underline">halo@gpdi-hampers.com</a>
              </li>
              <li>
                <a href="https://wa.me/6281378153463" target="_blank" rel="noreferrer" className="transition-colors hover:text-white focus:outline-none focus-visible:underline">WhatsApp: +62 813-7815-3463</a>
              </li>
              <li className="pt-2 text-xs leading-relaxed text-red-100/45">Admin membantu konfirmasi transaksi dan pilihan pengiriman.</li>
            </ul>
          </div>

        </div>

        {/* Bottom row */}
        <div className="flex flex-col gap-2 pt-7 text-xs font-light text-red-100/40 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} GPdI Hampers. Hak Cipta Dilindungi.</span>
          <span>Dirangkai dengan perhatian.</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
