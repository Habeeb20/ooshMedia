import { useEffect, useState } from 'react';
import { rentalApi } from '../../api/rentalApi';

const UNIT_MS = { hour: 3600000, day: 86400000, week: 604800000, month: 2592000000 };

export default function BookingForm({ item }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupOption, setPickupOption] = useState('self-pickup');
  const [pickupTime, setPickupTime] = useState('');
  const [address, setAddress] = useState({ address: '', city: '', area: '' });
  const [availability, setAvailability] = useState(null); // null | true | false
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!startDate || !endDate) return setAvailability(null);
    setChecking(true);
    rentalApi
      .checkAvailability(item._id, startDate, endDate)
      .then((res) => setAvailability(res.available))
      .finally(() => setChecking(false));
  }, [startDate, endDate, item._id]);

  const units =
    startDate && endDate
      ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / UNIT_MS[item.rate.unit]))
      : 0;
  const rentAmount = units * item.rate.amount;
  const deliveryFee = pickupOption === 'delivery' ? item.deliveryFee || 0 : 0;
  const total = rentAmount + (item.depositAmount || 0) + deliveryFee;

  const canSubmit =
    startDate &&
    endDate &&
    pickupTime &&
    availability === true &&
    (pickupOption === 'self-pickup' || (address.address && address.city && address.area));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await rentalApi.createBooking(item._id, {
        startDate,
        endDate,
        pickupOption,
        pickupTime,
        deliveryAddress: pickupOption === 'delivery' ? address : undefined,
      });
      window.location.href = res.authorizationUrl; // hand off to Paystack
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-[#E7DEE1] bg-white p-5">
      <div>
        <h3 className="font-medium text-[#221B1D]">Reserve this item</h3>
        <p className="text-sm text-[#6B6067] mt-0.5">
          ₦{item.rate.amount.toLocaleString()} per {item.rate.unit}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#221B1D] mb-1.5">From</label>
          <input
            type="date"
            required
            value={startDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-[#E7DEE1] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] focus:border-[#8B1E3F]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#221B1D] mb-1.5">To</label>
          <input
            type="date"
            required
            value={endDate}
            min={startDate || new Date().toISOString().slice(0, 10)}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-[#E7DEE1] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] focus:border-[#8B1E3F]"
          />
        </div>
      </div>

      {startDate && endDate && (
        <p className={`text-sm ${checking ? 'text-[#6B6067]' : availability ? 'text-[#2F6846]' : 'text-[#B3261E]'}`}>
          {checking ? 'Checking availability…' : availability ? 'Available for these dates' : 'Not available — try different dates'}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-[#221B1D] mb-1.5">Pickup</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPickupOption('self-pickup')}
            className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              pickupOption === 'self-pickup'
                ? 'border-[#8B1E3F] bg-[#F3E4E8] text-[#8B1E3F]'
                : 'border-[#E7DEE1] text-[#6B6067]'
            }`}
          >
            I'll pick it up
          </button>
          <button
            type="button"
            disabled={!item.deliveryAvailable}
            onClick={() => setPickupOption('delivery')}
            className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              pickupOption === 'delivery'
                ? 'border-[#8B1E3F] bg-[#F3E4E8] text-[#8B1E3F]'
                : 'border-[#E7DEE1] text-[#6B6067]'
            }`}
          >
            Deliver to me
          </button>
        </div>
      </div>

      {pickupOption === 'delivery' && (
        <div className="space-y-3">
          <input
            required
            placeholder="Delivery address"
            value={address.address}
            onChange={(e) => setAddress({ ...address, address: e.target.value })}
            className="w-full rounded-lg border border-[#E7DEE1] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] focus:border-[#8B1E3F]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="w-full rounded-lg border border-[#E7DEE1] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] focus:border-[#8B1E3F]"
            />
            <input
              required
              placeholder="Area"
              value={address.area}
              onChange={(e) => setAddress({ ...address, area: e.target.value })}
              className="w-full rounded-lg border border-[#E7DEE1] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] focus:border-[#8B1E3F]"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#221B1D] mb-1.5">
          {pickupOption === 'delivery' ? 'Preferred delivery time' : 'Pickup time'}
        </label>
        <input
          type="datetime-local"
          required
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          className="w-full rounded-lg border border-[#E7DEE1] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] focus:border-[#8B1E3F]"
        />
      </div>

      {units > 0 && (
        <div className="rounded-lg bg-[#FAF6F7] p-3.5 text-sm space-y-1.5">
          <div className="flex justify-between text-[#6B6067]">
            <span>
              {units} {item.rate.unit}(s) × ₦{item.rate.amount.toLocaleString()}
            </span>
            <span>₦{rentAmount.toLocaleString()}</span>
          </div>
          {item.depositAmount > 0 && (
            <div className="flex justify-between text-[#6B6067]">
              <span>Deposit</span>
              <span>₦{item.depositAmount.toLocaleString()}</span>
            </div>
          )}
          {deliveryFee > 0 && (
            <div className="flex justify-between text-[#6B6067]">
              <span>Delivery fee</span>
              <span>₦{deliveryFee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-[#221B1D] pt-1.5 border-t border-[#E7DEE1]">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-[#B3261E]">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="w-full rounded-lg bg-[#8B1E3F] text-white font-medium py-3 hover:bg-[#5E1329] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? 'Starting payment…' : `Pay ₦${total.toLocaleString()} & reserve`}
      </button>
    </form>
  );
}