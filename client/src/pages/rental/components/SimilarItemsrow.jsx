import RentalItemCard from './RentalItemCard';


// `items` = the `similarItems` array returned by GET /rentals/items/:itemId
export default function SimilarItemsRow({ items, categoryLabel, onOpenItem }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="flex items-end justify-between mb-4">
        <h2 className="font-serif text-xl sm:text-2xl text-[#221B1D]">
          Similar {categoryLabel ? categoryLabel.toLowerCase() : 'items'}
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <RentalItemCard key={item._id} item={item} onOpen={onOpenItem} />
        ))}
      </div>
    </section>
  );
}