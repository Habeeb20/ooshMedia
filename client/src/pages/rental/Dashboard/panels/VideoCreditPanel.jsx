import { useEffect, useState } from 'react';
import { rentalApi } from '../../api/rentalApi';
import VideoCreditModal from '../../components/VideoCredit';

export default function VideoCreditsPanel() {
  const [status, setStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    rentalApi.getVideoSubscriptionStatus().then((res) => setStatus(res.videoSubscription));
  }, []);

  return (
    <div>
      <h1 className="font-serif text-2xl text-[#221B1D] mb-1">Video credits</h1>
      <p className="text-[#6B6067] mb-6">Used when you add videos to a listing — ₦5,000 gets you 10 uploads.</p>

      <div className="rounded-xl border border-[#E7DEE1] bg-white p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6B6067]">Credits remaining</p>
          <p className="text-3xl font-semibold text-[#8B1E3F] mt-1">{status ? status.creditsRemaining : '…'}</p>
          {status && <p className="text-xs text-[#6B6067] mt-1">{status.totalPurchasedBatches} batch(es) purchased total</p>}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-[#8B1E3F] text-white font-medium px-5 py-3 hover:bg-[#5E1329] transition-colors"
        >
          Buy more
        </button>
      </div>

      {status?.payments?.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#E7DEE1] bg-white p-5">
          <p className="text-sm font-medium text-[#221B1D] mb-3">Purchase history</p>
          <div className="space-y-2">
            {status.payments.map((p) => (
              <div key={p.reference} className="flex justify-between text-sm">
                <span className="text-[#6B6067]">{new Date(p.createdAt).toLocaleDateString()}</span>
                <span className="text-[#221B1D]">₦{p.amount.toLocaleString()} · {p.videosGranted} videos</span>
                <span
                  className={
                    p.status === 'success' ? 'text-[#2F6846]' : p.status === 'failed' ? 'text-[#B3261E]' : 'text-[#9A6B12]'
                  }
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && <VideoCreditModal onClose={() => setShowModal(false)} />}
    </div>
  );
}