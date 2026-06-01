import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar, Footer } from "@/pages/HomePage";
import { motion } from "framer-motion";
import { ShieldCheck, Scale, FileWarning, BadgeCheck, ShieldAlert, HeartHandshake } from "lucide-react";
import axios from "axios";
import { API } from "@/apiConfig";

export default function TermsPage() {
  const [settings, setSettings] = useState({ company_name: "Carvio Cabs", email: "support@carviocabs.com" });

  useEffect(() => {
    axios.get(`${API}/settings`).then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const sections = [
    {
      icon: BadgeCheck,
      title: "1. Acceptance of Terms",
      content: `By downloading, installing, accessing, or using the Carvio Cabs platform, website, or mobile application (collectively referred to as the "Service"), you agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and ${settings.company_name}. If you do not agree with any part of these terms, you must immediately cease all use of our services. We reserve the right to modify, amend, or update these terms at any time without prior notice. Your continued use of the Service following any changes constitutes your explicit acceptance of the revised Terms of Service.`
    },
    {
      icon: Scale,
      title: "2. Services and Bookings",
      content: `Carvio Cabs provides premium chauffeur-driven cab booking services for individual, corporate, and outstation travels. Bookings can be made through our web portal, mobile application, or authorized customer service channels. All bookings are subject to vehicle availability and acceptance. While we make every effort to provide the selected vehicle category, we reserve the right to upgrade or substitute the vehicle with an equivalent category in unforeseen circumstances. A booking is considered confirmed only when you receive an official confirmation via email, SMS, or WhatsApp containing the ride details and chauffeur assignment.`
    },
    {
      icon: ShieldCheck,
      title: "3. Safety First Policy",
      content: `At ${settings.company_name}, safety is our ultimate priority. We maintain a zero-tolerance policy for reckless driving, traffic violations, and operating under the influence. All our chauffeurs undergo rigorous background checks, regular health examinations, and defensive driving training at the Carvio Chauffeur Academy. Passengers are strictly required to wear seatbelts at all times during the journey in compliance with local regulations. Any behavior that compromises the safety of the chauffeur, the vehicle, or other road users—including harassment, request for high-speed travel, or transport of illegal substances—will result in immediate termination of the trip without refund, and the incident may be reported to law enforcement agencies.`
    },
    {
      icon: BadgeCheck,
      title: "4. Fair Pricing Guarantee",
      content: `We believe in transparency and integrity. Our Fair Pricing Guarantee ensures that the fare calculated at the time of booking is what you pay, with absolutely no hidden fees, dynamic surge charges, or surprise rates. Fares are calculated based on travel distance, duration, trip type (local, outstation, or airport transfer), and the chosen vehicle category. Standard toll charges, parking fees, and state entry permits are added transparently to the invoice where applicable. Any modifications to the route or additional stops requested during the trip will be billed fairly according to our standardized pricing schedule, which is fully accessible to customers before and after the ride.`
    },
    {
      icon: ShieldAlert,
      title: "5. Cancellation, Refunds, and No-Shows",
      content: `We understand that plans change. Our cancellation policy is designed to be fair to both passengers and chauffeurs. Cancellations made within the free cancellation window (as detailed during checkout) will receive a full refund. Cancellations made outside this window may incur a standard cancellation fee to compensate the chauffeur for travel time and opportunity cost. If a passenger fails to arrive at the designated pickup location within the grace period (typically 15 minutes for local rides and 30 minutes for airport pickups) without notifying the chauffeur or support desk, the booking will be treated as a "No-Show," and the full trip fare may be charged.`
    },
    {
      icon: FileWarning,
      title: "6. User Obligations and Conduct",
      content: `As a user of Carvio Cabs, you agree to use the Service in a responsible and lawful manner. You are responsible for providing accurate registration, contact, and billing information. You must treat our chauffeurs with respect and courtesy. Smoking, consumption of alcohol, or use of illegal substances inside the vehicle is strictly prohibited. You agree to reimburse ${settings.company_name} for any damage to the vehicle's interior or exterior caused by your actions, negligence, or failure to follow passenger guidelines.`
    },
    {
      icon: HeartHandshake,
      title: "7. Limitation of Liability",
      content: `To the maximum extent permitted by applicable law, ${settings.company_name} and its affiliates, directors, officers, employees, or drivers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, goodwill, or other intangible losses. While we take every measure to ensure punctual pickups, we are not responsible for delays caused by extreme weather, traffic congestion, road construction, accidents, force majeure events, or other conditions beyond our reasonable control. In no event shall our total liability for all claims exceed the amount paid by you for the specific ride in question.`
    },
    {
      icon: FileWarning,
      title: "8. Dispute Resolution and Governing Law",
      content: `These Terms of Service and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of India. Any legal action or proceeding arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra. Before initiating any formal legal action, you agree to contact our support department in writing to attempt to resolve the issue amicably through mutual discussion within 30 business days.`
    }
  ];

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-16 bg-secondary border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06)_0%,_transparent_60%)]" />
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
          <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Legal Framework</span>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mt-4">Terms of Service</h1>
          <p className="text-muted-foreground text-lg mt-4">Last updated: May {new Date().getFullYear()}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          {/* Welcome Card */}
          <div className="card-dark p-6 md:p-8 mb-8">
            <p className="text-muted-foreground leading-relaxed text-lg">
              Welcome to <span className="text-foreground font-semibold">{settings.company_name}</span>. By using our premium chauffeur-driven cab booking platform, you agree to comply with and be bound by the following terms, conditions, and policies. Please review them carefully.
            </p>
          </div>

          {/* Detailed Clauses */}
          <div className="space-y-6">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-dark p-6 md:p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
                    <section.icon className="text-white" size={24} />
                  </div>
                  <h2 className="text-foreground font-bold text-xl">{section.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{section.content}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact Card */}
          <div className="card-dark p-8 mt-8">
            <h2 className="text-foreground font-bold text-xl mb-4">Questions & Support</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions or require clarification regarding these Terms of Service, please reach out to our legal and support team:
            </p>
            <div className="flex flex-col gap-3">
              <a href={`mailto:${settings.email}`} className="text-muted-foreground hover:text-white transition-colors flex items-center gap-3">
                <span className="text-white font-medium">Email:</span> {settings.email}
              </a>
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="text-muted-foreground hover:text-white transition-colors flex items-center gap-3">
                  <span className="text-white font-medium">Support Line:</span> {settings.phone}
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
