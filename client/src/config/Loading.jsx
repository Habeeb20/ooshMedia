
import { Loader2 } from 'lucide-react';
import appConfig from './AppConfig';

export default function Loading({
  size = "lg",
  text = "Please wait...",
  fullScreen = false,
  overlay = false
}) {
  const primaryColor = appConfig.colors.primary;

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20"
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
        <div className="flex flex-col items-center">
          <div 
            className={`animate-spin ${sizeClasses[size]}`}
            style={{
              border: `4px solid ${primaryColor}20`,
              borderTopColor: primaryColor,
              borderRadius: '9999px'
            }}
          />
          {text && (
            <p className="text-white mt-5 text-lg font-medium">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${overlay ? 'bg-white/80 backdrop-blur-sm absolute inset-0 z-50' : ''}`}>
      <div className="relative">
        {/* Main Spinner */}
        <Loader2 
          className={`${sizeClasses[size]} animate-spin`}
          style={{ color: primaryColor }}
        />
        
        {/* Subtle ring effect */}
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      {text && (
        <p className="mt-4 text-gray-600 font-medium text-center">
          {text}
        </p>
      )}
    </div>
  );
}