import { useState, useEffect } from 'react';
import appConfig from '../../config/appConfig';
import { toast } from 'sonner';
import { statesAndLgas } from '../../../stateAndLga';

const StateAndLga = ({ state, lga, onStateChange, onLgaChange }) => {
  const lgas = statesAndLgas[state] || [];

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
        <select
          required
          className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:outline-none transition"
          value={state}
          onChange={(e) => {
            onStateChange(e.target.value);
            onLgaChange(''); // Reset LGA when state changes
          }}
        >
          <option value="">Select State</option>
          {Object.keys(statesAndLgas).map((stateName) => (
            <option key={stateName} value={stateName}>
              {stateName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Local Government Area (LGA)
        </label>
        <select
          required
          className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:outline-none transition"
          value={lga}
          onChange={(e) => onLgaChange(e.target.value)}
          disabled={!state}
        >
          <option value="">Select LGA</option>
          {lgas.map((lgaName) => (
            <option key={lgaName} value={lgaName}>
              {lgaName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default function Step2_PersonalInfo({ formData, updateForm, nextStep, prevStep }) {
  const [username, setUsername] = useState(formData.username || '');

  // Auto-generate username
  useEffect(() => {
    if (formData.firstName && formData.lastName) {
      const first = formData.firstName.toLowerCase().trim();
      const last = formData.lastName.toLowerCase().trim();
      const randomNum = Math.floor(10 + Math.random() * 90);
      const generated = `${first}${last}${randomNum}`;
      
      setUsername(generated);
      updateForm({ username: generated });
    }
  }, [formData.firstName, formData.lastName, updateForm]);

  const handleNext = () => {
    if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.state || !formData.lga) {
      toast.error("Please fill all required fields");
      return;
    }
    nextStep();
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-2">Basic Information</h2>
      <p className="text-gray-600 mb-8">Tell us a bit about yourself</p>

      <div className="space-y-8">
        {/* Names */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              required
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:outline-none"
              value={formData.firstName}
              onChange={(e) => updateForm({ firstName: e.target.value })}
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              required
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:outline-none"
              value={formData.lastName}
              onChange={(e) => updateForm({ lastName: e.target.value })}
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Username Preview */}
        {/* {username && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Suggested Username</label>
            <div className="px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-mono text-lg text-gray-800">
              @{username}
            </div>
          </div>
        )} */}

        {/* Alternate Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.contactType === 'email' ? 'Phone Number' : 'Email Address'} (Optional)
          </label>
          <input
            type={formData.contactType === 'email' ? 'tel' : 'email'}
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
            value={formData.alternateContact}
            onChange={(e) => updateForm({ alternateContact: e.target.value })}
            placeholder={formData.contactType === 'email' ? '+234 801 234 5678' : 'example@gmail.com'}
          />
        </div>

        {/* State & LGA */}
        <StateAndLga 
          state={formData.state}
          lga={formData.lga}
          onStateChange={(state) => updateForm({ state })}
          onLgaChange={(lga) => updateForm({ lga })}
        />

        {/* Navigation */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 py-4 border border-gray-300 rounded-2xl font-semibold hover:bg-gray-50 transition"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-4 text-white font-semibold rounded-2xl transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: appConfig.colors.primary }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}