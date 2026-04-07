const BottomCTA = () => {
  return (
    <section className="bg-black rounded-xl p-16 text-center space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent opacity-50"></div>
      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <h2 className="text-4xl font-bold text-white">
          Ready to elevate your research?
        </h2>
        <p className="text-white/70 text-lg">
          Join 1,000+ analysts who use AnalystAI to make faster, more accurate
          decisions every day.
        </p>
        <button className="bg-[#d1e5f4] text-on-secondary-container px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform duration-150">
          Start Your Free Trial
        </button>
      </div>
    </section>
  );
};

export default BottomCTA;
