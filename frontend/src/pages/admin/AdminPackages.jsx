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
import { Plus, Pencil, Trash2, Package, Upload, Link2, X, Loader2 } from "lucide-react";

const emptyPkg = { name: "", description: "", short_desc: "", price: "", duration: "", included_km: "", image: "", features: [], is_active: true };

export default function AdminPackages() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPkg);
  const [saving, setSaving] = useState(false);

  const [imageMode, setImageMode] = useState("upload"); // "upload" | "url"
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${API}/packages`);
      setPackages(res.data);
    } catch { toast.error("Failed to load packages"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPackages(); }, []);

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
    setForm(emptyPkg);
    setImageMode("upload");
    setUploadFile(null);
    setUploadPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setDialogOpen(true);
  };

  const openEdit = (pkg) => {
    setEditing(pkg);
    setForm({ ...pkg, features: pkg.features?.join(", ") || "", price: String(pkg.price), included_km: String(pkg.included_km) });
    const isUpload = pkg.image && !pkg.image.startsWith("http");
    setImageMode(isUpload ? "upload" : "url");
    if (isUpload) {
      setUploadPreview(resolveImageUrl(pkg.image));
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

  const handleSave = async () => {
    if (!form.name || !form.price || !form.duration) { toast.error("Name, Price and Duration required"); return; }
    setSaving(true);
    
    let finalImageUrl = form.image;
    
    if (imageMode === "upload") {
      if (uploadFile) {
        setUploading(true);
        try {
          const uploadData = new FormData();
          uploadData.append("file", uploadFile);
          console.log("[AdminPackages] Uploading local image to:", `${API}/admin/upload-image`);
          const uploadRes = await axios.post(`${API}/admin/upload-image`, uploadData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
          });
          finalImageUrl = uploadRes.data.url;
          console.log("[AdminPackages] Upload success:", finalImageUrl);
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
        toast.error("Please select a package image file to upload");
        setSaving(false);
        return;
      }
    } else {
      if (!form.image) {
        toast.error("Please enter a package image URL");
        setSaving(false);
        return;
      }
      finalImageUrl = form.image;
    }

    try {
      const payload = {
        ...form,
        image: finalImageUrl,
        price: parseFloat(form.price) || 0,
        included_km: parseFloat(form.included_km) || 0,
        features: typeof form.features === "string" ? form.features.split(",").map(f => f.trim()).filter(Boolean) : form.features
      };
      if (editing) {
        await axios.put(`${API}/admin/packages/${editing.pkg_id}`, payload, { withCredentials: true });
        toast.success("Package updated!");
      } else {
        await axios.post(`${API}/admin/packages`, payload, { withCredentials: true });
        toast.success("Package created!");
      }
      setDialogOpen(false);
      fetchPackages();
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  };

  const handleDelete = async (pkgId) => {
    if (!window.confirm("Delete this package?")) return;
    try {
      await axios.delete(`${API}/admin/packages/${pkgId}`, { withCredentials: true });
      toast.success("Deleted");
      fetchPackages();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="min-h-screen bg-primary">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64">
        <AdminHeader title="Package Manager" setIsOpen={setSidebarOpen} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">{packages.length} package{packages.length !== 1 ? "s" : ""}</p>
            <Button onClick={openCreate} className="bg-[#FFD700] text-black hover:bg-[#E5C100]">
              <Plus size={16} className="mr-2" /> New Package
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg, i) => (
                <motion.div key={pkg.pkg_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-secondary border border-border rounded-xl overflow-hidden"
                >
                  {pkg.image && <img src={resolveImageUrl(pkg.image)} alt={pkg.name} className="w-full h-40 object-cover" />}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-foreground font-bold text-lg">{pkg.name}</h3>
                      <span className="text-[#FFD700] font-bold text-lg">₹{pkg.price}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{pkg.short_desc || pkg.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span>⏱ {pkg.duration}</span>
                      {pkg.included_km > 0 && <span>🚗 {pkg.included_km} km</span>}
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-border">
                      <Button size="sm" variant="outline" className="flex-1 border-border text-foreground hover:bg-background" onClick={() => openEdit(pkg)}>
                        <Pencil size={14} className="mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(pkg.pkg_id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {packages.length === 0 && (
                <div className="col-span-3 bg-secondary border border-border rounded-xl p-12 text-center">
                  <Package size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No packages yet. Create your first package!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-secondary border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Edit Package" : "New Package"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-muted-foreground">Package Name *</Label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Airport Transfer" className="bg-background border-border text-foreground mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Price (₹) *</Label>
                <Input name="price" type="number" value={form.price} onChange={handleChange} placeholder="1500" className="bg-background border-border text-foreground mt-1" />
              </div>
              <div>
                <Label className="text-muted-foreground">Duration *</Label>
                <Input name="duration" value={form.duration} onChange={handleChange} placeholder="4 Hours" className="bg-background border-border text-foreground mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Included KM</Label>
              <Input name="included_km" type="number" value={form.included_km} onChange={handleChange} placeholder="40" className="bg-background border-border text-foreground mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Short Description</Label>
              <Input name="short_desc" value={form.short_desc} onChange={handleChange} placeholder="One-liner for homepage card" className="bg-background border-border text-foreground mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Full Description</Label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full mt-1 bg-background border border-border text-foreground rounded-md px-3 py-2 text-sm resize-none" />
            </div>
            <div>
              <Label className="text-muted-foreground">Features (comma separated)</Label>
              <Input name="features" value={form.features} onChange={handleChange} placeholder="Flight tracking, Meet & Greet, Free Waiting" className="bg-background border-border text-foreground mt-1" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Package Image *</Label>
              
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
                        <p className="text-xs font-medium">Click to select package image</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">JPEG, PNG, WebP, GIF</p>
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-1">
                  <Input
                    name="image"
                    placeholder="https://example.com/package.jpg"
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
            <Button onClick={handleSave} disabled={saving || uploading} className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold">
              {saving || uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Saving package...
                </span>
              ) : (
                editing ? "Update Package" : "Create Package"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
