import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className={`relative w-14 h-8 flex items-center bg-zinc-800 dark:bg-zinc-800 rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${className}`}
      aria-label="Toggle Theme"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className="w-6 h-6 bg-[#FFD700] rounded-full shadow-md flex items-center justify-center"
        style={{ x: theme === "dark" ? 24 : 0 }}
      >
        {theme === "dark" ? (
          <Moon size={14} className="text-black" />
        ) : (
          <Sun size={14} className="text-black" />
        )}
      </motion.div>
    </motion.button>
  );
}
