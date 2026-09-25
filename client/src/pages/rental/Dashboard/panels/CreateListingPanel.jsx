
import RentalItemForm from '../../components/RentalItemForm';

export default function CreateListingPanel({ onCreated }) {
  return (
    <div>
      <h1 className="font-serif text-2xl text-[#221B1D] mb-1">List a new item</h1>
      <p className="text-[#6B6067] mb-6">Fill in the details below — it goes live as soon as you publish.</p>
      <RentalItemForm onCreated={onCreated} />
    </div>
  );
}