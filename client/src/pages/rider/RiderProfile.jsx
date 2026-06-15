import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import CloudinaryUpload from '../../config/CloudinaryUpload';

import { Bike, Car, Shield, MapPin, Banknote } from 'lucide-react';

const RiderProfile = () => {
  const [isRider, setIsRider] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: 'bike',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    bankCode: ''
  });

  const token = localStorage.getItem('token')
  const [documents, setDocuments] = useState({
    ridersLicense: { url: '', publicId: '' },
    vehicleImage: { url: '', publicId: '' },
    insuranceDocument: { url: '', publicId: '' }
  });

  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  useEffect(() => {
    fetchRiderProfile();
  }, []);

  const fetchRiderProfile = async () => {
    try {
      const res = await api.get(`${import.meta.env.VITE_BACKEND_URL}/api/rider/profile`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
      });
      setIsRider(res.data.isRider);
      if (res.data.riderProfile) {
        setFormData({ ...formData, ...res.data.riderProfile });
        setDocuments({
          ridersLicense: res.data.riderProfile.ridersLicense || { url: '', publicId: '' },
          vehicleImage: res.data.riderProfile.vehicleImage || { url: '', publicId: '' },
          insuranceDocument: res.data.riderProfile.insuranceDocument || { url: '', publicId: '' }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDocumentUpload = (type) => (url, publicId) => {
    setDocuments(prev => ({
      ...prev,
      [type]: { url, publicId }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        ridersLicense: documents.ridersLicense,
        vehicleImage: documents.vehicleImage,
        insuranceDocument: documents.insuranceDocument
      };

      await api.put(`${import.meta.env.VITE_BACKEND_URL}/api/rider/profile`, payload);
      toast.success("Rider profile updated successfully!");
      setIsRider(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-indigo-600 text-white p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
              🏍️
            </div>
            <div>
              <h1 className="text-3xl font-black">Become a Rider</h1>
              <p className="opacity-90">Earn money delivering with ease</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {/* Vehicle Information */}
          <div>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Bike className="w-6 h-6" /> Vehicle Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-500"
                >
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brand</label>
                <input type="text" name="vehicleBrand" value={formData.vehicleBrand} onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-2xl" placeholder="e.g. Honda, Toyota" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Model</label>
                <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-2xl" placeholder="e.g. CBR 150" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">License Plate</label>
                <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-2xl uppercase" placeholder="ABC-1234" required />
              </div>
            </div>
          </div>

          {/* Documents Upload */}
          <div>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Shield className="w-6 h-6" /> Required Documents
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Rider's License</label>
                <CloudinaryUpload
                  onUploadComplete={handleDocumentUpload('ridersLicense')}
                  folder="riders/licenses"
                  label=""
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Photo</label>
                <CloudinaryUpload
                  onUploadComplete={handleDocumentUpload('vehicleImage')}
                  folder="riders/vehicles"
                  label=""
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Insurance Document</label>
                <CloudinaryUpload
                  onUploadComplete={handleDocumentUpload('insuranceDocument')}
                  folder="riders/insurance"
                  label=""
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Banknote className="w-6 h-6" /> Bank Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <input type="text" name="bankName" placeholder="Bank Name" value={formData.bankName} onChange={handleInputChange}
                className="p-4 border border-gray-300 rounded-2xl" required />
              <input type="text" name="accountNumber" placeholder="Account Number" value={formData.accountNumber} onChange={handleInputChange}
                className="p-4 border border-gray-300 rounded-2xl" required />
              <input type="text" name="accountName" placeholder="Account Name" value={formData.accountName} onChange={handleInputChange}
                className="p-4 border border-gray-300 rounded-2xl" required />
              <input type="text" name="bankCode" placeholder="Bank Code (Optional)" value={formData.bankCode} onChange={handleInputChange}
                className="p-4 border border-gray-300 rounded-2xl" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all disabled:opacity-70"
          >
            {loading ? "Saving Profile..." : isRider ? "Update Rider Profile" : "Activate Rider Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RiderProfile;