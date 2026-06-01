import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { useAuth } from "@/context/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import FAQSection from "@/components/FAQSection";
import ThemeToggle from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { resolveImageUrl } from "@/utils/imageUrl";
import {
  Car, Clock, Shield, Phone, CreditCard, Star, MapPin,
  Calendar as CalendarIcon, Users, Briefcase, ChevronRight,
  Menu, X, Plane, Building2, Clock4, Map, PartyPopper, Bus,
  Banknote, CheckCircle2, Play, Facebook, Instagram, Twitter, Mail
} from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_1a245343-e48a-4d95-b813-d4323c66be82/artifacts/ceogvz6u_WhatsApp%20Image%202026-02-01%20at%2014.34.50.jpeg";
const DEFAULT_HERO_BG = "https://images.unsplash.com/photo-1564181064972-432b6f96c0ef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBibGFjayUyMG1lcmNlZGVzJTIwcyUyMGNsYXNzJTIwY2hhdWZmZXVyJTIwY2l0eSUyMG5pZ2h0fGVufDB8fHx8MTc3MTkyOTQzNHww&ixlib=rb-4.1.0&q=85";

// ===== NAVBAR =====
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [dynamicPages, setDynamicPages] = useState([]);

  useEffect(() => {
    axios.get(`${API}/pages`).then(res => {
      setDynamicPages(res.data.filter(p => p.show_in_navbar));
    }).catch(() => {});
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/fleet", label: "Fleet" },
    ...dynamicPages.map(p => ({ to: `/pages/${p.slug}`, label: p.title })),
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/95 backdrop-blur-xl border-b border-zinc-800/80" : "bg-black/80 backdrop-blur-xl border-b border-zinc-800/50"}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Carvio Cabs" className="h-12 w-12 rounded-full" />
            <span className="text-xl font-bold text-white dark:text-white hidden sm:block">Carvio Cabs</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className="text-zinc-400 hover:text-white dark:hover:text-white text-sm transition-colors">{l.label}</Link>
            ))}
            {user ? (
              <>
                <Link to="/book">
                  <Button className="bg-white text-black hover:bg-zinc-200 font-medium" data-testid="book-btn">Book Now</Button>
                </Link>
                <Link to="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors">My Trips</Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="text-zinc-400 hover:text-white text-sm transition-colors">Admin</Link>
                )}
                <Button variant="ghost" onClick={logout} className="text-zinc-400 hover:text-white text-sm" data-testid="logout-btn">Logout</Button>
              </>
            ) : (
              <>
                <Link to="/book">
                  <Button className="bg-white text-black hover:bg-zinc-200 font-medium" data-testid="login-btn">Book Now</Button>
                </Link>
                <Link to="/login" className="text-zinc-400 hover:text-white text-sm transition-colors">Login</Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button className="text-white dark:text-white p-2" onClick={() => setIsOpen(!isOpen)} data-testid="mobile-menu-btn">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden py-4 border-t border-zinc-800">
            <div className="flex flex-col gap-3">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} className="text-zinc-400 hover:text-white py-2 text-sm" onClick={() => setIsOpen(false)}>{l.label}</Link>
              ))}
              <Link to="/book" onClick={() => setIsOpen(false)}>
                <Button className="bg-white text-black hover:bg-zinc-200 font-medium w-full mt-2">Book Now</Button>
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-zinc-400 hover:text-white py-2 text-sm" onClick={() => setIsOpen(false)}>My Trips</Link>
                  {user.role === "admin" && (
                    <Link to="/admin" className="text-zinc-400 hover:text-white py-2 text-sm" onClick={() => setIsOpen(false)}>Admin</Link>
                  )}
                  <Button variant="ghost" onClick={() => { logout(); setIsOpen(false); }} className="text-zinc-400 hover:text-white justify-start px-0 text-sm">Logout</Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white py-2 text-sm">Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};


// ===== FOOTER =====
export const Footer = ({ settings }) => {
  const [siteSettings, setSiteSettings] = useState(settings || null);

  const [footerPages, setFooterPages] = useState([]);

  useEffect(() => {
    if (!settings) {
      axios.get(`${API}/settings`).then(r => setSiteSettings(r.data)).catch(() => {});
    }
    axios.get(`${API}/pages`).then(res => {
      setFooterPages(res.data.filter(p => p.show_in_footer));
    }).catch(() => {});
  }, [settings]);

  const s = siteSettings || {};

  return (
    <footer className="bg-secondary border-t border-border py-16" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src={LOGO_URL} alt="Carvio Cabs" className="h-12 w-12 rounded-full" />
              <span className="text-xl font-bold text-foreground">{s.company_name || "Carvio Cabs"}</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {s.footer_tagline || "Carvio Cabs provides premium cab service, airport transfers, chauffeur-driven car rental, corporate travel and outstation taxi service across Mumbai."}
            </p>
            <div className="flex gap-3">
              {s.facebook && <a href={s.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-all"><Facebook size={16} /></a>}
              {s.instagram && <a href={s.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-all"><Instagram size={16} /></a>}
              {s.twitter && <a href={s.twitter} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-all"><Twitter size={16} /></a>}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/fleet" className="text-zinc-500 hover:text-white text-sm transition-colors">Our Fleet</Link>
              <Link to="/book" className="text-zinc-500 hover:text-white text-sm transition-colors">Book a Ride</Link>
              <Link to="/services" className="text-zinc-500 hover:text-white text-sm transition-colors">Services</Link>
              <Link to="/blog" className="text-zinc-500 hover:text-white text-sm transition-colors">Blog</Link>
              <Link to="/dashboard" className="text-zinc-500 hover:text-white text-sm transition-colors">My Bookings</Link>
              {footerPages.filter(p => p.slug !== 'terms-of-service' && p.slug !== 'privacy-policy').map(p => (
                <Link key={p.page_id} to={`/pages/${p.slug}`} className="text-zinc-500 hover:text-white text-sm transition-colors">{p.title}</Link>
              ))}
              <Link to="/privacy" className="text-zinc-500 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-zinc-500 hover:text-white text-sm transition-colors">Terms of Service</Link>
              <Link to="/sitemap" className="text-zinc-500 hover:text-white text-sm transition-colors">Sitemap</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <div className="flex flex-col gap-2">
              <span className="text-zinc-500 text-sm">Airport Transfers</span>
              <span className="text-zinc-500 text-sm">Corporate Travel</span>
              <span className="text-zinc-500 text-sm">Outstation Trips</span>
              <span className="text-zinc-500 text-sm">Wedding & Events</span>
              <span className="text-zinc-500 text-sm">Local Rentals</span>
              <span className="text-zinc-500 text-sm">Car Rental With Driver</span>
              <span className="text-zinc-500 text-sm">Mumbai Airport Cab</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="flex flex-col gap-3">
              <span className="text-zinc-500 text-sm font-semibold text-white">Santacruz East, Mumbai</span>
              
              <a href="tel:+919594312974" className="text-zinc-500 hover:text-white text-sm transition-colors flex items-center gap-2">
                <Phone size={14} /> +91 95943 12974
              </a>
              
              <a href="https://wa.me/919594312974" target="_blank" rel="noreferrer"
                className="text-zinc-500 hover:text-white text-sm transition-colors flex items-center gap-2">
                WhatsApp: +91 95943 12974
              </a>
              
              <span className="text-zinc-500 text-xs leading-normal mt-1 border-t border-zinc-800/40 pt-2 block">
                <strong>Address:</strong> Office No 205, Dhobi Ghat, Sagar Avenue, 2nd Floor, B-Wing, Vakola, Santacruz East, Mumbai, Maharashtra 400055
              </span>

              <div className="text-zinc-500 text-xs leading-normal mt-1 pt-1 border-t border-zinc-800/40">
                <span className="font-semibold text-white block">Availability:</span>
                24 × 7 Customer Support
                <a href="mailto:sunilramsuratsingh2102@gmail.com" className="block text-[#FFD700] hover:underline mt-0.5">
                  sunilramsuratsingh2102@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} {s.company_name || "Carvio Cabs"}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">Privacy Policy</Link>
            <span className="text-zinc-700">|</span>
            <Link to="/terms" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">Terms of Service</Link>
            <span className="text-zinc-700">|</span>
            <Link to="/sitemap" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Static data
const trustCards = [
  { icon: Clock, title: "On-Time Airport Pickup", desc: "Reliable pickup and drop service for Mumbai Airport, business travel and early morning rides." },
  { icon: Shield, title: "Professional Chauffeurs", desc: "Trained, polite and experienced drivers for safe city, airport and outstation travel." },
  { icon: Car, title: "Clean Premium Vehicles", desc: "Well-maintained cars including sedans, SUVs and premium fleet options for every travel need." },
  { icon: CreditCard, title: "Transparent Billing", desc: "Clear pricing for local rentals, airport transfers, outstation trips and corporate bookings." },
  { icon: Phone, title: "24/7 Booking Support", desc: "Call or WhatsApp Carvio Cabs anytime for urgent taxi and cab bookings in Mumbai." },
];

const staticServices = [
  { icon: Plane, title: "Airport Transfer", desc: "Hassle-free airport pickups and drops" },
  { icon: Building2, title: "Corporate Travel", desc: "Dedicated solutions for businesses" },
  { icon: Clock4, title: "Local Rental", desc: "Hourly packages for city travel" },
  { icon: Map, title: "Outstation Trip", desc: "Comfortable long-distance journeys" },
  { icon: PartyPopper, title: "Wedding/Event", desc: "Special occasions deserve special rides" },
  { icon: Bus, title: "Employee Transport", desc: "Daily office commute solutions" },
];

export default function HomePage() {
  const [fleet, setFleet] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [videos, setVideos] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [packages, setPackages] = useState([]);
  const [settings, setSettings] = useState({ enable_cash_payment: true, hero_heading: "", hero_subheading: "", hero_bg_image: "" });
  const [homepageSections, setHomepageSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // LocalBusiness/TaxiService JSON-LD Schema
  const taxiSchema = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "name": "Carvio Cabs - Premium Cab Service Mumbai",
    "description": "Book premium cab service in Mumbai with Carvio Cabs. We offer airport pickup and drop, chauffeur-driven car rental, corporate travel, local rental, outstation cab service and event transportation across Mumbai.",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Carvio Cabs",
      "image": "https://carviocabs.com/uploads/favicon.png",
      "telephone": "+91 95943 12974",
      "email": "support@carviocabs.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Office No 205, Dhobi Ghat, Sagar Avenue, 2nd Floor, B-Wing, Vakola, Santacruz East",
        "addressLocality": "Mumbai",
        "addressRegion": "Maharashtra",
        "postalCode": "400055",
        "addressCountry": "IN"
      },
      "priceRange": "₹₹",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "19.0805",
        "longitude": "72.8465"
      }
    },
    "areaServed": [
      { "@type": "AdministrativeArea", "name": "Mumbai" },
      { "@type": "AdministrativeArea", "name": "Santacruz East" },
      { "@type": "AdministrativeArea", "name": "Andheri" },
      { "@type": "AdministrativeArea", "name": "Bandra" },
      { "@type": "AdministrativeArea", "name": "Vile Parle" },
      { "@type": "AdministrativeArea", "name": "Dadar" }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do you provide cab service in Mumbai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Carvio Cabs provides cab service across Mumbai including Santacruz, Andheri, Vile Parle, Bandra, Dadar, Mahim, Kurla, Goregaon, Churchgate, Matunga and nearby areas."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide Mumbai Airport pickup and drop?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Carvio Cabs provides airport pickup and drop service for Mumbai domestic and international airport with professional drivers and clean vehicles."
        }
      },
      {
        "@type": "Question",
        "name": "Can I book car rental with driver in Mumbai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can book chauffeur-driven car rental in Mumbai for local travel, corporate trips, family travel, airport transfers and events."
        }
      }
    ]
  };

  useSEO({
    title: "Carvio Cabs | Premium Cab Service, Airport Taxi & Car Rental in Mumbai",
    description: "Book premium cab service in Mumbai with Carvio Cabs. We offer airport pickup and drop, chauffeur-driven car rental, corporate travel, local rental, outstation cab service and event transportation across Mumbai.",
    keywords: "cab service in Mumbai, taxi service in Mumbai, car rental in Mumbai, car rental with driver in Mumbai, chauffeur driven car rental Mumbai, premium cab service Mumbai, airport taxi Mumbai, Mumbai airport pickup and drop",
    schema: {
      "@context": "https://schema.org",
      "@graph": [taxiSchema, faqSchema]
    }
  });

  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [pickupDate, setPickupDate] = useState(null);
  const [pickupTime, setPickupTime] = useState("");
  const [tripType, setTripType] = useState("one_way");
  const [selectedCar, setSelectedCar] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadMessage, setLeadMessage] = useState("");

  useEffect(() => {
    if (user) {
      setLeadName(user.name || "");
      setLeadEmail(user.email || "");
      setLeadPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/fleet`),
      axios.get(`${API}/testimonials`),
      axios.get(`${API}/gallery`),
      axios.get(`${API}/videos`),
      axios.get(`${API}/blogs?limit=6`),
      axios.get(`${API}/packages`),
      axios.get(`${API}/settings`),
      axios.get(`${API}/pages`),
    ]).then(([fleetR, testR, galR, vidR, blogR, pkgR, setR, pagesR]) => {
      setFleet(fleetR.data);
      setTestimonials(testR.data);
      setGallery(galR.data.slice(0, 9));
      setVideos(vidR.data.slice(0, 3));
      setBlogs(blogR.data);
      setPackages(pkgR.data);
      setSettings(setR.data || {});
      setHomepageSections((pagesR.data || []).filter(p => p.show_on_homepage));
    }).catch(e => console.error(e)).finally(() => setLoading(false));
  }, []);

  const handleSearchFare = async () => {
    if (!pickupLocation || !leadName || !leadPhone || !leadEmail) {
      toast.error("Please fill in all required fields (Pickup, Name, Phone, Email)");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        pickup_location: pickupLocation,
        drop_location: dropLocation || "Not specified",
        pickup_date: pickupDate ? format(pickupDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        pickup_time: pickupTime || "ASAP",
        trip_type: tripType,
        car_preference: selectedCar || "Any",
        message: leadMessage
      };

      const res = await axios.post(`${API}/leads`, payload);
      toast.success(res.data.message || "Enquiry submitted successfully!");

      // Send Web3Forms email notification from client-side
      try {
        const formData = new FormData();
        formData.append("access_key", "43dadfae-99d2-46d0-841a-cf5747e0ced7");
        formData.append("subject", `New Booking Enquiry - ${leadName}`);
        formData.append("from_name", "Carvio Cabs");
        formData.append("name", leadName);
        formData.append("email", leadEmail);
        formData.append("message", `
New Homepage Enquiry:
----------------------
Name: ${leadName}
Email: ${leadEmail}
Phone: ${leadPhone}
Pickup Location: ${pickupLocation}
Drop Location: ${dropLocation || "Not specified"}
Pickup Date: ${pickupDate ? format(pickupDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
Pickup Time: ${pickupTime || "ASAP"}
Trip Type: ${tripType}
Car Preference: ${selectedCar || "Any"}
Message: ${leadMessage || "None"}
        `);

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        }).then(r => r.json()).then(data => {
          console.log("Web3Forms response:", data);
        }).catch(err => console.error("Web3Forms submit error:", err));
      } catch (err) {
        console.error("Web3Forms fetch error:", err);
      }

      // Optional: Clear form
      setPickupLocation("");
      setDropLocation("");
      setLeadMessage("");
    } catch (e) {
      toast.error("Failed to submit enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  const heroBg = settings.hero_bg_image ? resolveImageUrl(settings.hero_bg_image) : DEFAULT_HERO_BG;
  const heroHeading = settings.hero_heading || "Premium Cab Service & Car Rental With Driver in Mumbai";
  const heroSubheading = settings.hero_subheading || "Book safe, clean and professional chauffeur-driven cabs for airport transfers, corporate travel, local rentals, outstation trips and events across Mumbai.";

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Luxury car" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="gold-line mb-6" />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {heroHeading}
              </h1>
              <p className="text-zinc-300 text-lg md:text-xl max-w-lg mb-8">{heroSubheading}</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/book">
                  <Button className="bg-[#FFD700] text-black hover:bg-[#E5C100] font-medium px-8 py-6 text-lg" data-testid="hero-book-btn">
                    Book Now <ChevronRight className="ml-2" />
                  </Button>
                </Link>
                {settings.whatsapp && (
                  <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-border text-white hover:bg-white/10 px-8 py-6 text-lg" data-testid="whatsapp-btn">
                      WhatsApp Booking
                    </Button>
                  </a>
                )}
                {!settings.whatsapp && (
                  <a href="https://wa.me/919594312974" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-border text-white hover:bg-white/10 px-8 py-6 text-lg" data-testid="whatsapp-btn">
                      WhatsApp Booking
                    </Button>
                  </a>
                )}
              </div>
            </motion.div>

            {/* Booking Widget */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="glass rounded-xl p-6 md:p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Quick Booking</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-zinc-300 text-sm mb-2 block">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFD700]" size={18} />
                    <Input placeholder="Pickup Location in Mumbai" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="pl-10 bg-black/40 border-white/10 focus:border-[#FFD700] h-12 text-white" data-testid="pickup-input" />
                  </div>
                </div>
                <div>
                  <label className="text-zinc-300 text-sm mb-2 block">Drop Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <Input placeholder="Drop Location / Destination" value={dropLocation} onChange={(e) => setDropLocation(e.target.value)} className="pl-10 bg-black/40 border-white/10 focus:border-[#FFD700] h-12 text-white" data-testid="drop-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 text-sm mb-2 block">Pickup Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-black/40 border-white/10 hover:bg-black/60 text-left h-12" data-testid="date-picker-btn">
                          <CalendarIcon className="mr-2 text-[#FFD700]" size={18} />
                          <span className={pickupDate ? "text-white" : "text-zinc-400"}>{pickupDate ? format(pickupDate, "MMM dd") : "Select Pickup Date"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-secondary border-border" align="start">
                        <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate} disabled={(date) => date < new Date()} className="bg-secondary text-foreground" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-zinc-300 text-sm mb-2 block">Pickup Time</label>
                    <Select value={pickupTime} onValueChange={setPickupTime}>
                      <SelectTrigger className="bg-black/40 border-white/10 h-12" data-testid="time-select">
                        <SelectValue placeholder="Time" />
                      </SelectTrigger>
                      <SelectContent className="bg-secondary border-border">
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>{`${i.toString().padStart(2, "0")}:00`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select value={tripType} onValueChange={setTripType}>
                    <SelectTrigger className="bg-black/40 border-white/10 h-10 text-xs" data-testid="trip-type-select"><SelectValue placeholder="Trip Type" /></SelectTrigger>
                    <SelectContent className="bg-secondary border-border">
                      <SelectItem value="one_way">One Way Cab</SelectItem>
                      <SelectItem value="round_trip">Round Trip Cab</SelectItem>
                      <SelectItem value="rental">Local Rental</SelectItem>
                      <SelectItem value="airport_transfer">Airport Transfer</SelectItem>
                      <SelectItem value="corporate">Corporate Booking</SelectItem>
                      <SelectItem value="event">Event Booking</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedCar} onValueChange={setSelectedCar}>
                    <SelectTrigger className="bg-black/40 border-white/10 h-10 text-xs" data-testid="car-select"><SelectValue placeholder="Choose Car Type" /></SelectTrigger>
                    <SelectContent className="bg-secondary border-border">
                      {fleet && fleet.length > 0 ? (
                        fleet.map((car) => (
                          <SelectItem key={car.car_id || car.name} value={car.name}>
                            {car.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="SUV">SUV (Innova/Ertiga)</SelectItem>
                          <SelectItem value="Luxury">Luxury</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Name *" value={leadName} onChange={(e) => setLeadName(e.target.value)} className="bg-black/40 border-white/10 h-10 text-xs text-white" />
                  <Input placeholder="Phone *" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} className="bg-black/40 border-white/10 h-10 text-xs text-white" />
                </div>
                <Input placeholder="Email *" type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} className="bg-black/40 border-white/10 h-10 text-xs text-white" />

                <textarea
                  placeholder="Message (Special requirements...)"
                  value={leadMessage}
                  onChange={(e) => setLeadMessage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-xs text-white h-16 resize-none focus:border-[#FFD700] outline-none"
                />

                 <Button onClick={handleSearchFare} className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold h-11 text-sm mt-2" data-testid="search-fare-btn">
                  Get Free Quote
                </Button>
                
                <p className="text-zinc-500 text-[10px] md:text-xs leading-normal mt-3 text-center">
                  Pre-book your cab in Mumbai for airport pickup, local travel, corporate meetings, outstation trips and event transportation. Carvio Cabs provides professional drivers, clean vehicles and transparent billing.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TRUST ===== */}
      <section className="py-20 md:py-32 bg-primary">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Why Choose Us</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4">Trusted by Thousands</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustCards.map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-dark p-6 group">
                <div className="w-12 h-12 rounded-lg bg-zinc-800/50 flex items-center justify-center mb-4 group-hover:bg-zinc-800 transition-colors">
                  <card.icon className="text-white" size={24} />
                </div>
                <h3 className="text-foreground font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-muted-foreground text-sm">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PACKAGES ===== */}
      {packages.length > 0 && (
        <section className="py-20 md:py-32 bg-secondary">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Our Packages</span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4">Choose Your Package</h2>
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto">Fixed-price packages with no hidden charges. Pick what suits your journey.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg, i) => (
                <motion.div key={pkg.pkg_id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-dark overflow-hidden group">
                  {pkg.image && (
                    <div className="aspect-video overflow-hidden">
                      <img src={resolveImageUrl(pkg.image)} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-foreground font-bold text-xl">{pkg.name}</h3>
                      <div className="text-right">
                        <p className="text-white font-bold text-2xl">₹{pkg.price}</p>
                        <p className="text-muted-foreground text-xs">{pkg.duration}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{pkg.short_desc || pkg.description}</p>
                    {pkg.features?.length > 0 && (
                      <ul className="space-y-1.5 mb-5">
                        {pkg.features.slice(0, 3).map(f => (
                          <li key={f} className="flex items-center gap-2 text-muted-foreground text-sm">
                            <CheckCircle2 className="text-zinc-400 flex-shrink-0" size={14} /> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link to="/book">
                      <Button className="w-full bg-white text-black hover:bg-zinc-200 font-semibold">Book Now</Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FLEET ===== */}
      <section className="py-20 md:py-32 bg-primary">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Our Fleet</span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4">Premium Vehicles</h2>
            </div>
            <Link to="/fleet">
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary mt-4 md:mt-0" data-testid="view-all-fleet-btn">
                View All <ChevronRight className="ml-2" size={18} />
              </Button>
            </Link>
          </motion.div>
          {loading ? (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fleet.map((car, i) => (
                <motion.div key={car.car_id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/fleet/${car.car_id}`}>
                    <div className="fleet-card cursor-pointer rounded-xl overflow-hidden" data-testid={`fleet-card-${car.car_id}`}>
                      <div className="aspect-video bg-secondary overflow-hidden">
                        <img src={resolveImageUrl(car.image)} alt={car.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-5">
                        <h3 className="text-foreground font-semibold text-lg mb-2">{car.name}</h3>
                        <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
                          <span className="flex items-center gap-1"><Users size={14} /> {car.passengers}</span>
                          <span className="flex items-center gap-1"><Briefcase size={14} /> {car.luggage}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">₹{car.price_per_km}/km</span>
                          <ChevronRight className="text-muted-foreground" size={18} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="py-20 md:py-32 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Services</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4">What We Offer</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staticServices.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="service-card p-6 rounded-xl">
                <div className="w-14 h-14 rounded-xl bg-zinc-800/50 flex items-center justify-center mb-4">
                  <s.icon className="text-white" size={28} />
                </div>
                <h3 className="text-foreground font-semibold text-xl mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PHOTO GALLERY ===== */}
      {gallery.length > 0 && (
        <section className="py-20 md:py-32 bg-primary">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Gallery</span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4">A Glimpse of Carvio</h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {gallery.map((img, i) => (
                <motion.div key={img.image_id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className={`relative overflow-hidden rounded-lg group ${i === 0 || i === 4 ? "md:col-span-1 row-span-2" : ""}`}
                  style={{ aspectRatio: (i === 0 || i === 4) ? "1/1" : "4/3" }}
                >
                  <img src={resolveImageUrl(img.image)} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm font-medium">{img.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== VIDEO SECTION ===== */}
      {videos.length > 0 && (
        <section className="py-20 md:py-32 bg-secondary">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Experience Carvio</span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4">Watch & Feel the Difference</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((v, i) => {
                const ytId = getYouTubeId(v.video_url);
                return (
                  <motion.div key={v.video_id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-dark overflow-hidden">
                    <div className="aspect-video bg-secondary">
                      {ytId ? (
                        <iframe src={`https://www.youtube.com/embed/${ytId}`} title={v.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      ) : (
                        <video src={resolveImageUrl(v.video_url)} poster={v.thumbnail ? resolveImageUrl(v.thumbnail) : undefined} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-foreground font-semibold">{v.title}</h3>
                      {v.description && <p className="text-muted-foreground text-sm mt-1">{v.description}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== PAYMENT OPTIONS ===== */}
      <section className="py-20 md:py-32 bg-primary">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Payment</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4">Flexible Payment Options</h2>
          </motion.div>
          <div className={`grid grid-cols-1 gap-6 ${settings.enable_cash_payment ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
            {[
              { icon: CreditCard, title: "Full Advance", desc: "Pay 100% upfront and get instant booking confirmation.", tag: "Recommended", color: "#10B981" },
              { icon: CreditCard, title: "50% Advance", desc: "Pay half now, remaining after trip completion.", tag: "Popular Choice", color: "#FFFFFF" },
              { icon: Building2, title: "Corporate Billing", desc: "Monthly invoicing for approved corporate accounts.", tag: "For Businesses", color: "#3B82F6" },
              ...(settings.enable_cash_payment ? [{ icon: Banknote, title: "Pay After Drop", desc: "Pay your driver directly in cash or UPI after reaching your destination.", tag: "Available Now", color: "#8B5CF6" }] : []),
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-dark p-8 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${item.color}15` }}>
                  <item.icon style={{ color: item.color }} size={32} />
                </div>
                <h3 className="text-foreground font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm">{item.desc}</p>
                <span className="text-sm font-medium" style={{ color: item.color }}>{item.tag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {testimonials.length > 0 && (
        <section className="py-20 md:py-32 bg-secondary">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Testimonials</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mt-4">What Our Clients Say</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div key={t.testimonial_id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-dark p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating }, (_, k) => <Star key={k} className="text-white fill-white" size={16} />)}
                  </div>
                  <p className="text-zinc-400 mb-6 italic">"{t.content}"</p>
                  <div>
                    <p className="text-white font-semibold">{t.name}</p>
                    <p className="text-zinc-500 text-sm">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== BLOG PREVIEW ===== */}
      {blogs.length > 0 && (
        <section className="py-20 md:py-32 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Blog</span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mt-4">Latest Stories</h2>
              </div>
              <Link to="/blog">
                <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 mt-4 md:mt-0">
                  View All <ChevronRight className="ml-2" size={18} />
                </Button>
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog, i) => (
                <motion.article key={blog.blog_id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-dark overflow-hidden group">
                  <Link to={`/blog/${blog.slug}`}>
                    <div className="aspect-video bg-zinc-900 overflow-hidden">
                      {blog.image ? (
                        <img src={resolveImageUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                          <span className="text-4xl">✍️</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-zinc-400 text-xs font-medium">{blog.category}</span>
                      <h3 className="text-white font-bold text-lg mt-1 mb-2 group-hover:text-white transition-colors line-clamp-2">{blog.title}</h3>
                      <p className="text-zinc-500 text-sm line-clamp-2">{blog.short_description}</p>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== DYNAMIC SECTIONS ===== */}
      {homepageSections.length > 0 && homepageSections.map((sec, idx) => (
        <section 
          key={sec.page_id} 
          className={`py-20 md:py-32 ${idx % 2 === 0 ? "bg-secondary" : "bg-primary"}`}
        >
          <div className="max-w-4xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4">{sec.title}</h2>
              {sec.meta_description && (
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto">{sec.meta_description}</p>
              )}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              viewport={{ once: true }} 
              className="prose prose-invert max-w-none text-foreground leading-relaxed"
            >
              <div 
                className="dynamic-content-wrapper"
                dangerouslySetInnerHTML={{ __html: sec.content }} 
              />
            </motion.div>
          </div>
        </section>
      ))}

      {/* ===== CTA ===== */}
      <section className="py-20 md:py-32 bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-5" />
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Experience Premium Travel?</h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">Book your ride now and enjoy the comfort, safety, and reliability of Carvio Cabs.</p>
            <Link to="/book">
              <Button className="bg-white text-black hover:bg-zinc-200 font-semibold px-10 py-6 text-lg" data-testid="cta-book-btn">
                Book Your Ride Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <FAQSection 
        page="home" 
        title="Frequently Asked Questions" 
        subtitle="Have questions about booking a cab in Mumbai? Here are quick answers about Carvio Cabs services, airport transfers, car rental and corporate travel." 
      />

      <Footer settings={settings} />
    </div>
  );
}
