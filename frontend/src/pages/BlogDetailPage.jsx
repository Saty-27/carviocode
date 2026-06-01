import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { resolveImageUrl } from "@/utils/imageUrl";
import { Navbar, Footer } from "@/pages/HomePage";
import { ChevronLeft, Calendar, Tag } from "lucide-react";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${API}/blogs/${slug}`);
        setBlog(res.data);
      } catch (error) {
        navigate("/blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* Hero Image */}
      <div className="pt-20">
        {blog.image && (
          <div className="relative h-[40vh] md:h-[55vh] overflow-hidden">
            <img src={resolveImageUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
          </div>
        )}
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 md:px-12 py-12 bg-primary">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Back */}
          <Link to="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
            <ChevronLeft size={16} /> Back to Blog
          </Link>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="flex items-center gap-1 text-[#FFD700] text-sm font-medium">
              <Tag size={14} /> {blog.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">{blog.title}</h1>
          <p className="text-muted-foreground text-xl mb-10 leading-relaxed border-l-4 border-[#FFD700] pl-6">
            {blog.short_description}
          </p>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {blog.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs">#{tag}</span>
              ))}
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-invert prose-zinc max-w-none text-foreground leading-relaxed content-area"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {blog.content}
          </div>
        </motion.div>
      </article>

      <Footer />
    </div>
  );
}
