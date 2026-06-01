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
import { Plus, Trash2, Image, Video, Upload, Link2, X, Loader2 } from "lucide-react";

const BACKEND_BASE = process.env.REACT_APP_BACKEND_URL?.replace("/api", "") || "";

const galleryCategories = ["Fleet", "Office", "Events", "Drivers", "Trips", "Other"];

// Helper to resolve image URL imported from utils

export default function AdminMedia() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");
  const [gallery, setGallery] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Gallery form state
  const [galleryInputMode, setGalleryInputMode] = useState("upload"); // "upload" | "url"
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    alt_text: "",
    image: "",
    category: "Fleet",
    seo_description: "",
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileInputRef = useRef(null);

  // Video form state
  const [videoForm, setVideoForm] = useState({ title: "", description: "", video_url: "", thumbnail: "", is_youtube: true });
  const [videoInputMode, setVideoInputMode] = useState("url"); // "upload" | "url"
  const [videoUploadFile, setVideoUploadFile] = useState(null);
  const [videoUploadPreview, setVideoUploadPreview] = useState("");
  const videoFileInputRef = useRef(null);

  const fetchAll = async () => {
    try {
      const [gRes, vRes] = await Promise.all([
        axios.get(`${API}/admin/gallery`, { withCredentials: true }),
        axios.get(`${API}/admin/videos`, { withCredentials: true })
      ]);
      setGallery(gRes.data);
      setVideos(vRes.data);
    } catch (e) {
      toast.error("Failed to load media");
      console.error("[AdminMedia] Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveImage = async (img) => {
    try {
      const updated = {
        title: img.title,
        image: img.image,
        category: img.category,
        is_active: !img.is_active,
        alt_text: img.alt_text || img.title,
        seo_description: img.seo_description || "",
      };
      await axios.put(`${API}/admin/gallery/${img.image_id}`, updated, { withCredentials: true });
      toast.success(img.is_active ? "Image disabled successfully" : "Image enabled successfully");
      fetchAll();
    } catch {
      toast.error("Failed to toggle image status");
    }
  };

  const toggleActiveVideo = async (v) => {
    try {
      const updated = {
        title: v.title,
        description: v.description || "",
        thumbnail: v.thumbnail || "",
        video_url: v.video_url,
        is_youtube: v.is_youtube,
        is_active: !v.is_active,
      };
      await axios.put(`${API}/admin/videos/${v.video_id}`, updated, { withCredentials: true });
      toast.success(v.is_active ? "Video disabled successfully" : "Video enabled successfully");
      fetchAll();
    } catch {
      toast.error("Failed to toggle video status");
    }
  };

  useEffect(() => {
    fetchAll();
    console.log("[AdminMedia] Backend API base:", API);
  }, []);

  // Handle file selection for preview
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
    console.log("[AdminMedia] File selected:", file.name, file.type, file.size);
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-matroska"];
    if (!allowed.includes(file.type) && !file.name.endsWith('.mov') && !file.name.endsWith('.mkv')) {
      toast.error("Only MP4, WebM, OGG, MOV, MKV video files are allowed.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File too large. Max 100MB.");
      return;
    }
    setVideoUploadFile(file);
    setVideoUploadPreview(URL.createObjectURL(file));
    console.log("[AdminMedia] Video file selected:", file.name, file.type, file.size);
  };

  const resetGalleryForm = () => {
    setGalleryForm({ title: "", alt_text: "", image: "", category: "Fleet", seo_description: "" });
    setUploadFile(null);
    setUploadPreview("");
    setUploadProgress(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetVideoForm = () => {
    setVideoForm({ title: "", description: "", video_url: "", thumbnail: "", is_youtube: true });
    setVideoUploadFile(null);
    setVideoUploadPreview("");
    setUploadProgress(false);
    if (videoFileInputRef.current) videoFileInputRef.current.value = "";
  };

  const addImage = async () => {
    setSaving(true);
    try {
      let finalImageUrl = galleryForm.image;

      // If Upload mode, first upload the file
      if (galleryInputMode === "upload") {
        if (!uploadFile) { toast.error("Please select an image file."); setSaving(false); return; }
        setUploadProgress(true);
        const formData = new FormData();
        formData.append("file", uploadFile);
        console.log("[AdminMedia] Uploading file to:", `${API}/admin/upload-image`);
        const uploadRes = await axios.post(`${API}/admin/upload-image`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => console.log("[AdminMedia] Upload progress:", Math.round((e.loaded / e.total) * 100) + "%"),
        });
        finalImageUrl = uploadRes.data.url;
        console.log("[AdminMedia] Upload success, URL:", finalImageUrl);
        setUploadProgress(false);
      }

      if (!finalImageUrl) { toast.error("No image URL available."); setSaving(false); return; }

      const payload = {
        title: galleryForm.title || "Gallery Image",
        image: finalImageUrl,
        category: galleryForm.category,
        is_active: true,
        alt_text: galleryForm.alt_text || galleryForm.title || "Carvio Cabs Gallery",
        seo_description: galleryForm.seo_description || "",
      };
      console.log("[AdminMedia] Saving gallery image:", payload);
      await axios.post(`${API}/admin/gallery`, payload, { withCredentials: true });
      toast.success("Image added to gallery!");
      resetGalleryForm();
      setDialogOpen(false);
      fetchAll();
    } catch (e) {
      console.error("[AdminMedia] Add image error:", e?.response?.data || e.message);
      toast.error(e?.response?.data?.detail || "Failed to add image");
      setUploadProgress(false);
    } finally {
      setSaving(false);
    }
  };

  const addVideo = async () => {
    setSaving(true);
    try {
      let finalVideoUrl = videoForm.video_url;
      let finalIsYoutube = videoInputMode === "url";

      if (videoInputMode === "upload") {
        if (!videoUploadFile) { toast.error("Please select a video file."); setSaving(false); return; }
        setUploadProgress(true);
        const formData = new FormData();
        formData.append("file", videoUploadFile);
        console.log("[AdminMedia] Uploading video to:", `${API}/admin/upload-video`);
        const uploadRes = await axios.post(`${API}/admin/upload-video`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => console.log("[AdminMedia] Upload progress:", Math.round((e.loaded / e.total) * 100) + "%"),
        });
        finalVideoUrl = uploadRes.data.url;
        console.log("[AdminMedia] Video upload success, URL:", finalVideoUrl);
        setUploadProgress(false);
      }

      if (!finalVideoUrl || !videoForm.title) { toast.error("Title and URL/Video File required"); setSaving(false); return; }

      const payload = {
        title: videoForm.title,
        description: videoForm.description || "",
        thumbnail: videoForm.thumbnail || "",
        video_url: finalVideoUrl,
        is_youtube: finalIsYoutube,
        is_active: true,
      };
      console.log("[AdminMedia] Saving video:", payload);
      await axios.post(`${API}/admin/videos`, payload, { withCredentials: true });
      toast.success("Video added!");
      resetVideoForm();
      setDialogOpen(false);
      fetchAll();
    } catch (e) {
      console.error("[AdminMedia] Add video error:", e?.response?.data || e.message);
      toast.error(e?.response?.data?.detail || "Failed to add video");
      setUploadProgress(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteImage = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axios.delete(`${API}/admin/gallery/${id}`, { withCredentials: true });
      toast.success("Deleted");
      fetchAll();
    } catch (e) {
      console.error("[AdminMedia] Delete image error:", e?.response?.data || e.message);
      toast.error("Failed to delete");
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      await axios.delete(`${API}/admin/videos/${id}`, { withCredentials: true });
      toast.success("Deleted");
      fetchAll();
    } catch (e) {
      console.error("[AdminMedia] Delete video error:", e?.response?.data || e.message);
      toast.error("Failed to delete");
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const openDialog = () => {
    resetGalleryForm();
    resetVideoForm();
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-primary">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64">
        <AdminHeader title="Media Manager" setIsOpen={setSidebarOpen} />
        <div className="p-6">

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[{ id: "gallery", icon: Image, label: `Gallery (${gallery.length})` }, { id: "videos", icon: Video, label: `Videos (${videos.length})` }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === tab.id ? "bg-[#FFD700] text-black" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
            <Button onClick={openDialog} className="ml-auto bg-[#FFD700] text-black hover:bg-[#E5C100]">
              <Plus size={16} className="mr-2" /> Add {activeTab === "gallery" ? "Image" : "Video"}
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          ) : activeTab === "gallery" ? (
            /* Gallery Grid - Instagram Style */
            <div>
              {gallery.length === 0 ? (
                <div className="bg-secondary border border-border rounded-xl p-16 text-center">
                  <Image size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-2">No images yet</p>
                  <p className="text-muted-foreground/60 text-sm">Upload images from your PC or add by URL</p>
                  <Button onClick={openDialog} className="mt-6 bg-[#FFD700] text-black hover:bg-[#E5C100]">
                    <Plus size={16} className="mr-2" /> Add First Image
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                  {gallery.map((img, i) => (
                    <motion.div key={img.image_id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                      className="relative group aspect-square rounded-xl overflow-hidden bg-background border border-border"
                    >
                      <img
                        src={resolveImageUrl(img.image)}
                        alt={img.alt_text || img.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${!img.is_active ? "opacity-40 grayscale" : ""}`}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/300x300/1a1a1a/FFD700?text=IMG"; console.warn("[AdminMedia] Failed to load:", img.image); }}
                      />
                      {!img.is_active && (
                        <div className="absolute top-2 left-2 bg-red-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                          Disabled
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                        <p className="text-white text-xs font-medium text-center line-clamp-2">{img.title}</p>
                        <span className="text-[#FFD700] text-xs bg-[#FFD700]/10 px-2 py-0.5 rounded-full">{img.category}</span>
                        <div className="flex gap-2 mt-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`h-7 text-xs px-2 border-border ${img.is_active ? 'text-green-400 hover:bg-green-500/10 hover:text-green-400' : 'text-zinc-400 hover:bg-zinc-800'}`} 
                            onClick={() => toggleActiveImage(img)}
                          >
                            {img.is_active ? "Disable" : "Enable"}
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-7 text-xs px-2" onClick={() => deleteImage(img.image_id)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Videos Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v, i) => {
                const ytId = getYouTubeId(v.video_url);
                return (
                  <motion.div key={v.video_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} 
                    className={`bg-secondary border border-border rounded-xl overflow-hidden relative ${!v.is_active ? "border-red-500/30" : ""}`}
                  >
                    {!v.is_active && (
                      <div className="absolute top-2 left-2 bg-red-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                        Disabled
                      </div>
                    )}
                    <div className={`aspect-video bg-background ${!v.is_active ? "opacity-45" : ""}`}>
                      {ytId ? (
                        <iframe src={`https://www.youtube.com/embed/${ytId}`} title={v.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      ) : (
                        <video src={resolveImageUrl(v.video_url)} poster={v.thumbnail ? resolveImageUrl(v.thumbnail) : undefined} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-foreground font-medium text-sm line-clamp-1">{v.title}</h3>
                        <p className="text-muted-foreground text-xs line-clamp-1">{v.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className={`h-8 text-xs border-border ${v.is_active ? 'text-green-400 hover:bg-green-500/10 hover:text-green-400' : 'text-zinc-400 hover:bg-zinc-800'}`} 
                          onClick={() => toggleActiveVideo(v)}
                        >
                          {v.is_active ? "Disable" : "Enable"}
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-8" onClick={() => deleteVideo(v.video_id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {videos.length === 0 && (
                <div className="col-span-3 bg-secondary border border-border rounded-xl p-16 text-center">
                  <Video size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No videos yet</p>
                  <p className="text-muted-foreground/60 text-sm mt-1">Paste a YouTube link to add videos</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-secondary border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg">
              {activeTab === "gallery" ? "Add Gallery Image" : "Add Video"}
            </DialogTitle>
          </DialogHeader>

          {activeTab === "gallery" ? (
            <div className="space-y-5 mt-2">
              {/* Input Mode Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-border">
                <button
                  onClick={() => { setGalleryInputMode("upload"); resetGalleryForm(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${galleryInputMode === "upload" ? "bg-[#FFD700] text-black" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Upload size={16} /> Upload from PC
                </button>
                <button
                  onClick={() => { setGalleryInputMode("url"); resetGalleryForm(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${galleryInputMode === "url" ? "bg-[#FFD700] text-black" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Link2 size={16} /> Paste URL
                </button>
              </div>

              {/* Upload from PC */}
              {galleryInputMode === "upload" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {uploadPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img src={uploadPreview} alt="Preview" className="w-full h-48 object-cover" />
                      <button
                        onClick={() => { setUploadFile(null); setUploadPreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        {uploadFile?.name}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 rounded-xl border-2 border-dashed border-border hover:border-[#FFD700] transition-colors flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground"
                    >
                      <Upload size={36} />
                      <div className="text-center">
                        <p className="font-medium">Click to select image</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">JPEG, PNG, WebP, GIF · Max 10MB</p>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Paste URL */}
              {galleryInputMode === "url" && (
                <div>
                  <Label className="text-muted-foreground">Image URL *</Label>
                  <Input
                    value={galleryForm.image}
                    onChange={e => setGalleryForm(p => ({ ...p, image: e.target.value }))}
                    placeholder="https://example.com/photo.jpg"
                    className="bg-background border-border text-foreground mt-1"
                  />
                  {galleryForm.image && (
                    <img
                      src={galleryForm.image}
                      alt="URL preview"
                      className="mt-2 w-full h-32 object-cover rounded-lg border border-border"
                      onError={e => e.target.style.display = "none"}
                    />
                  )}
                </div>
              )}

              {/* SEO & Metadata */}
              <div className="border-t border-border pt-4 space-y-4">
                <p className="text-[#FFD700] text-xs font-semibold tracking-widest uppercase">SEO & Metadata</p>
                <div>
                  <Label className="text-muted-foreground">Image Title</Label>
                  <Input
                    value={galleryForm.title}
                    onChange={e => setGalleryForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Carvio Innova Crysta Fleet"
                    className="bg-background border-border text-foreground mt-1"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Alt Text (for screen readers &amp; SEO)</Label>
                  <Input
                    value={galleryForm.alt_text}
                    onChange={e => setGalleryForm(p => ({ ...p, alt_text: e.target.value }))}
                    placeholder="Luxury SUV fleet at Carvio Cabs"
                    className="bg-background border-border text-foreground mt-1"
                  />
                  <p className="text-muted-foreground/60 text-xs mt-1">Describes the image for Google Image Search indexing</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <select
                    value={galleryForm.category}
                    onChange={e => setGalleryForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full mt-1 bg-background border border-border text-foreground rounded-md px-3 py-2 text-sm"
                  >
                    {galleryCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-muted-foreground">SEO Description (optional)</Label>
                  <textarea
                    value={galleryForm.seo_description}
                    onChange={e => setGalleryForm(p => ({ ...p, seo_description: e.target.value }))}
                    rows={2}
                    placeholder="Photo of our premium Innova Crysta available for airport transfers..."
                    className="w-full mt-1 bg-background border border-border text-foreground rounded-md px-3 py-2 text-sm resize-none"
                  />
                </div>
              </div>

              <Button onClick={addImage} disabled={saving} className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold h-11">
                {saving ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" />{uploadProgress ? "Uploading..." : "Saving..."}</>
                ) : "Add to Gallery"}
              </Button>
            </div>
          ) : (
            /* Video form */
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-muted-foreground">Video Title *</Label>
                <Input value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))} placeholder="Carvio Fleet Showcase" className="bg-background border-border text-foreground mt-1" />
              </div>
              
              {/* Input Mode Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-border">
                <button
                  onClick={() => { setVideoInputMode("upload"); resetVideoForm(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${videoInputMode === "upload" ? "bg-[#FFD700] text-black" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Upload size={16} /> Upload from PC
                </button>
                <button
                  onClick={() => { setVideoInputMode("url"); resetVideoForm(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${videoInputMode === "url" ? "bg-[#FFD700] text-black" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Link2 size={16} /> YouTube URL
                </button>
              </div>

              {/* Upload from PC */}
              {videoInputMode === "upload" && (
                <div>
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
                    className="hidden"
                    onChange={handleVideoFileChange}
                  />
                  {videoUploadPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-background">
                      <video src={videoUploadPreview} controls className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setVideoUploadFile(null); setVideoUploadPreview(""); if (videoFileInputRef.current) videoFileInputRef.current.value = ""; }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => videoFileInputRef.current?.click()}
                      className="w-full h-48 rounded-xl border-2 border-dashed border-border hover:border-[#FFD700] transition-colors flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground"
                    >
                      <Upload size={36} />
                      <div className="text-center">
                        <p className="font-medium">Click to select video</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">MP4, WebM, MOV · Max 100MB</p>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Paste URL */}
              {videoInputMode === "url" && (
                <div>
                  <Label className="text-muted-foreground">YouTube URL *</Label>
                  <Input value={videoForm.video_url} onChange={e => setVideoForm(p => ({ ...p, video_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." className="bg-background border-border text-foreground mt-1" />
                  {videoForm.video_url && getYouTubeId(videoForm.video_url) && (
                    <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-border">
                      <iframe src={`https://www.youtube.com/embed/${getYouTubeId(videoForm.video_url)}`} title="preview" className="w-full h-full" allowFullScreen />
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <Input value={videoForm.description} onChange={e => setVideoForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description..." className="bg-background border-border text-foreground mt-1" />
              </div>
              <Button onClick={addVideo} disabled={saving} className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold h-11">
                {saving ? <><Loader2 size={16} className="mr-2 animate-spin" />{uploadProgress ? "Uploading..." : "Adding..."}</> : "Add Video"}
              </Button>
            </div>

          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
