import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { resolveImageUrl } from "@/utils/imageUrl";
import { Navbar, Footer } from "@/pages/HomePage";
import { ChevronRight, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${API}/blogs?limit=50`);
        setBlogs(res.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const categories = ["all", ...new Set(blogs.map(b => b.category))];
  const filtered = activeCategory === "all" ? blogs : blogs.filter(b => b.category === activeCategory);

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-16 bg-secondary border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Our Blog</span>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mt-4">Travel Stories &amp; Insights</h1>
          <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
            Tips, guides, and stories from the world of premium travel and corporate transportation.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="sticky top-20 z-30 bg-background/90 backdrop-blur-xl border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-white text-black"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {loading ? (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((blog, i) => (
                <motion.article
                  key={blog.blog_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-dark overflow-hidden group"
                >
                  <Link to={`/blog/${blog.slug}`}>
                    <div className="aspect-video overflow-hidden bg-secondary">
                      {blog.image ? (
                        <img
                          src={resolveImageUrl(blog.image)}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <span className="text-muted-foreground text-4xl">✍️</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center gap-1 text-zinc-400 text-xs font-medium">
                          <Tag size={12} /> {blog.category}
                        </span>
                      </div>
                      <h2 className="text-foreground font-bold text-xl mb-2 group-hover:text-white transition-colors line-clamp-2">
                        {blog.title}
                      </h2>
                      <p className="text-muted-foreground text-sm line-clamp-3">{blog.short_description}</p>
                      <div className="flex items-center gap-2 mt-4 text-white text-sm font-medium">
                        Read More <ChevronRight size={16} />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
