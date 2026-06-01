import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar, Footer } from "@/pages/HomePage";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Mail, Phone } from "lucide-react";
import axios from "axios";
import { API } from "@/apiConfig";

export default function PrivacyPage() {
  const [settings, setSettings] = useState({ company_name: "Carvio Cabs", email: "support@carviocabs.com" });

  useEffect(() => {
    axios.get(`${API}/settings`).then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: `We collect information you provide directly to us when you create an account, make a booking, or contact us for support. This includes your name, email address, phone number, and pickup/drop locations. We also collect usage data like pages visited and booking history to improve our service.`
    },
    {
      icon: FileText,
      title: "How We Use Your Information",
      content: `Your information is used strictly to provide and improve our transportation services. This includes processing bookings, communicating ride status, sending booking confirmations and receipts, and contacting you about your account. We do not sell your personal data to third parties.`
    },
    {
      icon: Shield,
      title: "Data Security",
      content: `We implement industry-standard security measures to protect your personal information. All payment transactions are processed through Razorpay, a PCI-DSS certified payment gateway. Your password is stored using bcrypt hashing. We use HTTPS encryption for all data transmissions.`
    },
    {
      icon: Lock,
      title: "Your Rights",
      content: `You have the right to access, update, or delete your personal information at any time. You may also request a copy of the data we hold about you. To exercise these rights, please contact our support team. We will respond to your request within 30 days.`
    },
  ];

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-16 bg-secondary border-b border-border">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Legal</span>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mt-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg mt-4">Last updated: March {new Date().getFullYear()}</p>
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="card-dark p-6 md:p-8 mb-8">
            <p className="text-muted-foreground leading-relaxed text-lg">
              At <span className="text-foreground font-semibold">{settings.company_name}</span>, we are committed to protecting your privacy. 
              This policy explains how we collect, use, and safeguard your personal information when you use our transportation booking services.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-dark p-6 md:p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
                    <section.icon className="text-white" size={24} />
                  </div>
                  <h2 className="text-foreground font-bold text-xl">{section.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <div className="card-dark p-8 mt-8">
            <h2 className="text-foreground font-bold text-xl mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-6">If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="flex flex-col gap-3">
              <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors">
                <Mail size={18} className="text-white" /> {settings.email}
              </a>
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors">
                  <Phone size={18} className="text-white" /> {settings.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
