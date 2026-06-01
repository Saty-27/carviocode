import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "@/apiConfig";
import { useSEO } from "@/hooks/useSEO";
import { Navbar, Footer } from "./HomePage";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Building2, 
  Clock4, 
  Map, 
  PartyPopper, 
  Bus, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  Milestone, 
  RefreshCw, 
  Train, 
  Users, 
  Briefcase 
} from "lucide-react";
import { resolveImageUrl } from "@/utils/imageUrl";

const ICON_MAP = { 
  Plane, 
  Building2, 
  Clock4, 
  Map, 
  PartyPopper, 
  Bus, 
  ShieldCheck, 
  Milestone, 
  RefreshCw, 
  Train 
};

const FALLBACK_SERVICES = [
  {
    service_id: "svc_airport",
    title: "Mumbai Airport Pickup & Drop Service",
    icon: "Plane",
    short_description: "Book reliable airport taxi service in Mumbai for domestic and international airport pickup and drop.",
    description: "Carvio Cabs provides safe and on-time Mumbai Airport pickup and drop service for business travellers, families, tourists and corporate guests. Pre-book your cab for early morning flights, late-night arrivals, domestic airport transfers and international airport travel. We provide airport taxi service from Santacruz, Andheri, Vile Parle, Bandra, Dadar, Mahim, Kurla, Goregaon, Churchgate, Matunga and nearby Mumbai locations.",
    image: "/uploads/airport-transfer-mumbai-cab.png",
    features: ["Flight schedule tracking", "Meet & greet at terminal gate", "24/7 client booking desk", "Fixed flat-rate pricing"]
  },
  {
    service_id: "svc_corporate",
    title: "Corporate Cab Service in Mumbai",
    icon: "Building2",
    short_description: "Professional cab service for companies, executives, employees, meetings and airport transfers.",
    description: "Carvio Cabs offers corporate cab service in Mumbai for business meetings, executive travel, employee transport, client pickup/drop and monthly company travel requirements. Our chauffeur-driven cars are suitable for office travel, airport transfers, guest movement and business events. We focus on punctuality, professional drivers, clean vehicles, transparent billing and reliable support for corporate clients.",
    image: "/uploads/corporate-cab-booking-mumbai.png",
    features: ["Monthly consolidated billing", "Dedicated travel desk portal", "Priority booking dispatch", "Professional uniformed chauffeurs"]
  },
  {
    service_id: "svc_outstation",
    title: "Outstation Cab Service From Mumbai",
    icon: "Map",
    short_description: "Book one-way and round-trip outstation cabs from Mumbai for business, family and weekend travel.",
    description: "Carvio Cabs provides outstation cab service from Mumbai for one-way and round-trip journeys. Whether you are planning a family trip, business visit, weekend getaway or long-distance travel, we offer comfortable cars with experienced drivers. Customers can book outstation taxis from Mumbai to nearby destinations such as Pune, Lonavala, Nashik, Shirdi, Alibaug, Mahabaleshwar and other routes based on availability.",
    image: "/uploads/outstation-taxi-from-mumbai.png",
    features: ["One-way & round trip taxi", "Experienced highway drivers", "Driver allowance included", "All-India tourist permit vehicles"]
  },
  {
    service_id: "svc_local",
    title: "Local Car Rental in Mumbai",
    icon: "Clock4",
    short_description: "Hourly cab rental with driver for city travel, meetings, shopping, family visits and local work.",
    description: "Carvio Cabs provides local car rental service in Mumbai for customers who need a cab for a few hours or a full day. Our local rental service is useful for office meetings, shopping, hospital visits, family functions, sightseeing, personal work and city travel. Book a chauffeur-driven car in Mumbai with flexible hourly packages and professional drivers.",
    image: "/uploads/local-rental-mumbai-chauffeur.png",
    features: ["Flexible hourly packages (4h/40km, 8h/80km)", "Multiple stops within the city", "AC sedans and premium SUVs", "Experienced local route drivers"]
  },
  {
    service_id: "svc_car_driver",
    title: "Car Rental With Driver in Mumbai",
    icon: "ShieldCheck",
    short_description: "Book chauffeur-driven cars in Mumbai with clean vehicles, trained drivers and easy booking.",
    description: "Carvio Cabs offers car rental with driver in Mumbai for airport transfers, local travel, corporate meetings, family trips, events and outstation journeys. Customers can choose from available sedans, SUVs and premium vehicles depending on travel needs. Our chauffeur-driven car rental service is designed for comfort, safety and professional travel experience.",
    image: "/uploads/car-rental-with-driver-mumbai-carvio-cabs.png",
    features: ["Verified background-checked drivers", "Premium clean vehicles", "Real-time GPS tracking", "24/7 customer helpline support"]
  },
  {
    service_id: "svc_wedding",
    title: "Wedding & Event Transportation in Mumbai",
    icon: "PartyPopper",
    short_description: "Cab and car rental service for weddings, guest pickup/drop, corporate events and private functions.",
    description: "Carvio Cabs provides wedding and event transportation service in Mumbai for guest pickup/drop, family travel, corporate events, parties, conferences and special occasions. Our cab service helps manage smooth travel for guests across multiple pickup and drop locations. We offer clean cars, professional drivers and organized transport support for events.",
    image: "/uploads/wedding-car-rental-mumbai.png",
    features: ["Decorated luxury wedding cars", "Multi-point guest logistics", "Dedicated coordinators on-site", "Flexible hourly event packages"]
  },
  {
    service_id: "svc_airport_cab",
    title: "Cab Service Near Mumbai Airport",
    icon: "Plane",
    short_description: "Reliable airport cab service from Santacruz, Andheri, Vile Parle, Bandra, Dadar and nearby areas.",
    description: "Looking for a cab service near Mumbai Airport? Carvio Cabs provides quick airport taxi booking for domestic and international airport travel. Our service is suitable for business travellers, families, tourists and corporate guests who need timely airport pickup or drop. We cover Santacruz, Vile Parle, Andheri, Bandra, Mahim, Dadar, Kurla, Goregaon, Matunga, Churchgate and nearby Mumbai areas.",
    image: "/uploads/mumbai-airport-cab-service-carvio-cabs.png",
    features: ["Instant pickup near Mumbai Airport", "Flight delay auto-tracking", "Professional airport luggage assistance", "Clean AC vehicles ready on arrival"]
  },
  {
    service_id: "svc_one_way",
    title: "One Way Cab Service From Mumbai",
    icon: "Milestone",
    short_description: "Book one-way taxi service from Mumbai for business trips, personal travel and outstation routes.",
    description: "Carvio Cabs offers one-way cab service from Mumbai for customers who only need drop service to another city or destination. Our one-way taxi booking is useful for business travel, airport drop, family visits and outstation travel. Customers can book clean cars with professional drivers and transparent fare details.",
    image: "/uploads/taxi-service-in-andheri-carvio-cabs.png",
    features: ["Pay only for one-way distance", "All-inclusive dynamic pricing", "Safe door-to-door drops", "Experienced long-haul chauffeurs"]
  },
  {
    service_id: "svc_round_trip",
    title: "Round Trip Cab Booking in Mumbai",
    icon: "RefreshCw",
    short_description: "Book round-trip cab service for outstation travel, business visits and family tours.",
    description: "Carvio Cabs provides round-trip cab booking from Mumbai for customers who need travel to a destination and return with the same vehicle. This service is ideal for business visits, family tours, weekend trips and planned outstation journeys. Our drivers are experienced and our cars are comfortable for long-distance travel.",
    image: "/uploads/outstation-taxi-from-mumbai.png",
    features: ["Same chauffeur for entire trip", "Flexible stopover points", "Best long-distance roundtrip rates", "24/7 highway roadside assistance"]
  },
  {
    service_id: "svc_railway",
    title: "Railway Station Pickup & Drop in Mumbai",
    icon: "Train",
    short_description: "Book cab service for railway station pickup and drop across Mumbai.",
    description: "Carvio Cabs provides railway station pickup and drop service in Mumbai for local and outstation passengers. Customers can book cabs for pickup or drop from major Mumbai railway stations including Bandra, Dadar, Andheri, Kurla, Churchgate, Mumbai Central and nearby locations. Our service is useful for families, business travellers and passengers with luggage.",
    image: "/uploads/mumbai-airport-pickup-drop-guide.png",
    features: ["Major station pickups (Dadar, Bandra, Kurla, CSMT)", "Luggage handling assistance", "On-time train-match dispatch", "Affordable local transit rates"]
  }
];

export default function ServicesPage() {
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [settings, setSettings] = useState({});
  const [fleet, setFleet] = useState([]);
  const [selected, setSelected] = useState(null);

  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Carvio Cabs Premium Services",
    "description": "Premium cab booking services in Mumbai including Airport Transfers, Corporate Travel, Outstation Trips, and local car rentals.",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Carvio Cabs",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Santacruz East",
        "addressLocality": "Mumbai",
        "addressRegion": "Maharashtra",
        "postalCode": "400055",
        "addressCountry": "IN"
      }
    }
  };

  useSEO({
    title: "Cab Services in Mumbai | Airport Taxi, Car Rental & Corporate Travel",
    description: "Book reliable cab services in Mumbai with Carvio Cabs. We provide airport transfers, car rental with driver, corporate travel, outstation trips, local rentals, wedding transport and one-way cab booking across Mumbai.",
    keywords: "Cab Services in Mumbai, airport transfer service Mumbai, corporate cab service Mumbai, chauffeur-driven car rental Mumbai, outstation taxi Mumbai",
    schema: servicesSchema
  });

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/services`).catch(() => ({ data: [] })),
      axios.get(`${API}/settings`).catch(() => ({ data: {} })),
      axios.get(`${API}/fleet`).catch(() => ({ data: [] }))
    ])
      .then(([s, st, fl]) => {
        if (s.data?.length > 0) setServices(s.data);
        setSettings(st.data);
        setFleet(fl.data || []);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-primary text-zinc-300">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,215,0,0.06)_0%,_transparent_60%)]" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#FFD700] text-sm font-medium tracking-widest uppercase">What We Offer</span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mt-4 mb-6">
              Premium Cab Services in Mumbai
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Carvio Cabs provides professional chauffeur-driven cab services across Mumbai for airport transfers, corporate travel, local rentals, outstation trips, weddings, events and private travel.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro section */}
      <section className="py-8 bg-primary">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="card-dark p-6 md:p-8 border border-zinc-800 bg-zinc-900/40 rounded-2xl backdrop-blur-md">
            <p className="text-zinc-300 leading-relaxed text-center text-sm md:text-base">
              Carvio Cabs is a premium cab service and chauffeur-driven car rental company based in Santacruz East, Mumbai. We offer reliable taxi services across Mumbai including Santacruz, Andheri, Vile Parle, Bandra, Mahim, Dadar, Matunga, Kurla, Goregaon, Churchgate, Mumbai Airport, Western Line, South Mumbai and Central Mumbai. Whether you need airport pickup and drop, local car rental, corporate cab service, outstation taxi, wedding transportation or one-way cab booking, Carvio Cabs provides clean cars, professional drivers, transparent pricing and easy booking support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 bg-primary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => {
              const Icon = ICON_MAP[s.icon] || Plane;
              return (
                <motion.div 
                  key={s.service_id} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: (i % 3) * 0.1 }}
                  className="service-card overflow-hidden group cursor-pointer rounded-2xl bg-zinc-900/60 border border-zinc-800/80 transition-all duration-300 hover:border-zinc-700/80" 
                  onClick={() => setSelected(selected?.service_id === s.service_id ? null : s)}
                >
                  {/* Fixed image wrapper (relative aspect-ratio prevents bleed overlay) */}
                  <div className="aspect-video bg-zinc-900 overflow-hidden relative">
                    <img src={resolveImageUrl(s.image)} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  
                  {/* Text area is outside the image container and completely readable */}
                  <div className="p-6 relative z-10">
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 flex items-center justify-center flex-shrink-0 border border-[#FFD700]/20">
                        <Icon className="text-[#FFD700]" size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-base leading-snug group-hover:text-[#FFD700] transition-colors">{s.title}</h3>
                        <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">{s.short_description}</p>
                      </div>
                    </div>

                    {/* Expandable features */}
                    {selected?.service_id === s.service_id && s.features?.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 border-t border-zinc-800/80 pt-4 space-y-2">
                        {s.features.map(f => (
                          <div key={f} className="flex items-center gap-2 text-zinc-300 text-xs leading-normal">
                            <CheckCircle2 className="text-[#FFD700] flex-shrink-0" size={14} /> {f}
                          </div>
                        ))}
                        <Link to="/book" className="block mt-4">
                          <Button className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold text-xs py-4">Book This Service</Button>
                        </Link>
                      </motion.div>
                    )}

                    {selected?.service_id !== s.service_id && (
                      <p className="text-[#FFD700] text-xs font-semibold mt-3.5 flex items-center gap-1.5">Click to view details <ChevronRight size={14} /></p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Service Copy Sections (Alternating grids for SEO rich readability) */}
      <section className="py-20 bg-secondary border-t border-b border-zinc-800/80">
        <div className="max-w-5xl mx-auto px-6 space-y-28">
          
          <div className="text-center mb-16">
            <span className="text-[#FFD700] text-sm font-medium tracking-widest uppercase">Transit Guide</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">Detailed Cab Solutions in Mumbai</h2>
            <p className="text-zinc-400 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
              Read more about our dedicated chauffeur-driven packages for city commutes, airport transits, and outstation trips.
            </p>
          </div>

          {services.map((s, index) => (
            <motion.div 
              key={`detail-${s.service_id}`} 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5 }}
              className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-10 items-center`}
            >
              <div className="w-full lg:w-1/2 aspect-video rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900 shadow-xl">
                <img src={resolveImageUrl(s.image)} alt={s.title} className="w-full h-full object-cover" />
              </div>
              <div className="w-full lg:w-1/2 space-y-4">
                <h3 className="text-2xl font-bold text-white leading-snug">{s.title}</h3>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                  {s.description || s.short_description}
                </p>
                <div className="pt-2 flex flex-wrap gap-2.5">
                  {s.features?.map(feat => (
                    <span key={feat} className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="text-[#FFD700]" size={12} /> {feat}
                    </span>
                  ))}
                </div>
                <div className="pt-4">
                  <Link to="/book">
                    <Button className="bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold text-xs px-6 py-2.5">
                      Book {s.title.split(" in ")[0]}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

        </div>
      </section>

      {/* Mumbai Service Areas Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
            <span className="text-[#FFD700] text-sm font-medium tracking-widest uppercase">Service Coverage</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Cab Service Across Mumbai</h2>
            <p className="text-zinc-400 text-base max-w-3xl mx-auto leading-relaxed">
              Carvio Cabs provides taxi service, cab service and car rental with driver across Mumbai. Our major service areas include Santacruz East, Santacruz West, Andheri East, Andheri West, Vile Parle, Bandra, Mahim, Dadar, Matunga, Kurla, Goregaon, Churchgate, Mumbai Airport, Western Line, South Mumbai and Central Mumbai. Customers can book cabs for airport transfers, local rentals, corporate travel, outstation trips, weddings and events.
            </p>
            
            <div className="pt-6 flex flex-wrap justify-center gap-2.5">
              {[
                "Santacruz Cab Service", "Andheri Taxi Service", "Vile Parle Airport Cab", 
                "Bandra Cab Service", "Dadar Taxi Service", "Mahim Cab Service", 
                "Kurla Cab Service", "Goregaon Car Rental", "Churchgate Taxi Service", 
                "Matunga Cab Service", "Mumbai Airport Cab"
              ].map(area => (
                <span key={area} className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-4 py-2 rounded-full font-medium hover:border-zinc-700 transition-colors">
                  {area}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Route Section */}
      <section className="py-20 bg-secondary border-t border-b border-zinc-800/80">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#FFD700] text-sm font-medium tracking-widest uppercase">Transit Rates</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">Popular Cab Routes in Mumbai</h2>
            <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto">
              Get flat transparent rates and experienced drivers on our most frequently booked travel routes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              "Santacruz to Mumbai Airport Cab", "Andheri to Mumbai Airport Cab", "Vile Parle to Mumbai Airport Taxi",
              "Bandra to Mumbai Airport Cab", "Dadar to Mumbai Airport Cab", "Mahim to Airport Taxi",
              "Kurla to Mumbai Airport Cab", "Goregaon to Mumbai Airport Cab", "Churchgate to Mumbai Airport Taxi",
              "Matunga to Airport Cab", "Mumbai to Pune Outstation Cab", "Mumbai to Lonavala Taxi",
              "Mumbai to Nashik Cab", "Mumbai to Shirdi Cab"
            ].map(route => (
              <div key={route} className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between group hover:border-[#FFD700]/30 transition-all duration-300">
                <div className="space-y-1">
                  <p className="text-white text-sm font-semibold group-hover:text-[#FFD700] transition-colors">{route}</p>
                  <p className="text-zinc-500 text-xs font-medium">Verified local driver attached</p>
                </div>
                <Link to="/book" className="text-[#FFD700] hover:text-[#E5C100]">
                  <ChevronRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Carvio Cabs Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#FFD700] text-sm font-medium tracking-widest uppercase">Core Values</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
              Why Choose Carvio Cabs for Cab Service in Mumbai?
            </h2>
            <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              We stand out in the premium travel space because of our core focus on customer safety, comfort and transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Professional Drivers",
                desc: "Our chauffeurs are trained, polite and experienced for airport transfers, corporate travel, local rides and outstation trips."
              },
              {
                title: "Clean & Comfortable Cars",
                desc: "We provide well-maintained vehicles suitable for business travel, family rides, airport journeys and event transportation."
              },
              {
                title: "On-Time Pickup",
                desc: "We understand the importance of time, especially for airport drops, meetings and corporate travel."
              },
              {
                title: "Transparent Pricing",
                desc: "Customers get clear fare details based on trip type, pickup location, drop location, travel date, time and car type."
              },
              {
                title: "Easy Booking Support",
                desc: "Book your cab through the website, call or WhatsApp with your travel details."
              },
              {
                title: "Mumbai Route Experience",
                desc: "Our service covers Santacruz, Andheri, Bandra, Vile Parle, Dadar, Mahim, Kurla, Goregaon, Churchgate and nearby areas."
              }
            ].map((card, i) => (
              <div key={card.title} className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 flex items-center justify-center border border-[#FFD700]/20">
                  <CheckCircle2 className="text-[#FFD700]" size={20} />
                </div>
                <h3 className="text-white font-bold text-base">{card.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Preview Section */}
      {fleet && fleet.length > 0 && (
        <section className="py-20 bg-secondary border-t border-b border-zinc-800/80">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
              <div>
                <span className="text-[#FFD700] text-sm font-medium tracking-widest uppercase">Our Fleet</span>
                <h2 className="text-3xl font-bold text-white mt-3">Premium Vehicles in Mumbai</h2>
              </div>
              <Link to="/fleet">
                <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white mt-4 md:mt-0 text-xs">
                  View All Fleet <ChevronRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fleet.slice(0, 3).map((car) => (
                <div key={car.car_id} className="fleet-card rounded-2xl overflow-hidden bg-zinc-900/60 border border-zinc-800">
                  <div className="aspect-video bg-zinc-900 overflow-hidden relative">
                    <img src={resolveImageUrl(car.image)} alt={car.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-bold text-base mb-1.5">{car.name}</h3>
                    <div className="flex items-center gap-4 text-zinc-400 text-xs mb-4">
                      <span className="flex items-center gap-1"><Users size={12} /> {car.passengers} Passengers</span>
                      <span className="flex items-center gap-1"><Briefcase size={12} /> {car.luggage} Bags</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                      <span className="text-white font-bold text-sm">₹{car.price_per_km}/km</span>
                      <Link to={`/fleet/${car.car_id}`} className="text-[#FFD700] hover:text-[#E5C100] text-xs font-semibold flex items-center gap-1">
                        Book Vehicle <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Accordion FAQ Section */}
      <FAQSection page="services" />

      {/* Bottom CTA Block */}
      <section className="py-20 bg-primary text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-bold text-white">Not Sure Which Service Is Right For You?</h2>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed">
            Chat with us on WhatsApp or call our support team directly — our reservation desk will help you select the ideal car for your travel.
          </p>
          <div className="flex justify-center gap-4 flex-wrap pt-2">
            <a href="tel:+919594312974">
              <Button variant="outline" className="border-zinc-800 text-white hover:bg-zinc-900 font-semibold px-8 py-5 text-xs">
                Call: +91 95943 12974
              </Button>
            </a>
            <a href="https://wa.me/919594312974?text=Hello%20Carvio%20Cabs,%20I%20would%20like%20to%20book%20a%20cab%20in%20Mumbai." target="_blank" rel="noreferrer">
              <Button className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold px-8 py-5 text-xs">
                WhatsApp Us
              </Button>
            </a>
          </div>
        </motion.div>
      </section>

      <Footer settings={settings} />
    </div>
  );
}
