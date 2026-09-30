// src/components/ProductCard.jsx

const ProductCard = ({ product, onClick }) => {
  // Determine if product is new (e.g., created in the last 30 days)
  const isNew = (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24) < 30;

  return (
    <div onClick={() => onClick(product)} className="group cursor-pointer">
      {/* bg-velvet, not a panel tone: the photos are cut on near-black, so any
          lighter surface here would outline each one as a rectangle. No border,
          no radius, no shadow at rest -- the photo should simply float. */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-velvet transition-shadow duration-500 group-hover:shadow-[0_0_60px_-10px_rgba(201,169,110,0.28)]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        {/* Thin gold frame, inset so it reads as a mount rather than a border. */}
        <div className="pointer-events-none absolute inset-4 border border-gold/0 group-hover:border-gold/40 transition-colors duration-500" />

        {isNew && (
          <span className="absolute top-5 left-5 label-caps text-gold text-[10px] z-10">
            New
          </span>
        )}
      </div>

      <div className="pt-7 pb-2 flex flex-col items-center text-center">
        <h3 className="font-serif font-light text-2xl text-ivory mb-2">{product.name}</h3>
        <p className="label-caps text-faint text-[10px] mb-4">{product.category}</p>
        <p className="label-caps text-gold">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
