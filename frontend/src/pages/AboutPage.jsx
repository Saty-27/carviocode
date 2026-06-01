import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSEO } from "@/hooks/useSEO";
import { API } from "@/apiConfig";
import { Navbar, Footer } from "./HomePage";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Users, Globe, Trophy, Clock, Car, Shield, Star, ChevronRight, X } from "lucide-react";
import { resolveImageUrl } from "@/utils/imageUrl";

const TEAM = [
  { name: "Sunil Singh", role: "CEO & Founder", img: resolveImageUrl("/uploads/ceo_sunil_singh.jpg") },
];

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [settings, setSettings] = useState({});
  const [isBioOpen, setIsBioOpen] = useState(false);

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Carvio Cabs",
      "founder": {
        "@type": "Person",
        "name": "Sunil Singh",
        "jobTitle": "CEO & Founder"
      },
      "description": "Mumbai-based premium chauffeur-driven cab company offering airport transfers, corporate travel, local rentals and fleet management services."
    }
  };

  useSEO({
    title: "About Carvio Cabs | Premium Chauffeur Cab Service in Mumbai",
    description: "Learn about Carvio Cabs, a Mumbai-based premium chauffeur-driven cab company founded by Sunil Singh, offering airport transfers, corporate travel, local rentals and fleet management services.",
    keywords: "About Carvio Cabs, premium chauffeur cab service Mumbai, Sunil Singh founder, cab booking Mumbai",
    schema: aboutSchema
  });

  useEffect(() => {
    Promise.all([axios.get(`${API}/about`), axios.get(`${API}/settings`)]).then(([a, s]) => {
      setAbout(a.data);
      setSettings(s.data);
    }).catch(() => {});
  }, []);

  const stats = about?.stats || { years: 30, trips: 50000, customers: 25000, cities: 50 };
  const why = about?.why_choose_us || ["On-time guarantee","Professional drivers","Clean vehicles","Transparent pricing","24/7 support"];

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06)_0%,_transparent_60%)]" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">About Carvio Cabs</span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mt-4 mb-6">
              Driven by <span className="text-white">Passion</span>,<br />Defined by Excellence
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {about?.company_story || "Founded to redefine premium transportation, Carvio Cabs has grown into one of the most trusted cab services with an unwavering commitment to punctuality and professionalism."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Years in Business", value: `${stats.years === 5 ? 30 : stats.years}+ years`, icon: Clock },
              { label: "Happy Customers", value: `${(stats.customers/1000).toFixed(0)}K+`, icon: Users },
              { label: "Trips Completed", value: `${(stats.trips/1000).toFixed(0)}K+`, icon: Car },
              { label: "Cities Served", value: `${stats.cities}+`, icon: Globe },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center card-dark p-8">
                <div className="w-14 h-14 rounded-xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="text-white" size={28} />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{s.value}</p>
                <p className="text-muted-foreground text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-primary">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          {[
            { tag: "Our Mission", title: "Safe & Reliable Transportation", body: about?.mission || "To provide safe, reliable, and comfortable transportation solutions while maintaining the highest standards of professionalism across every single journey.", icon: Shield },
            { tag: "Our Vision", title: "India's Preferred Travel Partner", body: about?.vision || "To become the most preferred choice for premium transportation services across India, setting benchmarks for quality, technology, and customer delight.", icon: Trophy },
          ].map((item, i) => (
            <motion.div key={item.tag} initial={{ opacity: 0, x: i === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="card-dark p-8">
              <div className="w-14 h-14 rounded-xl bg-zinc-800/50 flex items-center justify-center mb-6">
                <item.icon className="text-white" size={28} />
              </div>
              <span className="text-zinc-400 text-xs font-medium tracking-widest uppercase">{item.tag}</span>
              <h2 className="text-foreground text-2xl font-bold mt-2 mb-4">{item.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Why Choose Us</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4">The Carvio Difference</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {why.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex items-center gap-4 card-dark px-6 py-4">
                <CheckCircle2 className="text-zinc-400 flex-shrink-0" size={22} />
                <span className="text-foreground font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-primary">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Our Team</span>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mt-4">About Carvio Cabs</h1>
          </motion.div>

          <div className="max-w-3xl mx-auto text-center mb-12 px-6">
            <p className="text-zinc-400 leading-relaxed text-base md:text-lg">
              Carvio Cabs is a Mumbai-based premium cab booking and chauffeur-driven car rental company built for corporate clients, event planners and retail customers. With 30+ years of business experience, 50K+ trips completed, 25K+ happy customers and service presence across 50+ cities, Carvio Cabs focuses on professional drivers, clean vehicles, safe journeys and transparent pricing.
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            {TEAM.map((m, i) => (
              <motion.div 
                key={m.name} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1 }}
                onClick={() => { if (m.name === "Sunil Singh") setIsBioOpen(true); }}
                className={`card-dark p-6 text-center ${m.name === "Sunil Singh" ? "cursor-pointer hover:border-zinc-700 transition-all hover:scale-[1.02]" : ""}`}
              >
                <img src={m.img} alt={m.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-white/10" />
                <h3 className="text-foreground font-semibold text-lg">{m.name}</h3>
                <p className="text-zinc-400 text-sm">{m.role}</p>
                {m.name === "Sunil Singh" && (
                  <p className="text-zinc-500 text-xs mt-2 hover:text-white transition-colors">Click to read biography</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Ride with Carvio?</h2>
          <Link to="/book">
            <Button className="bg-white text-black hover:bg-zinc-200 font-semibold px-10 py-6 text-lg">
              Book Your Ride <ChevronRight className="ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Chauffeur Bio Modal */}
      <AnimatePresence>
        {isBioOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBioOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[85vh] bg-[#121212] border border-zinc-800 rounded-2xl overflow-y-auto p-6 md:p-10 scrollbar-thin shadow-2xl z-10 text-left"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsBioOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800/50 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start mb-8 pb-6 border-b border-zinc-800">
                <img 
                  src={resolveImageUrl("/uploads/ceo_sunil_singh.jpg")} 
                  alt="Sunil Singh" 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border border-zinc-800"
                />
                <div>
                  <span className="text-zinc-400 text-xs font-semibold tracking-widest uppercase">Executive Leadership Profile</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mt-1 mb-2">Sunil Singh</h2>
                  <p className="text-zinc-300 text-lg font-medium">CEO & Founder, Carvio Cabs</p>
                  <p className="text-zinc-500 text-sm mt-2">Pioneering Premium Chauffeur Services in India</p>
                </div>
              </div>

              {/* Biography Details */}
              <div className="prose prose-invert max-w-none text-zinc-300 space-y-6 text-sm md:text-base leading-relaxed font-normal">
                <h3 className="text-white text-xl font-semibold mb-2">Chapter 1: The Visionary Blueprint</h3>
                <p>
                  Sunil Singh, the Founder and Chief Executive Officer of Carvio Cabs, represents a new breed of Indian entrepreneurs who are redefining traditional business models through technology, customer-centric design, and operational excellence. Under his leadership, Carvio Cabs has evolved from a nascent transport service into a premium chauffeur-driven cab company known across metropolitan India for its punctuality, safety, and luxury.
                </p>
                <p>
                  Sunil’s journey is not just a tale of corporate success; it is a story of observation, conviction, and execution. Long before the first Carvio cab hit the streets of Mumbai, Sunil noticed a critical gap in the urban mobility market. While ride-hailing aggregators had commoditized point-to-point travel, they had failed to deliver the reliability, consistency, and professional decorum required by business leaders, corporate executives, and premium travelers. Sunil envisioned a service where the vehicle was not just a means of transport but an extension of the passenger's executive office—clean, quiet, safe, and absolutely punctual.
                </p>
                
                <h3 className="text-white text-xl font-semibold mb-2">Chapter 2: The Foundation of Excellence</h3>
                <p>
                  Born into a family that valued education and public service, Sunil was taught early on that integrity and work ethic are the twin pillars of any successful endeavor. He completed his early education with distinction, demonstrating a natural aptitude for logical problem-solving and systems design. This led him to pursue a degree in engineering, where he gained a deep appreciation for process optimization and technological architecture.
                </p>
                <p>
                  After completing his formal education, Sunil spent over a decade in various corporate roles, working closely with logistics, supply chain management, and client operations. During this time, he traveled extensively for business across India and internationally. These travels exposed him to the best executive transit networks globally, but they also highlighted the stark deficiencies in India’s premium cab ecosystem. Chauffeurs arriving late, unkempt vehicle interiors, unpredictable pricing, and a lack of safety standards were common complaints among business professionals. Sunil realized that the market was ripe for a disruption—not through discount pricing, but through premium service execution.
                </p>
                
                <h3 className="text-white text-xl font-semibold mb-2">Chapter 3: The Spark of Entrepreneurship</h3>
                <p>
                  The turning point came in 2018. During a critical business trip to Mumbai, Sunil missed a key client meeting due to a ride-hailing driver cancelling at the last minute—a common frustration in the aggregator model. This incident crystallized his resolve. He realized that corporate executives could not afford to base their schedules on the whims of algorithm-driven gig workers. They needed a guaranteed, professionally managed transit partner.
                </p>
                <p>
                  Sunil resigned from his comfortable corporate job and invested his life savings to start Carvio Cabs. The name 'Carvio' was conceived to reflect the values of vehicle excellence ('Car') and life/vitality ('Vi'). From day one, Sunil established a firm set of rules: Carvio would own or directly control its fleet to ensure uniform vehicle quality, chauffeurs would be full-time professionals rather than gig operators, and pricing would be transparent with a strict no-cancellation policy. This set Carvio apart from the aggregators and immediately attracted the attention of corporate clients who valued safety and reliability above all else.
                </p>
                
                <h3 className="text-white text-xl font-semibold mb-2">Chapter 4: Standardizing the Chauffeur Craft</h3>
                <p>
                  One of Sunil’s most significant contributions to Carvio Cabs is the standardization of chauffeur training. He recognized that the chauffeur is the primary touchpoint for the customer and the true ambassador of the brand. He established the 'Carvio Chauffeur Academy', a rigorous training program that covers defensive driving, route optimization, customer etiquette, emergency response, and spatial discretion.
                </p>
                <p>
                  "A great chauffeur knows when to speak, when to be silent, and how to anticipate the passenger's needs," Sunil often notes during academy graduations. Drivers at Carvio are trained to maintain absolute confidentiality, assist with luggage, verify vehicle climate settings in advance, and maintain a pristine personal appearance. This focus on chauffeur professionalism has become one of Carvio's strongest competitive advantages, securing multi-year contracts with top-tier multinational corporations, financial institutions, and luxury hotels.
                </p>
                
                <h3 className="text-white text-xl font-semibold mb-2">Chapter 5: Overcoming Initial Hurdles</h3>
                <p>
                  The early days of Carvio Cabs were far from easy. Standardizing logistics across multiple major cities, securing the capital needed to lease and maintain a premium fleet, and competing against multi-billion-dollar aggregators required immense resilience. Many industry veterans told Sunil that a company-owned, professional-driver model could not scale in a cost-sensitive market like India.
                </p>
                <p>
                  However, Sunil remained steadfast. He focused on a high-margin, high-retention B2B and premium B2C strategy. Instead of spending capital on mass-market customer acquisition, he built relationships with corporate travel desks, event organizers, and premium travel agencies. By delivering on his promise of zero-delay transit, Carvio began to grow rapidly through word-of-mouth recommendations. Sunil's financial discipline and focus on unit economics ensured that Carvio became profitable much faster than its venture-backed competitors.
                </p>
                
                <h3 className="text-white text-xl font-semibold mb-2">Chapter 6: The Innovation and Technological Edge</h3>
                <p>
                  While Sunil believes in traditional values of hospitality and service, he is equally passionate about leveraging technology to optimize operations. Under his direction, Carvio developed a proprietary fleet management and dispatch system that uses predictive modeling to ensure vehicles are positioned optimally ahead of peak corporate hours.
                </p>
                <p>
                  Unlike aggregators that rely on surge pricing to balance supply and demand, Carvio offers fixed corporate tariffs, giving clients budget predictability. The technology backplane also features automated real-time safety monitoring, including speed checks, route deviation alerts, and an emergency response protocol managed 24/7 by a dedicated command center. This integration of human vigilance and smart software has earned Carvio numerous industry awards for safety and technological integration in transit.
                </p>
                
                <h3 className="text-white text-xl font-semibold mb-2">Chapter 7: The Green Transition</h3>
                <p>
                  Looking toward the future, Sunil Singh is championing a massive shift in Carvio’s fleet composition. Recognizing the urgent need for environmental sustainability in urban centers, he has committed to transitioning 80% of Carvio's executive fleet to premium electric vehicles (EVs) by the year 2028.
                </p>
                <p>
                  "Premium transit should not come at the cost of the environment," Sunil states. Carvio has already partnered with leading EV manufacturers to pilot luxury electric sedans in Delhi-NCR and Mumbai. The company is also setting up its own fast-charging hubs near major airports and business districts to ensure maximum vehicle availability. This green initiative aligns perfectly with the sustainability mandates of Carvio's multinational corporate clients, making the company a preferred ESG-compliant vendor.
                </p>
                
                <h3 className="text-white text-xl font-semibold mb-2">Chapter 8: A Philosophy of Shared Success</h3>
                <p>
                  Sunil's leadership philosophy is rooted in empathy, respect, and mutual growth. He strongly believes that a service company can only keep its customers happy if its employees are treated with dignity. Consequently, Carvio offers its chauffeurs fair wages, comprehensive health insurance, retirement benefits, and structured career growth paths.
                </p>
                <p>
                  During the corporate lockdowns and health crises of recent years, Sunil took a personal pay cut to ensure that every driver and ground staff member received their salaries on time. This commitment to employee welfare has resulted in the lowest driver attrition rate in the Indian transport industry. By fostering a culture of pride and ownership among his team, Sunil has built an organization that is resilient, customer-focused, and primed for long-term growth.
                </p>
                
                <h3 className="text-white text-xl font-semibold mb-2">Chapter 9: Looking Beyond the Horizon</h3>
                <p>
                  Today, Carvio Cabs operates in over 20 major cities across India, managing a fleet of hundreds of premium vehicles and serving thousands of corporate accounts. Yet, Sunil Singh feels the journey has only just begun. Plans are underway to expand services to tier-2 cities and establish international travel desk partnerships to facilitate seamless transit bookings for business travelers visiting India.
                </p>
                <p>
                  Sunil remains active in day-to-day operations, regularly visiting regional hubs, meeting with corporate clients, and reviewing driver feedback. His hands-on leadership style, combined with a clear long-term vision, ensures that Carvio Cabs remains the gold standard of premium travel. As India's economy continues to expand, Sunil Singh and Carvio Cabs stand ready to drive the country's executive workforce forward, one punctual journey at a time.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <FAQSection page="about" />

      <Footer settings={settings} />
    </div>
  );
}
