import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { resolveImageUrl } from "@/utils/imageUrl";
import { AdminSidebar, AdminHeader } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, Link2, X, Loader2 } from "lucide-react";

const emptyBlog = {
  title: "", slug: "", category: "Travel Tips", short_description: "",
  content: "", image: "", tags: [], is_published: true
};

export default function AdminBlog() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBlog);
  const [saving, setSaving] = useState(false);

  const [imageMode, setImageMode] = useState("upload"); // "upload" | "url"
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${API}/blogs?limit=100`);
      setBlogs(res.data);
    } catch (e) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, GIF, AVIF files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.");
      return;
    }
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyBlog);
    setImageMode("upload");
    setUploadFile(null);
    setUploadPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setDialogOpen(true);
  };

  const openEdit = (blog) => {
    setEditing(blog);
    setForm({ ...blog, tags: blog.tags?.join(", ") || "" });
    const isUpload = blog.image && !blog.image.startsWith("http");
    setImageMode(isUpload ? "upload" : "url");
    if (isUpload) {
      setUploadPreview(resolveImageUrl(blog.image));
    } else {
      setUploadPreview("");
    }
    setUploadFile(null);
    setDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const generateSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.title || !form.content) { toast.error("Title and Content are required"); return; }
    setSaving(true);
    
    let finalImageUrl = form.image;
    
    if (imageMode === "upload") {
      if (uploadFile) {
        setUploading(true);
        try {
          const uploadData = new FormData();
          uploadData.append("file", uploadFile);
          console.log("[AdminBlog] Uploading cover image to:", `${API}/admin/upload-image`);
          const uploadRes = await axios.post(`${API}/admin/upload-image`, uploadData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
          });
          finalImageUrl = uploadRes.data.url;
          console.log("[AdminBlog] Upload success:", finalImageUrl);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Failed to upload image");
          setSaving(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      } else if (!finalImageUrl) {
        toast.error("Please select a cover image file to upload");
        setSaving(false);
        return;
      }
    } else {
      if (!form.image) {
        toast.error("Please enter a cover image URL");
        setSaving(false);
        return;
      }
      finalImageUrl = form.image;
    }

    try {
      const payload = {
        ...form,
        image: finalImageUrl,
        slug: form.slug || generateSlug(form.title),
        tags: typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : form.tags
      };
      if (editing) {
        await axios.put(`${API}/admin/blogs/${editing.blog_id}`, payload, { withCredentials: true });
        toast.success("Blog updated!");
      } else {
        await axios.post(`${API}/admin/blogs`, payload, { withCredentials: true });
        toast.success("Blog published!");
      }
      setDialogOpen(false);
      fetchBlogs();
    } catch (e) {
      toast.error("Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Delete this blog post?")) return;
    try {
      await axios.delete(`${API}/admin/blogs/${blogId}`, { withCredentials: true });
      toast.success("Deleted");
      fetchBlogs();
    } catch { toast.error("Failed to delete"); }
  };

  const categories = ["Travel Tips", "Corporate Travel", "Driver Stories", "City Guide", "News", "Other"];

  return (
    <div className="min-h-screen bg-primary">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64">
        <AdminHeader title="Blog Manager" setIsOpen={setSidebarOpen} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">{blogs.length} post{blogs.length !== 1 ? "s" : ""}</p>
            <Button onClick={openCreate} className="bg-[#FFD700] text-black hover:bg-[#E5C100]">
              <Plus size={16} className="mr-2" /> New Post
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog, i) => (
                <motion.div key={blog.blog_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-secondary border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                  {blog.image && <img src={resolveImageUrl(blog.image)} alt={blog.title} className="w-full md:w-24 h-16 object-cover rounded-lg flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${blog.is_published ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                        {blog.is_published ? "Published" : "Draft"}
                      </span>
                      <span className="text-xs text-[#FFD700]">{blog.category}</span>
                    </div>
                    <h3 className="text-foreground font-semibold line-clamp-1">{blog.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-1">{blog.short_description}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-background" onClick={() => openEdit(blog)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(blog.blog_id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </motion.div>
              ))}
              {blogs.length === 0 && (
                <div className="bg-secondary border border-border rounded-xl p-12 text-center">
                  <p className="text-muted-foreground">No blog posts yet. Create your first post!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-secondary border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Edit Post" : "New Blog Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-muted-foreground">Title *</Label>
              <Input name="title" value={form.title} onChange={handleChange} placeholder="Post title..." className="bg-background border-border text-foreground mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Slug (auto-generated)</Label>
                <Input name="slug" value={form.slug} onChange={handleChange} placeholder="post-url-slug" className="bg-background border-border text-foreground mt-1" />
              </div>
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <select name="category" value={form.category} onChange={handleChange} className="w-full mt-1 bg-background border border-border text-foreground rounded-md px-3 py-2 text-sm">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Cover Image *</Label>
              
              {/* Image Input Mode Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-border h-9">
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${imageMode === "upload" ? "bg-[#FFD700] text-black" : "text-muted-foreground hover:text-foreground bg-background/50"}`}
                >
                  <Upload size={14} /> Upload from PC
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${imageMode === "url" ? "bg-[#FFD700] text-black" : "text-muted-foreground hover:text-foreground bg-background/50"}`}
                >
                  <Link2 size={14} /> Paste URL
                </button>
              </div>

              {imageMode === "upload" ? (
                <div className="mt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {uploadPreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-border bg-background/50 h-32 flex items-center justify-center">
                      <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => { setUploadFile(null); setUploadPreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; setForm({ ...form, image: "" }); }}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                      {uploadFile && (
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded truncate max-w-[80%]">
                          {uploadFile.name}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-[#FFD700] transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground bg-background/30"
                    >
                      <Upload size={24} />
                      <div className="text-center">
                        <p className="text-xs font-medium">Click to select cover image</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">JPEG, PNG, WebP, GIF</p>
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-1">
                  <Input
                    name="image"
                    placeholder="https://example.com/blog-cover.jpg"
                    value={form.image}
                    onChange={handleChange}
                    className="bg-background border-border text-foreground"
                  />
                  {form.image && (
                    <div className="mt-2 h-20 rounded-md overflow-hidden border border-border bg-background/50">
                      <img 
                        src={resolveImageUrl(form.image)} 
                        alt="URL preview" 
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Short Description</Label>
              <textarea name="short_description" value={form.short_description} onChange={handleChange} rows={2} className="w-full mt-1 bg-background border border-border text-foreground rounded-md px-3 py-2 text-sm resize-none" placeholder="Brief teaser shown in blog list..." />
            </div>
            <div>
              <Label className="text-muted-foreground">Content *</Label>
              <textarea name="content" value={form.content} onChange={handleChange} rows={10} className="w-full mt-1 bg-background border border-border text-foreground rounded-md px-3 py-2 text-sm resize-y font-mono" placeholder="Write your blog content here..." />
            </div>
            <div>
              <Label className="text-muted-foreground">Tags (comma separated)</Label>
              <Input name="tags" value={form.tags} onChange={handleChange} placeholder="travel, tips, cabs" className="bg-background border-border text-foreground mt-1" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="pub" name="is_published" checked={form.is_published} onChange={handleChange} className="w-4 h-4 accent-[#FFD700]" />
              <Label htmlFor="pub" className="text-foreground cursor-pointer">Publish immediately</Label>
            </div>
            <Button onClick={handleSave} disabled={saving || uploading} className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold">
              {saving || uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Saving post...
                </span>
              ) : (
                editing ? "Update Post" : "Publish Post"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
