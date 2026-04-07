import { FaFileUpload } from "react-icons/fa";
import { MdMenuBook, MdOutlineAccountTree } from "react-icons/md";
const Features = () => {
  return (
    <section className="space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">
          The Analysis Stack
        </h2>
        <p className="text-on-surface-variant">
          Built for teams who need more than just a chatbot. Real citations,
          real workflows, real results.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg p-8 ambient-glow border border-outline-variant/5 group hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 bg-[#d1e5f4] rounded-full flex items-center justify-center mb-6 text-on-secondary-container">
            <FaFileUpload className="h-6 w-6" aria-hidden="true"/>
          </div>
          <h3 className="text-xl font-bold mb-3">Ingest anything</h3>
          <p className="text-on-surface-variant leading-relaxed">
            Securely upload PDFs, raw spreadsheets, or scrape dynamic URLs. Our
            parser handles the structure automatically.
          </p>
        </div>
        <div className="bg-white rounded-lg p-8 ambient-glow border border-outline-variant/5 group hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 bg-[#d1e5f4] rounded-full flex items-center justify-center mb-6 text-on-secondary-container">
            <MdOutlineAccountTree className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold mb-3">Traceable workflows</h3>
          <p className="text-on-surface-variant leading-relaxed">
            Visualize the reasoning path with LangGraph integration. See exactly
            how the AI reached every conclusion.
          </p>
        </div>
        <div className="bg-white rounded-lg p-8 ambient-glow border border-outline-variant/5 group hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 bg-[#d1e5f4] rounded-full flex items-center justify-center mb-6 text-on-secondary-container">
            <MdMenuBook className="h-6 w-6" aria-hidden="true"/>
          </div>
          <h3 className="text-xl font-bold mb-3">Citations everywhere</h3>
          <p className="text-on-surface-variant leading-relaxed">
            Every claim made by the AI is hyperlinked to the original source.
            Verify information in a single click.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
