const HowItWorks = () => {
  return (
    <section id="cara-pesan" className="py-24 bg-base border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-main">Cara Pesan</h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto">Proses pemesanan yang sederhana untuk kenyamanan Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center">
            <span className="text-6xl font-light text-gray-300 mb-6">01</span>
            <h3 className="text-xl font-semibold text-main mb-3">Pilih Hampers</h3>
            <p className="text-muted">Telusuri katalog kami dan temukan hampers yang paling sesuai dengan kebutuhan dan budget Anda.</p>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center">
            <span className="text-6xl font-light text-gray-300 mb-6">02</span>
            <h3 className="text-xl font-semibold text-main mb-3">Atur Pesanan</h3>
            <p className="text-muted">Tentukan alamat pengiriman, tanggal pengiriman, dan tambahkan pesan personal Anda.</p>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center text-center">
            <span className="text-6xl font-light text-gray-300 mb-6">03</span>
            <h3 className="text-xl font-semibold text-main mb-3">Selesaikan Pesanan</h3>
            <p className="text-muted">Lakukan pembayaran melalui metode yang tersedia. Kami akan segera memproses pesanan Anda.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
