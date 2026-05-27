
import appConfig from './AppConfig';
export default function Skeleton({
  type = "text", 
  count = 1,
  className = ""
}) {
  const baseClass = "animate-pulse bg-gray-200 rounded-xl";

  const renderSkeleton = () => {
    switch(type) {
      case "avatar":
        return (
          <div className={`w-16 h-16 rounded-2xl ${baseClass} ${className}`} 
               style={{ backgroundColor: '#f3f4f6' }} />
        );
      
      case "button":
        return (
          <div className={`h-12 rounded-2xl ${baseClass} ${className}`} 
               style={{ backgroundColor: '#f3f4f6' }} />
        );

      case "input":
        return (
          <div className={`h-14 rounded-2xl ${baseClass} ${className}`} 
               style={{ backgroundColor: '#f3f4f6' }} />
        );

      case "card":
        return (
          <div className={`p-6 rounded-3xl ${baseClass} ${className}`} 
               style={{ backgroundColor: '#f3f4f6' }}>
            <div className="h-4 w-3/4 mb-4 rounded" style={{ backgroundColor: '#e5e7eb' }}></div>
            <div className="h-3 w-full mb-2 rounded" style={{ backgroundColor: '#e5e7eb' }}></div>
            <div className="h-3 w-5/6 rounded" style={{ backgroundColor: '#e5e7eb' }}></div>
          </div>
        );

      default: // text
        return (
          <div className={`h-4 rounded ${baseClass} ${className}`} 
               style={{ backgroundColor: '#e5e7eb' }} />
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-full">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
}