import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import axios from "axios";
import { API } from "@/apiConfig";

export default function FloatingContactButtons() {
  const [settings, setSettings] = useState({
    phone: "+91 95943 12974",
    whatsapp: "919594312974"
  });
  const [hoveredButton, setHoveredButton] = useState(null);

  useEffect(() => {
    axios.get(`${API}/settings`)
      .then(res => {
        if (res.data) {
          setSettings({
            phone: res.data.phone || "+91 95943 12974",
            whatsapp: res.data.whatsapp || "919594312974"
          });
        }
      })
      .catch(() => {
        // Fallback to default state if API fails
      });
  }, []);

  // Format whatsapp number: strip spaces, non-numeric characters except leading country code
  const cleanWhatsapp = settings.whatsapp ? settings.whatsapp.replace(/\s+/g, "").replace("+", "") : "919594312974";
  const cleanPhone = settings.phone ? settings.phone.replace(/\s+/g, "") : "+919594312974";

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3.5 items-end">
      {/* Call Button */}
      <div 
        className="relative flex items-center"
        onMouseEnter={() => setHoveredButton("call")}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <AnimatePresence>
          {hoveredButton === "call" && (
            <motion.span 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mr-3 bg-black/90 backdrop-blur-md text-foreground text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-[#FFD700]/30 shadow-xl whitespace-nowrap hidden sm:inline-block"
            >
              Call: {settings.phone}
            </motion.span>
          )}
        </AnimatePresence>
        <a 
          href={`tel:${cleanPhone}`} 
          className="w-14 h-14 bg-gradient-to-r from-[#FFD700] to-[#E5C100] hover:from-[#FFA500] hover:to-[#FFD700] text-black rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 border border-[#FFD700]/50"
          aria-label={`Call Carvio Cabs at ${settings.phone}`}
        >
          <Phone size={24} className="animate-pulse" />
        </a>
      </div>

      {/* WhatsApp Button */}
      <div 
        className="relative flex items-center"
        onMouseEnter={() => setHoveredButton("whatsapp")}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <AnimatePresence>
          {hoveredButton === "whatsapp" && (
            <motion.span 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mr-3 bg-black/90 backdrop-blur-md text-foreground text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-[#25D366]/30 shadow-xl whitespace-nowrap hidden sm:inline-block"
            >
              Chat on WhatsApp
            </motion.span>
          )}
        </AnimatePresence>
        <a 
          href={`https://wa.me/${cleanWhatsapp}?text=Hello%20Carvio%20Cabs,%20I%20would%20like%20to%20inquire%20about%20your%20cab%20booking%20services.`} 
          target="_blank" 
          rel="noreferrer" 
          className="relative w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 border border-[#25D366]/30"
          aria-label="Chat with Carvio Cabs on WhatsApp"
        >
          {/* Pulse ring for WhatsApp */}
          <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none scale-105" />
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="relative z-10">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.579 1.966 14.11 1.01 11.5 1.01 6.066 1.01 1.641 5.38 1.637 10.81c-.001 1.716.463 3.397 1.343 4.888l-.997 3.642 3.731-.977c1.472.84 3.011 1.282 4.673 1.282zm11.305-6.837c-.302-.15-1.785-.88-2.062-.98-.277-.101-.478-.15-.678.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.652.075-.302-.15-1.276-.47-2.43-1.498-.898-.8-1.503-1.79-1.68-2.09-.176-.3-.018-.462.13-.61.135-.135.303-.35.454-.525.152-.175.202-.3.303-.5.101-.2.05-.376-.026-.526-.076-.15-.678-1.631-.93-2.24-.244-.587-.492-.507-.678-.517-.175-.01-.376-.012-.577-.012-.2.01-.527.075-.803.376-.277.301-1.056 1.03-1.056 2.512 0 1.482 1.08 2.912 1.23 3.111.15.2 2.128 3.249 5.156 4.554.72.31 1.28.496 1.719.636.724.23 1.38.197 1.9.12.58-.087 1.785-.73 2.036-1.43.25-.7.25-1.3.175-1.43-.075-.1-.277-.2-.58-.35z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
