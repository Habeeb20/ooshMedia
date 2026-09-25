import { useMemo, useState } from 'react';
import { rentalApi } from '../api/rentalApi';
import rentalCategories from '../utils/RentalCategories';

import MediaUploader from '../utils/MediaUploader';

const initialState = {
  title: '',
  description: '',
  category: '',
  subcategory: '',
  images: [],
  videos: [],
  rate: { amount: '', unit: 'day' },
  depositAmount: '',
  pickupLocation: { address: '', city: '', area: '' },
  deliveryAvailable: false,
  deliveryFee: '',
};

const inputClasses =
  'w-full rounded-lg border border-[#E7DEE1] px-3.5 py-2.5 text-[#221B1D] placeholder:text-[#B4A9AC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] focus:border-[#8B1E3F] disabled:bg-[#FAF7F8] disabled:text-[#B4A9AC] disabled:cursor-not-allowed';

const label = 'block text-sm font-medium text-[#221B1D] mb-1.5';

function SectionIcon({ children }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F]">
      {children}
    </span>
  );
}

function Section({ icon, title, subtitle, children }) {
  return (
    <section className="py-7 first:pt-0 last:pb-0 border-t border-[#F0E9EC] first:border-t-0">
      <div className="flex items-start gap-3 mb-4">
        <SectionIcon>{icon}</SectionIcon>
        <div>
          <h2 className="text-base font-semibold text-[#221B1D]">{title}</h2>
          {subtitle && <p className="text-sm text-[#6B6067] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="pl-11 space-y-4">{children}</div>
    </section>
  );
}

// Small line-icon set, currentColor only, sized for the 32px badge above
const icons = {
  details: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M4 4.5h12M4 9h12M4 13.5h7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M10.5 3.5H6a1 1 0 0 0-.7.3L3.3 5.8a1 1 0 0 0 0 1.4l7.5 7.5a1 1 0 0 0 1.4 0l4-4a1 1 0 0 0 0-1.4l-4.7-4.7a1 1 0 0 0-.7-.3H10.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="0.9" fill="currentColor" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M3 7a1 1 0 0 1 1-1h1.5l.9-1.4a1 1 0 0 1 .84-.6h3.52a1 1 0 0 1 .84.6L12.5 6H14a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  naira: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M6 3.5v13M14 3.5v13M4 7.5h12M4 12.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M10 17.5S15 12.4 15 8.5a5 5 0 0 0-10 0c0 3.9 5 9 5 9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8.3" r="1.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M2.5 5.5h8v7h-8v-7zM10.5 8.5h3.2l2.3 2.3v1.7h-5.5v-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="5.5" cy="14" r="1.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13" cy="14" r="1.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

export default function RentalItemForm({ onCreated }) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const selectedCategory = useMemo(
    () => rentalCategories.find((c) => c.name === form.category),
    [form.category]
  );

  const handleCategoryChange = (e) => {
    // Reset subcategory whenever the parent category changes
    update({ category: e.target.value, subcategory: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.images.length === 0) return setError('Add at least one photo.');
    setSubmitting(true);
    try {
      const res = await rentalApi.createItem({
        ...form,
        rate: { ...form.rate, amount: Number(form.rate.amount) },
        depositAmount: Number(form.depositAmount) || 0,
        deliveryFee: Number(form.deliveryFee) || 0,
      });
      onCreated?.(res.item);
      setForm(initialState);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#221B1D]">List an item</h1>
        <p className="text-sm text-[#6B6067] mt-1">Add the details below and publish it to the marketplace.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#E7DEE1] bg-white px-6 py-2 sm:px-8"
      >
        <Section icon={icons.details} title="What are you renting out?">
          <div>
            <label className={label}>Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. Canon EOS R6 camera kit"
              className={inputClasses}
            />
          </div>
          <div>
            <label className={label}>Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Condition, what's included, and anything a renter should know before booking"
              className={`${inputClasses} resize-none`}
            />
          </div>
        </Section>

        <Section icon={icons.tag} title="Category">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>Category</label>
              <select
                required
                value={form.category}
                onChange={handleCategoryChange}
                className={inputClasses}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {rentalCategories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={label}>Sub-category</label>
              <select
                required
                value={form.subcategory}
                onChange={(e) => update({ subcategory: e.target.value })}
                disabled={!selectedCategory}
                className={inputClasses}
              >
                <option value="" disabled>
                  {selectedCategory ? 'Select a sub-category' : 'Select a category first'}
                </option>
                {selectedCategory?.subCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        <Section icon={icons.camera} title="Photos & videos" subtitle="At least one photo is required">
          <MediaUploader images={form.images} videos={form.videos} onChange={update} />
        </Section>

        <Section icon={icons.naira} title="Pricing & deposit">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Rate</label>
              <input
                required
                type="number"
                min="0"
                value={form.rate.amount}
                onChange={(e) => update({ rate: { ...form.rate, amount: e.target.value } })}
                placeholder="Amount in ₦"
                className={inputClasses}
              />
            </div>
            <div>
              <label className={label}>Per</label>
              <select
                value={form.rate.unit}
                onChange={(e) => update({ rate: { ...form.rate, unit: e.target.value } })}
                className={inputClasses}
              >
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Security deposit (optional)</label>
            <input
              type="number"
              min="0"
              value={form.depositAmount}
              onChange={(e) => update({ depositAmount: e.target.value })}
              placeholder="₦0"
              className={inputClasses}
            />
          </div>
        </Section>

        <Section icon={icons.pin} title="Pickup location">
          <input
            required
            placeholder="Address"
            value={form.pickupLocation.address}
            onChange={(e) => update({ pickupLocation: { ...form.pickupLocation, address: e.target.value } })}
            className={inputClasses}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="City"
              value={form.pickupLocation.city}
              onChange={(e) => update({ pickupLocation: { ...form.pickupLocation, city: e.target.value } })}
              className={inputClasses}
            />
            <input
              required
              placeholder="Area"
              value={form.pickupLocation.area}
              onChange={(e) => update({ pickupLocation: { ...form.pickupLocation, area: e.target.value } })}
              className={inputClasses}
            />
          </div>
        </Section>

        <Section icon={icons.truck} title="Delivery">
          <div className="flex items-center justify-between rounded-lg border border-[#E7DEE1] px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-[#221B1D]">Offer delivery</p>
              <p className="text-xs text-[#6B6067] mt-0.5">Let renters choose to have this delivered</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.deliveryAvailable}
              onClick={() => update({ deliveryAvailable: !form.deliveryAvailable })}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                form.deliveryAvailable ? 'bg-[#8B1E3F]' : 'bg-[#E7DEE1]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  form.deliveryAvailable ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {form.deliveryAvailable && (
            <div>
              <label className={label}>Delivery fee</label>
              <input
                type="number"
                min="0"
                value={form.deliveryFee}
                onChange={(e) => update({ deliveryFee: e.target.value })}
                placeholder="₦0"
                className={inputClasses}
              />
            </div>
          )}
        </Section>

        <div className="pt-7 pb-6 -mx-6 sm:-mx-8 px-6 sm:px-8 border-t border-[#F0E9EC]">
          {error && (
            <p className="text-sm text-[#B3261E] mb-3" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#8B1E3F] text-white font-medium py-3 hover:bg-[#5E1329] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Publishing…' : 'Publish listing'}
          </button>
        </div>
      </form>
    </div>
  );
}