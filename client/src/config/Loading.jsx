
// import { Loader2 } from 'lucide-react';
// import appConfig from './AppConfig';

// export default function Loading({
//   size = "lg",
//   text = "Please wait...",
//   fullScreen = false,
//   overlay = false
// }) {
//   const primaryColor = appConfig.colors.primary;

//   const sizeClasses = {
//     sm: "w-6 h-6",
//     md: "w-10 h-10",
//     lg: "w-14 h-14",
//     xl: "w-20 h-20"
//   };

//   if (fullScreen) {
//     return (
//       <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
//         <div className="flex flex-col items-center">
//           <div 
//             className={`animate-spin ${sizeClasses[size]}`}
//             style={{
//               border: `4px solid ${primaryColor}20`,
//               borderTopColor: primaryColor,
//               borderRadius: '9999px'
//             }}
//           />
//           {text && (
//             <p className="text-white mt-5 text-lg font-medium">{text}</p>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`flex flex-col items-center justify-center py-8 ${overlay ? 'bg-white/80 backdrop-blur-sm absolute inset-0 z-50' : ''}`}>
//       <div className="relative">
//         {/* Main Spinner */}
//         <Loader2 
//           className={`${sizeClasses[size]} animate-spin`}
//           style={{ color: primaryColor }}
//         />
        
//         {/* Subtle ring effect */}
//         <div 
//           className="absolute inset-0 rounded-full animate-ping opacity-20"
//           style={{ backgroundColor: primaryColor }}
//         />
//       </div>

//       {text && (
//         <p className="mt-4 text-gray-600 font-medium text-center">
//           {text}
//         </p>
//       )}
//     </div>
//   );
// }





import { Loader2 } from 'lucide-react';
import appConfig from './AppConfig';

export default function Loading({
  size = "lg",
  text = "Please wait...",
  fullScreen = false,
  overlay = false,
  className = "",
}) {
  const primaryColor = appConfig.colors.primary;

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const ringSizeClasses = {
    sm: "w-8 h-8",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };

  // ── Full screen (fixed to viewport, always on top) ──────────────────
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
        <div className="flex flex-col items-center">
          <div
            className={`animate-spin ${sizeClasses[size]}`}
            style={{
              border: `4px solid ${primaryColor}20`,
              borderTopColor: primaryColor,
              borderRadius: '9999px',
            }}
          />
          {text && (
            <p className="text-white mt-5 text-lg font-medium text-center px-4">{text}</p>
          )}
        </div>
      </div>
    );
  }

  // ── Overlay (covers only its own positioned parent) ──────────────────
  // IMPORTANT: the parent wrapping this component must have `relative`
  // (or another positioning context) for `absolute inset-0` to stay
  // contained instead of covering the nearest positioned ancestor.
  if (overlay) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm">
        <SpinnerCore size={size} ringSizeClasses={ringSizeClasses} sizeClasses={sizeClasses} primaryColor={primaryColor} />
        {text && (
          <p className="mt-4 text-gray-600 font-medium text-center px-4">{text}</p>
        )}
      </div>
    );
  }

  // ── Inline (default) ─────────────────────────────────────────────────
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <SpinnerCore size={size} ringSizeClasses={ringSizeClasses} sizeClasses={sizeClasses} primaryColor={primaryColor} />
      {text && (
        <p className="mt-4 text-gray-600 font-medium text-center">{text}</p>
      )}
    </div>
  );
}

function SpinnerCore({ size, ringSizeClasses, sizeClasses, primaryColor }) {
  return (
    <div className={`relative flex items-center justify-center ${ringSizeClasses[size]}`}>
      {/* Ping ring — perfectly centered circle behind the icon, sized independently */}
      <div
        className="absolute rounded-full animate-ping opacity-20 w-full h-full"
        style={{ backgroundColor: primaryColor }}
      />
      {/* Main spinner */}
      <Loader2
        className={`${sizeClasses[size]} animate-spin relative`}
        style={{ color: primaryColor }}
      />
    </div>
  );
}