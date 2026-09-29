const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <h2 className="text-3xl font-bold text-main mb-4">Mengapa Memilih GPDI?</h2>
            <p className="text-muted">Kami memastikan setiap bingkisan memberikan kesan mendalam bagi penerimanya.</p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-main mb-2">Pilihan Hampers</h3>
              <p className="text-muted text-sm">Beragam kurasi produk berkualitas tinggi yang disusun secara estetis.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-main mb-2">Proses Pemesanan Mudah</h3>
              <p className="text-muted text-sm">Sistem terintegrasi yang memudahkan Anda mengatur pesanan dalam hitungan menit.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-main mb-2">Cocok untuk Berbagai Momen</h3>
              <p className="text-muted text-sm">Fleksibel untuk keperluan personal, perayaan, hingga kebutuhan korporat.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
