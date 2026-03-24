import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/App";
import { Navbar, Footer } from "@/pages/HomePage";
import { Users, Briefcase, ChevronRight } from "lucide-react";

export default function FleetPage() {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="gold-line mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Fleet</h1>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Choose from our selection of premium, well-maintained vehicles for your journey.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="loader" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {fleet.map((car, index) => (
                <motion.div
                  key={car.car_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/fleet/${car.car_id}`}>
                    <div 
                      className="card-dark fleet-card cursor-pointer h-full"
                      data-testid={`fleet-card-${car.car_id}`}
                    >
                      <div className="aspect-video bg-zinc-900 overflow-hidden">
                        <img 
                          src={car.image} 
                          alt={car.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-white font-semibold text-xl mb-3">{car.name}</h3>
                        <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{car.description}</p>
                        
                        <div className="flex items-center gap-6 text-zinc-400 text-sm mb-4">
                          <span className="flex items-center gap-2">
                            <Users size={16} className="text-[#FFD700]" /> {car.passengers} Passengers
                          </span>
                          <span className="flex items-center gap-2">
                            <Briefcase size={16} className="text-[#FFD700]" /> {car.luggage} Luggage
                          </span>
                        </div>

                        <div className="border-t border-zinc-800 pt-4 mt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-zinc-500 text-xs block">Starting from</span>
                              <span className="text-[#FFD700] font-bold text-xl">₹{car.price_per_km}/km</span>
                            </div>
                            <div className="flex items-center text-[#FFD700] font-medium">
                              View Details <ChevronRight size={18} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
