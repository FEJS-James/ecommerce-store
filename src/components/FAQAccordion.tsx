'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem { question: string; answer: string; }
interface FAQAccordionProps { items: FAQItem[]; }

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (!Array.isArray(items) || items.length === 0) return null;
  const displayItems = items.slice(0, 4);

  return (
    <div className="space-y-3">
      {displayItems.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="glass rounded-2xl overflow-hidden">
            <button onClick={() => setOpenIndex(isOpen ? null : i)} className="w-full flex items-center justify-between p-5 text-left focus-glow" aria-expanded={isOpen} aria-controls={`faq-panel-${i}`}>
              <span className="font-semibold text-white pr-4">{faq.question}</span>
              <ChevronDown className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            <div id={`faq-panel-${i}`} role="region" className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden"><p className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">{faq.answer}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
