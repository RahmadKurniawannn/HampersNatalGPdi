const ProductCard = ({ product, onClick }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="group flex flex-col cursor-pointer" onClick={() => onClick(product.id)}>
      <div className="relative aspect-[4/5] bg-gray-100 mb-4 overflow-hidden border border-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div>
        <h3 className="text-lg font-medium text-main mb-1">{product.name}</h3>
        <p className="text-sm text-muted mb-2 line-clamp-2">{product.description}</p>
        <div className="text-main font-semibold text-lg">{formatPrice(product.basePrice)}</div>
      </div>
      <div className="mt-4 mt-auto pt-2">
        <button className="w-full py-2.5 border border-main text-main font-medium group-hover:bg-main group-hover:text-white transition-colors text-sm">
          Lihat Detail
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
