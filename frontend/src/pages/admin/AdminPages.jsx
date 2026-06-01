import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { AdminSidebar, AdminHeader } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText, Globe, Eye } from "lucide-react";

const emptyPage = { title: "", slug: "", content: "", is_active: true, meta_description: "", show_in_navbar: false, show_in_footer: true, show_on_homepage: false };

export default function AdminPages() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPage);
  const [saving, setSaving] = useState(false);

  const fetchPages = async () => {
    try {
      const res = await axios.get(`${API}/admin/pages`, { withCredentials: true });
      setPages(res.data);
    } catch { toast.error("Failed to load pages"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPages(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyPage); setDialogOpen(true); };
  const openEdit = (page) => { setEditing(page); setForm(page); setDialogOpen(true); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;
    
    if (name === "title" && !editing) {
      const slug = value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
      setForm(prev => ({ ...prev, title: value, slug }));
    } else {
      setForm(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.content) { toast.error("Title, Slug, and Content required"); return; }
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/admin/pages/${editing.page_id}`, form, { withCredentials: true });
        toast.success("Page updated!");
      } else {
        await axios.post(`${API}/admin/pages`, form, { withCredentials: true });
        toast.success("Page created!");
      }
      setDialogOpen(false);
      fetchPages();
    } catch { toast.error("Failed to save page"); } finally { setSaving(false); }
  };

  const handleDelete = async (pageId) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    try {
      await axios.delete(`${API}/admin/pages/${pageId}`, { withCredentials: true });
      toast.success("Page deleted");
      fetchPages();
    } catch { toast.error("Failed to delete page"); }
  };

  const toggleActive = async (page) => {
    try {
      const updated = { ...page, is_active: !page.is_active };
      delete updated._id;
      await axios.put(`${API}/admin/pages/${page.page_id}`, updated, { withCredentials: true });
      toast.success(page.is_active ? "Page disabled successfully" : "Page enabled successfully");
      fetchPages();
    } catch {
      toast.error("Failed to toggle page status");
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64">
        <AdminHeader title="Page Manager" setIsOpen={setSidebarOpen} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">{pages.length} page{pages.length !== 1 ? "s" : ""}</p>
            <Button onClick={openCreate} className="bg-[#FFD700] text-black hover:bg-[#E5C100]">
              <Plus size={16} className="mr-2" /> New Page
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pages.map((page, i) => (
                <motion.div key={page.page_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-secondary border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 flex items-center justify-center">
                      <FileText className="text-[#FFD700]" size={20} />
                    </div>
                    <div>
                      <h3 className="text-foreground font-bold">{page.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe size={12} /> <span>/pages/{page.slug}</span>
                        {!page.is_active && <span className="bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">Draft</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <a href={`/pages/${page.slug}`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-[#FFD700]">
                        <Eye size={16} />
                      </Button>
                    </a>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`border-border ${page.is_active ? 'text-green-500 hover:bg-green-500/10 hover:text-green-500' : 'text-zinc-500 hover:bg-zinc-800'}`} 
                      onClick={() => toggleActive(page)}
                    >
                      {page.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-background" onClick={() => openEdit(page)}>
                      <Pencil size={14} className="mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(page.page_id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </motion.div>
              ))}
              {pages.length === 0 && (
                <div className="text-center py-20 bg-secondary border border-border rounded-xl">
                  <FileText className="mx-auto text-muted-foreground/20 mb-3" size={48} />
                  <p className="text-muted-foreground text-sm">No custom pages yet. Create one to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-secondary border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Edit Page" : "Create New Page"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Page Title</Label>
                <Input name="title" value={form.title} onChange={handleChange} placeholder="e.g., Cancellation Policy" className="bg-background border-border text-foreground mt-1" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">URL Slug</Label>
                <Input name="slug" value={form.slug} onChange={handleChange} placeholder="cancellation-policy" className="bg-background border-border text-foreground mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Content (supports basic HTML/Markdown vibes)</Label>
              <textarea name="content" value={form.content} onChange={handleChange} rows={12} className="w-full mt-1 bg-background border border-border rounded-md p-3 text-foreground text-sm font-mono resize-none focus:outline-none focus:border-[#FFD700]" placeholder="Enter page content here..." />
            </div>

            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Meta Description (For SEO)</Label>
              <Input name="meta_description" value={form.meta_description} onChange={handleChange} placeholder="Brief summary for search engines" className="bg-background border-border text-foreground mt-1" />
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded border-border text-[#FFD700]" />
                <span className="text-sm text-foreground group-hover:text-muted-foreground transition-colors">Active / Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="show_in_navbar" checked={form.show_in_navbar} onChange={handleChange} className="w-4 h-4 rounded border-border text-[#FFD700]" />
                <span className="text-sm text-foreground group-hover:text-muted-foreground transition-colors">Show in Navbar</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="show_in_footer" checked={form.show_in_footer} onChange={handleChange} className="w-4 h-4 rounded border-border text-[#FFD700]" />
                <span className="text-sm text-foreground group-hover:text-muted-foreground transition-colors">Show in Footer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="show_on_homepage" checked={form.show_on_homepage} onChange={handleChange} className="w-4 h-4 rounded border-border text-[#FFD700]" />
                <span className="text-sm text-foreground group-hover:text-muted-foreground transition-colors">Show on Homepage (as Section)</span>
              </label>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100] h-12 text-base font-bold mt-4">
              {saving ? "Saving..." : editing ? "Update Page" : "Publish Page"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
