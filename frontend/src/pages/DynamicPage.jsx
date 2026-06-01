import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { Navbar, Footer } from "./HomePage";
import { Loader2 } from "lucide-react";

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const [pageRes, settingsRes] = await Promise.all([
          axios.get(`${API}/pages/${slug}`),
          axios.get(`${API}/settings`)
        ]);
        setPage(pageRes.data);
        setSettings(settingsRes.data);
      } catch (err) {
        console.error("Error fetching dynamic page:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="text-[#FFD700] animate-spin" size={40} />
        </div>
        <Footer settings={settings} />
      </div>
    );
  }

  if (error || !page) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero Section for Dynamic Page */}
        <section className="relative py-20 bg-primary border-b border-border mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,215,0,0.05)_0%,_transparent_60%)]" />
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                {page.title}
              </h1>
              {page.meta_description && (
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {page.meta_description}
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="prose prose-invert max-w-none text-foreground leading-relaxed"
          >
            {/* 
              We use dangerouslySetInnerHTML because the content comes from a trusted admin source 
              and may contain rich text formatting (HTML). In a production app, we'd use 
              a library like 'dompurify' to sanitize this.
            */}
            <div 
              className="dynamic-content-wrapper"
              dangerouslySetInnerHTML={{ __html: page.content }} 
            />
          </motion.div>
        </section>
      </main>

      <Footer settings={settings} />

      <style jsx>{`
        .dynamic-content-wrapper h2 { font-size: 1.875rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem; color: var(--text-foreground); }
        .dynamic-content-wrapper h3 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: var(--text-foreground); }
        .dynamic-content-wrapper p { margin-bottom: 1.5rem; color: var(--text-muted); }
        .dynamic-content-wrapper ul, .dynamic-content-wrapper ol { margin-bottom: 1.5rem; padding-left: 1.5rem; color: var(--text-muted); }
        .dynamic-content-wrapper li { margin-bottom: 0.5rem; }
        .dynamic-content-wrapper strong { color: var(--text-foreground); font-weight: 600; }
        .dynamic-content-wrapper a { color: #FFD700; text-decoration: underline; }
      `}</style>
    </div>
  );
}
