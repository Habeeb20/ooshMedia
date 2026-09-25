const STEPS = [
  {
    title: 'Find it',
    body: 'Search or filter by category to find the item, in your city, for the dates you need.',
  },
  {
    title: 'Book and pay',
    body: 'Reserve your dates and pay securely. The owner is notified the moment you confirm.',
  },
  {
    title: 'Pick up or get it delivered',
    body: "Choose to collect it yourself or have it delivered — you pick the time that works.",
  },
  {
    title: 'Return and review',
    body: 'Hand it back, confirm the return, and leave a review for the next renter.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-white border-y border-[#E7DEE1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <h2 className="font-serif text-2xl sm:text-3xl text-[#221B1D] mb-10">How renting works</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative pl-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#F3E4E8] text-[#8B1E3F] font-serif text-base">
                  {i + 1}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="hidden lg:block flex-1 h-px bg-[#E7DEE1]" />
                )}
              </div>
              <h3 className="font-medium text-[#221B1D]">{step.title}</h3>
              <p className="mt-1.5 text-sm text-[#6B6067] leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}