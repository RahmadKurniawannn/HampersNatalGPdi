const Hero = ({ products, onNavigate }) => {
  const heroProduct = products[0];
  return (
    <section className="bg-base overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[85vh] lg:min-h-0">

          {/* Text block: takes 7 of 12 columns, vertically centered with generous padding */}
          <div className="lg:col-span-7 flex flex-col justify-center py-16 lg:py-28 lg:pr-20">
            <p className="mb-6 text-xs font-medium uppercase tracking-widest text-primary">
              Koleksi Natal 2026
            </p>
            <h1 className="mb-7 max-w-3xl font-serif text-5xl leading-[1.05] text-main sm:text-6xl lg:text-7xl">
              Berbagi Sukacita,<br />
              dalam Satu<br />
              Bingkisan.
            </h1>
            <p className="mb-10 max-w-md text-lg font-light leading-relaxed text-muted">
              Hampers Natal GPdI dirancang untuk menyampaikan kasih yang tulus. Pilih, sesuaikan, dan kirimkan kepada mereka yang berarti.
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <button
                onClick={() => onNavigate('catalog')}
                className="bg-primary px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Lihat Hampers
              </button>
              <button
                onClick={() => document.getElementById('cara-pesan')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-b border-main pb-1 text-sm font-medium text-main transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cara memesan
              </button>
            </div>
          </div>

          {/* Image: last 5 columns, flush to edge on desktop */}
          <div className="lg:col-span-5 relative">
            {/* On mobile: fixed-height image block above fold */}
            <div className="relative h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-full overflow-hidden">
              <img
                src={heroProduct?.image}
                alt={heroProduct ? `${heroProduct.name}, hampers Natal GPdI` : 'Hampers Natal GPdI'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-main/85 px-5 py-4 text-white sm:px-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-red-100">Pilihan pembuka</p>
                <p className="mt-2 font-serif text-xl">{heroProduct?.name || 'Koleksi Natal'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
