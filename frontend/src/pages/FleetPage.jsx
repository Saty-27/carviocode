import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { useSEO } from "@/hooks/useSEO";
import { Navbar, Footer } from "./HomePage";
import { resolveImageUrl } from "@/utils/imageUrl";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, ChevronRight, Zap, Shield } from "lucide-react";

export default function FleetPage() {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Carvio Cabs Fleet | Premium Cars, Sedans & SUVs for Rent in Mumbai",
    description: "Explore Carvio Cabs fleet in Mumbai including sedans, SUVs and premium chauffeur-driven cars for airport transfers, corporate travel, local rentals and outstation trips.",
    keywords: "Carvio Cabs fleet, luxury cars rent Mumbai, sedan cab booking, SUV car rental Mumbai",
    schema: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Carvio Cabs Premium Fleet",
      "description": "Select from our fleet of clean, premium sedans and SUVs with professional drivers in Mumbai."
    }
  });

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const response = await axios.get(`${API}/fleet`);
        setFleet(response.data);
      } catch (error) {
        console.error("Error fetching fleet:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFleet();
  }, []);

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,215,0,0.06)_0%,_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#FFD700] text-sm font-medium tracking-widest uppercase">Our Fleet</span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mt-4 mb-6">Choose Your <span className="text-[#FFD700]">Luxury</span></h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">From executive sedans to spacious SUVs, find the perfect vehicle for your journey.</p>
          </motion.div>
        </div>
      </section>

      {/* Fleet Grid */}
      <section className="py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {loading ? (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {fleet.map((car, i) => (
                <motion.div key={car.car_id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/fleet/${car.car_id}`}>
                    <div className="fleet-card card-dark overflow-hidden cursor-pointer group">
                      <div className="aspect-[16/10] bg-zinc-900 overflow-hidden">
                      <img 
                        src={resolveImageUrl(car.image)} 
                        alt={car.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-foreground font-bold text-xl">{car.name}</h3>
                          <span className="text-[#FFD700] font-bold text-lg">₹{car.price_per_km}/km</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Users size={16} className="text-[#FFD700]" /> {car.passengers} Passengers
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Briefcase size={16} className="text-[#FFD700]" /> {car.luggage} Luggage
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Zap size={16} className="text-[#FFD700]" /> Air Conditioned
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Shield size={16} className="text-[#FFD700]" /> GPS Tracked
                          </div>
                        </div>
                        <Button className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold group-hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-all">
                          View Details <ChevronRight className="ml-2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
