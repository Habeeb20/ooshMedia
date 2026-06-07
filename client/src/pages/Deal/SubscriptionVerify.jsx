// pages/SubscriptionVerify.jsx  (or wherever your router points)
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SubscriptionVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const reference = searchParams.get('reference');
  const message = searchParams.get('message');

  useEffect(() => {
    // Auto-redirect to dashboard after 3 seconds
    const timer = setTimeout(() => navigate('/dashboard'), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'success' && (
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600 mb-2">Payment Successful! 🎉</p>
          <p className="text-gray-500">Points have been added to your account.</p>
          <p className="text-xs text-gray-400 mt-2">Ref: {reference}</p>
          <p className="text-sm text-gray-400 mt-4">Redirecting to dashboard...</p>
        </div>
      )}
      {status === 'failed' && (
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500 mb-2">Payment Failed</p>
          <p className="text-gray-500">{message || 'Something went wrong.'}</p>
          <p className="text-sm text-gray-400 mt-4">Redirecting to dashboard...</p>
        </div>
      )}
      {status === 'error' && (
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500 mb-2">Verification Error</p>
          <p className="text-gray-500">Could not verify your payment. Contact support.</p>
          <p className="text-sm text-gray-400 mt-4">Redirecting to dashboard...</p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionVerify;