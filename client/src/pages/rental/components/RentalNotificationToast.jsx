import { useState, useCallback } from 'react';
import { useSocketEvent, SOCKET_EVENTS } from '../../hooks/useSocket';

const MESSAGES = {
  [SOCKET_EVENTS.NEW_RENTAL_REQUEST]: (p) => `Someone wants to rent "${p.itemTitle}"`,
  [SOCKET_EVENTS.BOOKING_CONFIRMED]: () => 'Your booking is confirmed',
  [SOCKET_EVENTS.BOOKING_CANCELLED]: () => 'A booking was cancelled',
  [SOCKET_EVENTS.ITEM_COLLECTED]: () => 'The renter confirmed they collected the item',
  [SOCKET_EVENTS.RETURN_REQUESTED]: () => 'The renter says they\'ve returned the item — please confirm',
  [SOCKET_EVENTS.RENTAL_COMPLETED]: () => 'Rental completed',
  [SOCKET_EVENTS.RENTAL_EXTENDED]: () => 'A rental was extended',
};

export default function RentalNotificationToast() {
  const [toast, setToast] = useState(null);

  const show = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 5000);
  }, []);

  Object.entries(MESSAGES).forEach(([event, formatter]) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSocketEvent(event, (payload) => show(formatter(payload)));
  });

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-[#8B1E3F] text-white px-4 py-3 shadow-lg max-w-xs text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
      {toast}
    </div>
  );
}