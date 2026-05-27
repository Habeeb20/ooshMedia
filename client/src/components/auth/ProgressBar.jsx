// src/components/signup/ProgressBar.jsx
export default function ProgressBar({ step, totalSteps }) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium">Step {step} of {totalSteps}</span>
        <span className="text-gray-500">Almost there</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#8B1E3F] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}