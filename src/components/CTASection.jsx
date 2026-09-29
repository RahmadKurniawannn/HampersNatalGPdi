const CTASection = ({ onNavigate }) => {
  return (
    <section className="bg-primary py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 leading-tight">
          Sudah menemukan hampers untuk momen Natal yang spesial?
        </h2>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="inline-flex justify-center items-center px-10 py-4 bg-white text-primary font-medium hover:bg-gray-100 transition-colors">
          Lihat Catalog
        </a>
      </div>
    </section>
  );
};

export default CTASection;
