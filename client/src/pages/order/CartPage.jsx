import { useState } from 'react';
import {useCart} from "../../context/cartContext"

import { useNavigate } from 'react-router-dom';
import { Truck, Package, User, Users, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cart, cartTotal, updateItem, removeItem, updateFulfillment } = useCart();
  const navigate = useNavigate();
console.log(cart);
  const fulfillmentType = cart?.fulfillmentType || 'delivery';
  const pickup = cart?.pickup || { pickedUpBy: 'self' };
  const paymentMethod = cart?.paymentMethod || 'online';

  const handleFulfillment = async (type) => {
    await updateFulfillment({ fulfillmentType: type });
  };

  const handlePickupBy = async (by) => {
    await updateFulfillment({ pickup: { ...pickup, pickedUpBy: by } });
  };

  const handleAgentInfo = async (field, value) => {
    await updateFulfillment({ pickup: { ...pickup, [field]: value } });
  };

  const handleDeliveryAddress = async (address) => {
    await updateFulfillment({ delivery: { address } });
  };

  const handlePaymentMethod = async (method) => {
    await updateFulfillment({ paymentMethod: method });
  };

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <ShoppingBag size={64} className="text-gray-300" />
        <p className="text-xl font-semibold">Your cart is empty</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.product} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm">
              <img
                src={item.image || '/placeholder.png'}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-xl"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-indigo-600 font-bold">₦{item.price.toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateItem(item.product?._id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-semibold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateItem(item.product?._id, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col justify-between items-end">
                <button onClick={() => removeItem(item.product)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
                <p className="font-bold text-gray-800">₦{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Options */}
        <div className="space-y-4">

          {/* Fulfillment Type */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3">Fulfillment</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleFulfillment('delivery')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  fulfillmentType === 'delivery'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                <Truck size={22} />
                <span className="text-sm font-medium">Delivery</span>
              </button>
              <button
                onClick={() => handleFulfillment('pickup')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  fulfillmentType === 'pickup'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                <Package size={22} />
                <span className="text-sm font-medium">Pick Up</span>
              </button>
            </div>

            {/* Delivery Address */}
            {fulfillmentType === 'delivery' && (
              <div className="mt-3">
                <label className="text-sm text-gray-600 font-medium">Delivery Address</label>
                <input
                  defaultValue={cart.delivery?.address}
                  onBlur={e => handleDeliveryAddress(e.target.value)}
                  placeholder="Enter your delivery address"
                  className="w-full mt-1 border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                  A 4-digit delivery code will be sent to you. Provide it to the rider upon delivery.
                </p>
              </div>
            )}

            {/* Pickup Options */}
            {fulfillmentType === 'pickup' && (
              <div className="mt-3 space-y-3">
                <label className="text-sm text-gray-600 font-medium">Picked up by</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePickupBy('self')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-sm transition-all ${
                      pickup.pickedUpBy === 'self'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <User size={18} />
                    Self
                  </button>
                  <button
                    onClick={() => handlePickupBy('agent')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-sm transition-all ${
                      pickup.pickedUpBy === 'agent'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <Users size={18} />
                    Someone else
                  </button>
                </div>
                {pickup.pickedUpBy === 'agent' && (
                  <div className="space-y-2">
                    <input
                      defaultValue={pickup.agentName}
                      onBlur={e => handleAgentInfo('agentName', e.target.value)}
                      placeholder="Agent's name"
                      className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <input
                      defaultValue={pickup.agentPhone}
                      onBlur={e => handleAgentInfo('agentPhone', e.target.value)}
                      placeholder="Agent's phone number"
                      className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3">Payment</h2>
            <div className="space-y-2">
              <button
                onClick={() => handlePaymentMethod('online')}
                className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
                  paymentMethod === 'online'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                💳 Pay Online (Paystack)
              </button>
              <button
                onClick={() => handlePaymentMethod('on_delivery')}
                className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
                  paymentMethod === 'on_delivery'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                💰 Pay on Delivery
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between text-gray-600 text-sm mb-1">
              <span>Subtotal</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-lg border-t pt-2">
              <span>Total</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
