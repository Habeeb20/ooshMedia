// import { X } from "lucide-react";

// export default function ModalShell({ title, onClose, children, footer }) {
//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
//       onClick={onClose}
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         className="bg-white w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-lg rounded-none sm:rounded-3xl overflow-hidden flex flex-col"
//       >
//         <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
//           <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
//             aria-label="Close"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>

//         <div className="overflow-y-auto flex-1">{children}</div>

//         {footer && (
//           <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 shrink-0">
//             {footer}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function ModalShell({ title, onClose, children, footer }) {
  const modal = (
    <div
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full h-full sm:h-auto sm:max-h-[70vh] sm:max-w-lg rounded-none sm:rounded-3xl overflow-hidden flex flex-col"
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white shrink-0"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}