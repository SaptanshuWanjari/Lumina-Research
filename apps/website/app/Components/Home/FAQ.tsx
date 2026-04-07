import { ArrowDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
const FAQ = () => {
  const faqs = [
    {
      question: "How does AnalystAI ensure data privacy?",
      answer:
        "We employ enterprise-grade SOC2 compliance measures. Your data is encrypted at rest and in transit, and we never use your proprietary research to train our foundation models.",
    },
    {
      question: "Can I export reports to PDF or Word?",
      answer:
        "Yes, you can easily export your research reports in both PDF and Word formats for seamless sharing and collaboration.",
    },
    {
      question: "What is the citation accuracy rate?",
      answer:
        "Our citation accuracy rate is over 95%, ensuring that the sources we reference are reliable and correctly attributed.",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Common Questions</h2>
        <p className="text-on-surface-variant">
          Everything you need to know about our research workspace.
        </p>
      </div>
      <div className="bg-[#eaeff2] p-2 rounded-[13px] space-y-2">
        {faqs.map((faq) => (
          <div
            key={faq.question}
            className="rounded-[13px] overflow-hidden transition-all duration-300"
          >
            <Accordion type="single" collapsible>
              <AccordionItem value={faq.question}>
                <AccordionTrigger className="bg-[#f0f4f7] px-8 py-6 flex justify-between items-center cursor-pointer ">
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <span
                    className="material-symbols-outlined text-zinc-400"
                    data-icon="expand_more"
                  ></span>
                </AccordionTrigger>
                <AccordionContent className="bg-white rounded-b-2xl px-8  py-6">
                  <p className="text-on-surface-variant leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
