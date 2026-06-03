// components/ContractCard.jsx
export default function ContractCard({ contract }) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{contract.job?.title}</h3>
          <p className="text-emerald-600 font-medium mt-1">
            ${contract.totalAmount}
          </p>
        </div>
        <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
          {contract.status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Client</p>
          <p className="font-medium">{contract.client?.name}</p>
        </div>
        <div>
          <p className="text-gray-500">Provider</p>
          <p className="font-medium">{contract.provider?.name}</p>
        </div>
      </div>

      <button className="mt-6 w-full bg-gray-900 text-white py-3 rounded-2xl hover:bg-black transition">
        View Contract
      </button>
    </div>
  );
}