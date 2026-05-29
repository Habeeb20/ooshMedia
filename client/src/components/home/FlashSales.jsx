
import CategorySlider from "./CategorySidebar";
import appConfig from "../../config/appConfig";


const products = [
  {
    id: 1,
    title: "Apple Watch Series 9",
    price: "₦350,000",
    oldPrice: "₦450,000",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Sony Headphones",
    price: "₦180,000",
    oldPrice: "₦240,000",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Nike Sneakers",
    price: "₦120,000",
    oldPrice: "₦170,000",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function FlashSales() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <CategorySlider
        title="⚡ Flash Sales"
        products={products}
        // bg={appConfig.colors.primary}
        titleColor="black"
      />
    </div>
  );
}