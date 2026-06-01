import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { useSEO } from "@/hooks/useSEO";
import { Navbar, Footer } from "./HomePage";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [settings, setSettings] = useState({});
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => { axios.get(`${API}/settings`).then(r => setSettings(r.data)).catch(() => {}); }, []);

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Carvio Cabs",
    "description": "Get in touch with Carvio Cabs in Santacruz East, Mumbai for premium cab booking, airport pickups, and chauffeur-driven car rentals.",
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "Carvio Cabs",
      "telephone": settings.phone || "+91 95943 12974",
      "email": settings.email || "support@carviocabs.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": settings.address || "Santacruz East",
        "addressLocality": "Mumbai",
        "addressRegion": "Maharashtra",
        "postalCode": "400055",
        "addressCountry": "IN"
      }
    }
  };

  useSEO({
    title: "Contact Carvio Cabs | Book Cab Service in Santacruz East, Mumbai",
    description: "Contact Carvio Cabs for cab booking, airport pickup, corporate travel, chauffeur-driven car rental and outstation cab service from Santacruz East, Mumbai.",
    keywords: "Contact Carvio Cabs, cab service Santacruz East, car rental with driver Mumbai, airport taxi Mumbai",
    schema: contactSchema
  });

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill all required fields."); return; }
    setSending(true);
    try {
      await axios.post(`${API}/contact`, form);
      setSent(true);
      toast.success("Message sent! We'll respond within 24 hours.");

      // Send Web3Forms email notification from client-side
      try {
        const formData = new FormData();
        formData.append("access_key", "43dadfae-99d2-46d0-841a-cf5747e0ced7");
        formData.append("subject", `New Contact Message: ${form.subject || 'No Subject'}`);
        formData.append("from_name", "Carvio Cabs Contact");
        formData.append("name", form.name);
        formData.append("email", form.email);
        formData.append("message", `
New Contact Form Message:
----------------------
Name: ${form.name}
Email: ${form.email}
Phone: ${form.phone || "Not specified"}
Subject: ${form.subject || "Not specified"}
Message:
${form.message}
        `);

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        }).catch(err => console.error("Web3Forms contact submit error:", err));
      } catch (err) {
        console.error("Web3Forms contact fetch error:", err);
      }

      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (e) {
      toast.error("Failed to send message. Please try WhatsApp instead.");
    } finally { setSending(false); }
  };

  const contactItems = [
    { icon: Phone, label: "Phone", value: settings.phone || "+91 99999 99999", href: `tel:${settings.phone}` },
    { icon: Mail, label: "Email", value: settings.email || "support@carviocabs.com", href: `mailto:${settings.email}` },
    { icon: MapPin, label: "Address", value: settings.address || "Mumbai, Maharashtra, India", href: null },
    { icon: Clock, label: "Availability", value: "24 × 7 Customer Support", href: null },
  ];

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06)_0%,_transparent_60%)]" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Get in Touch</span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mt-4 mb-6">
              Contact Carvio Cabs in Mumbai
            </h1>
            <p className="text-zinc-400 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              Looking for a cab service in Santacruz East, Mumbai? Contact Carvio Cabs for airport taxi, local rental, corporate cab booking, outstation trips and car rental with driver. We serve Santacruz, Andheri, Vile Parle, Bandra, Dadar, Mahim, Kurla, Goregaon, Churchgate and nearby Mumbai locations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 bg-primary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {contactItems.map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card-dark p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-white" size={22} />
                </div>
                <p className="text-muted-foreground text-xs mb-1">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-foreground font-medium text-sm hover:text-white transition-colors">{item.value}</a>
                ) : (
                  <p className="text-foreground font-medium text-sm">{item.value}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact Form + WhatsApp */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-3">
              <div className="card-dark p-8">
                <h2 className="text-foreground text-2xl font-bold mb-6 flex items-center gap-3">
                  <MessageSquare className="text-white" size={24} /> Send Us a Message
                </h2>

                {sent ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="text-[#10B981] mx-auto mb-4" size={56} />
                    <h3 className="text-foreground text-xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
                    <Button className="mt-6 bg-white text-black hover:bg-zinc-200" onClick={() => setSent(false)}>Send Another</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Full Name *</Label>
                        <Input name="name" value={form.name} onChange={handleChange} placeholder="Rahul Kumar" className="bg-secondary border-border text-foreground mt-1" required />
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email *</Label>
                        <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="rahul@example.com" className="bg-secondary border-border text-foreground mt-1" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Phone</Label>
                        <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 99999 99999" className="bg-secondary border-border text-foreground mt-1" />
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Subject</Label>
                        <Input name="subject" value={form.subject} onChange={handleChange} placeholder="Booking enquiry..." className="bg-secondary border-border text-foreground mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Message *</Label>
                      <textarea name="message" value={form.message} onChange={handleChange} rows={5} required
                        placeholder="Tell us about your travel requirements..."
                        className="w-full mt-1 bg-secondary border border-border text-foreground rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-white" />
                    </div>
                    <Button type="submit" disabled={sending} className="w-full bg-white text-black hover:bg-zinc-200 font-semibold h-12">
                      {sending ? "Sending..." : <><Send size={16} className="mr-2" />Send Message</>}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Right panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-4">
              {/* WhatsApp CTA */}
              <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-6 text-center">
                <p className="text-[#25D366] text-3xl mb-3">💬</p>
                <h3 className="text-foreground font-bold text-lg mb-2">Chat on WhatsApp</h3>
                <p className="text-muted-foreground text-sm mb-4">Get instant reply for all booking queries</p>
                <a href={`https://wa.me/${settings.whatsapp || "919594312974"}`} target="_blank" rel="noreferrer">
                  <Button className="w-full bg-[#25D366] text-white hover:bg-[#1DB954] font-semibold">
                    Open WhatsApp
                  </Button>
                </a>
              </div>

              {/* Office Hours */}
              <div className="card-dark p-6">
                <h3 className="text-foreground font-bold text-lg mb-4 flex items-center gap-2"><Clock className="text-white" size={18} /> Response Times</h3>
                <div className="space-y-3">
                  {[
                    { label: "WhatsApp", time: "Within 5 minutes" },
                    { label: "Email / Form", time: "Within 24 hours" },
                    { label: "Booking Support", time: "24 × 7 Available" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-muted-foreground text-sm">{r.label}</span>
                      <span className="text-foreground text-sm font-medium">{r.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <FAQSection page="contact" />

      <Footer settings={settings} />
    </div>
  );
}
