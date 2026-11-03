import type { ProductCard as Card } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import { LLink as Link } from "./LLink";
import { WishlistButton } from "./WishlistButton";

type Priced = Pick<Card, "minPrice" | "maxPrice" | "price" | "salePrice" | "hasVariations">;

/** One price (no ranges): for variable products price/salePrice are those of the default variation */
export function PriceTag({ p, className = "" }: { p: Priced; className?: string }) {
  if (p.salePrice !== null && p.salePrice < p.price) {
    return (
      <span className={className}>
        <del className="mr-2 text-muted">{formatPrice(p.price)}</del>
        {formatPrice(p.salePrice)}
      </span>
    );
  }
  return <span className={className}>{formatPrice(p.price)}</span>;
}

export function ProductCard({ product }: { product: Card }) {
  const [first, second] = product.images;
  const colorAttr = product.attributes.find((a) => a.type === "color" && a.values.length > 1);
  return (
    <div className="card-lift group relative h-full border border-line bg-white">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[338/383] overflow-hidden bg-[#f6f6f6]">
        {first && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={first}
            alt={product.name}
            loading="lazy"
            className={`absolute inset-0 size-full object-cover transition duration-700 ${second ? "group-hover:opacity-0" : "group-hover:scale-105"}`}
          />
        )}
        {second && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={second}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full scale-105 object-cover opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100"
          />
        )}
      </Link>
      <div className="absolute right-3 top-3 translate-x-2 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 max-lg:translate-x-0 max-lg:opacity-100">
        <WishlistButton product={product} className="flex size-9 items-center justify-center rounded-full bg-white text-ink shadow" />
      </div>
      <div className="border-t border-line px-3 pb-4 pt-4 text-center">
        {product.category && (
          <Link href={`/product-category/${product.category.slug}`} className="text-xs uppercase tracking-wide text-muted hover:text-ink">
            {product.category.name}
          </Link>
        )}
        <h3 className="mt-1.5 text-[15px] text-ink">
          <Link href={`/product/${product.slug}`} className="link-draw">
            {product.name}
          </Link>
        </h3>
        <PriceTag p={product} className="mt-1 block text-lg text-ink" />
        {colorAttr && (
          <div className="mt-2 flex justify-center gap-1.5">
            {colorAttr.values.slice(0, 6).map((v) => (
              <span key={v} title={v} className="size-3.5 rounded-full ring-1 ring-black/15" style={{ background: colorAttr.colors?.[v] }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
