import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { ChevronDown, HelpCircle } from "lucide-react";

/**
 * Reusable FAQ Accordion Section
 * Props:
 *   page: "home" | "about" | "services" | "contact" | "fleet" | "gallery"
 *   title: optional custom section title (default: "Frequently Asked Questions")
 *   subtitle: optional subtitle
 */
export default function FAQSection({ page, title, subtitle }) {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    axios.get(`${API}/faqs?page=${page}`)
      .then(r => setFaqs(r.data))
      .catch(() => {});
  }, [page]);

  if (faqs.length === 0) return null;

  return (
    <section className="py-20 bg-[#050505]">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center">
              <HelpCircle className="text-white" size={24} />
            </div>
          </div>
          <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
            {title || "Frequently Asked Questions"}
          </h2>
          {subtitle && <p className="text-zinc-400 mt-3">{subtitle}</p>}
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={faq.faq_id}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="border border-zinc-800 rounded-xl overflow-hidden bg-[#0D0D0D] hover:border-zinc-700 transition-colors">
              <button
                onClick={() => setOpen(open === faq.faq_id ? null : faq.faq_id)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
                <span className="text-white font-medium text-base leading-snug">{faq.question}</span>
                <motion.div animate={{ rotate: open === faq.faq_id ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                  <ChevronDown className="text-zinc-500" size={20} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {open === faq.faq_id && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden">
                    <div className="px-6 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-zinc-800 pt-4 whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
