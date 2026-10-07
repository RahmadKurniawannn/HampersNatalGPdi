import Hero from '../components/Hero';
import tutorialVideo from '../assets/tutorial_cara_memesan.mp4';

const Home = ({ products, onNavigate }) => {
  const featuredProducts = products.slice(0, 3);
  const formatPrice = price => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <>
      <Hero products={products} onNavigate={onNavigate} />

      <section className="border-b border-gray-200 bg-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">Dirangkai dengan perhatian</p>
              <h2 className="mt-5 max-w-lg font-serif text-3xl leading-tight text-main sm:text-5xl">
                Hadiah yang terasa personal, bahkan sebelum dibuka.
              </h2>
            </div>

            <div className="space-y-6 text-lg font-light leading-relaxed text-muted lg:col-span-6 lg:col-start-7">
              <p>
                Setiap hampers Natal GPdI disusun dari pilihan yang hangat, rapi, dan siap diberikan kepada orang yang berarti. Isinya bukan sekadar kumpulan produk, tetapi cara sederhana untuk menyampaikan perhatian.
              </p>
              <p>
                Pilih Hampers, tambahkan sentuhan personal, lalu tentukan apakah bingkisan akan diantar ke rumah atau diambil di gereja.
              </p>
              <button
                onClick={() => onNavigate('catalog')}
                className="mt-2 inline-block border-b border-primary pb-1 text-sm font-medium text-primary transition-colors hover:border-primary-dark hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Temukan hampers untuk mereka
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-main text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/15 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            ['01', 'Pilih dari rumah', 'Koleksi tersedia untuk kamu lihat dan sesuaikan kapan saja.'],
            ['02', 'Antar atau ambil', 'Tentukan cara menerima pesanan saat mengisi detail order.'],
            ['03', 'Selesaikan via WhatsApp', 'Admin GPdI membantu konfirmasi transaksi dan pengiriman.'],
          ].map(([number, title, description]) => (
            <div key={number} className="flex gap-4 py-6 md:px-7 md:py-8 first:pl-0 last:pr-0">
              <span className="font-serif text-xl text-red-200">{number}</span>
              <div>
                <h2 className="text-sm font-medium">{title}</h2>
                <p className="mt-2 text-sm font-light leading-relaxed text-white/65">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-base py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary">Koleksi Hampers</p>
              <h2 className="mt-3 font-serif text-3xl text-main sm:text-4xl">Satu untuk setiap cerita</h2>
            </div>
            <button
              onClick={() => onNavigate('catalog')}
              className="self-start text-sm font-medium text-primary underline decoration-primary underline-offset-4 transition-colors hover:text-primary-dark sm:self-auto"
            >
              Lihat semua hampers
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => onNavigate('detail', { id: product.id })}
                className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl text-main transition-colors group-hover:text-primary">{product.name}</h3>
                  </div>
                  <p className="whitespace-nowrap text-sm font-medium text-main">{formatPrice(product.basePrice)}</p>
                </div>
                <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-muted">{product.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="cara-pesan" className="border-y border-gray-200 bg-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">Cara memesan</p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-main sm:text-4xl">Dari pilihan kecil menjadi perhatian besar.</h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <div className="divide-y divide-gray-200 border-y border-gray-200">
                {[
                  ['01', 'Pilih hampers', 'Temukan koleksi yang paling sesuai untuk keluarga, sahabat, atau rekan kerja.'],
                  ['02', 'Pesan hangat', 'Isi nama pengirim dan penerima pada kartu ucapan.'],
                  ['03', 'Kirim detail order', 'Pilih antar atau ambil di gereja, lalu kirim ringkasannya ke WhatsApp GPdI.'],
                ].map(([number, title, description]) => (
                  <div key={number} className="grid grid-cols-[3rem_1fr] gap-5 py-6 sm:grid-cols-[4rem_1fr] sm:gap-7">
                    <span className="font-serif text-2xl text-primary">{number}</span>
                    <div>
                      <h3 className="text-base font-medium text-main">{title}</h3>
                      <p className="mt-2 max-w-lg text-sm font-light leading-relaxed text-muted">{description}</p>
                    </div>  
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-14 border-t border-gray-200 pt-10">
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Video panduan</p>
            <h3 className="mt-3 font-serif text-2xl text-main sm:text-3xl">Cara memesan hampers</h3>
            <video
              controls
              playsInline
              preload="metadata"
              className="mx-auto mt-6 block max-h-[75svh] w-full max-w-5xl border-8 border-gray-800 bg-main object-contain"
              aria-label="Video panduan cara memesan hampers"
            >
              <source src={tutorialVideo} type="video/mp4" />
              Browser Anda tidak mendukung pemutar video.
            </video>
          </div>
        </div>
      </section>

    </>
  );
};

export default Home;
