import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar, Footer } from "@/pages/HomePage";
import { motion } from "framer-motion";
import { Navigation, Car, BookOpen, FileText, Info, HelpCircle, MapPin } from "lucide-react";
import axios from "axios";
import { API } from "@/apiConfig";
import { useSEO } from "@/hooks/useSEO";

export default function SitemapPage() {
  const [fleet, setFleet] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [cmsPages, setCmsPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Sitemap | Carvio Cabs Premium Taxi & Car Rental Mumbai",
    description: "Navigate through the entire page and category layout of Carvio Cabs, featuring services, fleet options, blogs, and Mumbai location pages.",
    keywords: "sitemap carvio cabs, taxi service Mumbai layout, site directory"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fleetRes, blogsRes, pagesRes] = await Promise.all([
          axios.get(`${API}/fleet`),
          axios.get(`${API}/blogs?limit=50`),
          axios.get(`${API}/pages`)
        ]);
        setFleet(fleetRes.data || []);
        // handle both array structure and object payload
        const blogList = Array.isArray(blogsRes.data) ? blogsRes.data : (blogsRes.data.blogs || []);
        setBlogs(blogList);
        setCmsPages(pagesRes.data || []);
      } catch (err) {
        console.error("Error fetching sitemap details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const mainPages = [
    { title: "Home", path: "/" },
    { title: "About Us", path: "/about" },
    { title: "Services", path: "/services" },
    { title: "Our Fleet", path: "/fleet" },
    { title: "Book a Ride", path: "/book" },
    { title: "Contact Us", path: "/contact" },
    { title: "Blog Posts", path: "/blog" },
    { title: "User Login", path: "/login" },
    { title: "Register Account", path: "/register" },
    { title: "My Dashboard", path: "/dashboard" }
  ];

  const legalPages = [
    { title: "Privacy Policy", path: "/privacy" },
    { title: "Terms of Service", path: "/terms" },
    { title: "Sitemap", path: "/sitemap" }
  ];

  const locationPages = [
    { title: "Taxi Service in Andheri", path: "/taxi-service-in-andheri" },
    { title: "Cab Service in Bandra", path: "/cab-service-in-bandra" },
    { title: "Airport Cab Service in Santacruz", path: "/airport-cab-service-santacruz" },
    { title: "Taxi Service in Vile Parle", path: "/taxi-service-in-vile-parle" },
    { title: "Cab Service in Dadar", path: "/cab-service-in-dadar" },
    { title: "Taxi Service in Mahim", path: "/taxi-service-in-mahim" },
    { title: "Cab Service in Kurla", path: "/cab-service-in-kurla" },
    { title: "Car Rental in Goregaon", path: "/car-rental-in-goregaon" },
    { title: "Taxi Service in Churchgate", path: "/taxi-service-in-churchgate" },
    { title: "Cab Service in Matunga", path: "/cab-service-in-matunga" },
    { title: "Mumbai Airport Taxi Service", path: "/airport-taxi-service-mumbai" }
  ];

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-16 bg-secondary border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06)_0%,_transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-6 md:px-12 text-center relative z-10">
          <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Navigation Map</span>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mt-4">Sitemap</h1>
          <p className="text-muted-foreground text-lg mt-4">Navigate through the entire structure of Carvio Cabs.</p>
        </div>
      </section>

      {/* Grid Content */}
      <section className="py-16 bg-primary">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Main Site Structure */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-dark p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                  <Navigation className="text-white" size={22} />
                  <h2 className="text-foreground font-bold text-xl">Main Pages</h2>
                </div>
                <ul className="space-y-3 flex-grow">
                  {mainPages.map((page, index) => (
                    <li key={index}>
                      <Link to={page.path} className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2 group text-sm md:text-base">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-white transition-colors" />
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Our Fleet Vehicles */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-dark p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                  <Car className="text-white" size={22} />
                  <h2 className="text-foreground font-bold text-xl">Our Fleet</h2>
                </div>
                {fleet.length === 0 ? (
                  <p className="text-zinc-500 text-sm italic">No vehicles available at the moment.</p>
                ) : (
                  <ul className="space-y-3 flex-grow">
                    {fleet.map((car) => (
                      <li key={car.car_id}>
                        <Link to={`/fleet/${car.car_id}`} className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2 group text-sm md:text-base">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-white transition-colors" />
                          {car.name} <span className="text-zinc-600 text-xs font-normal">({car.type})</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>

              {/* Blogs Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-dark p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                  <BookOpen className="text-white" size={22} />
                  <h2 className="text-foreground font-bold text-xl">Blog Posts</h2>
                </div>
                {blogs.length === 0 ? (
                  <p className="text-zinc-500 text-sm italic">No blog posts published yet.</p>
                ) : (
                  <ul className="space-y-3 flex-grow max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {blogs.map((blog) => (
                      <li key={blog.blog_id}>
                        <Link to={`/blog/${blog.slug}`} className="text-muted-foreground hover:text-white transition-colors flex items-center gap- group text-sm md:text-base line-clamp-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-white transition-colors flex-shrink-0 mr-2" />
                          {blog.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>

              {/* Service Areas (Mumbai) */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="card-dark p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                  <MapPin className="text-white" size={22} />
                  <h2 className="text-foreground font-bold text-xl">Mumbai Service Areas</h2>
                </div>
                <ul className="space-y-3 flex-grow max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {locationPages.map((page, index) => (
                    <li key={index}>
                      <Link to={page.path} className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2 group text-sm md:text-base">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-white transition-colors" />
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Custom CMS Pages */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-dark p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                  <FileText className="text-white" size={22} />
                  <h2 className="text-foreground font-bold text-xl">Additional Pages</h2>
                </div>
                {cmsPages.length === 0 ? (
                  <p className="text-zinc-500 text-sm italic">No additional pages.</p>
                ) : (
                  <ul className="space-y-3 flex-grow">
                    {cmsPages.map((page) => (
                      <li key={page.page_id}>
                        <Link to={`/pages/${page.slug}`} className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2 group text-sm md:text-base">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-white transition-colors" />
                          {page.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>

              {/* Legal & Policy Pages */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-dark p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                  <Info className="text-white" size={22} />
                  <h2 className="text-foreground font-bold text-xl">Legal & Privacy</h2>
                </div>
                <ul className="space-y-3 flex-grow">
                  {legalPages.map((page, index) => (
                    <li key={index}>
                      <Link to={page.path} className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2 group text-sm md:text-base">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-white transition-colors" />
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Support & Admin Area */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card-dark p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                    <HelpCircle className="text-white" size={22} />
                    <h2 className="text-foreground font-bold text-xl">Support & Portals</h2>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    If you are an administrator, you can access the admin dashboard to manage bookings, fleet details, drivers, and website page configurations.
                  </p>
                </div>
                <Link to="/admin" className="w-full text-center bg-white text-black hover:bg-zinc-200 transition-colors font-medium py-3 rounded-lg block text-sm">
                  Go to Admin Panel
                </Link>
              </motion.div>

            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
