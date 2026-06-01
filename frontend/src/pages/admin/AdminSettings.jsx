import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { resolveImageUrl } from "@/utils/imageUrl";
import { AdminSidebar, AdminHeader } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Save, Globe, Phone, Mail, MapPin, Palette, CreditCard } from "lucide-react";

export default function AdminSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    company_name: "Carvio Cabs",
    phone: "",
    email: "",
    address: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    twitter: "",
    map_embed: "",
    enable_cash_payment: true,
    hero_heading: "More Than a Ride — It's an Experience.",
    hero_subheading: "Where comfort meets professionalism and every journey feels effortless.",
    hero_bg_image: "",
    footer_tagline: "Premium transportation services for business travelers and corporate clients.",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    custom_scripts: "",
    favicon_url: "",
  });

  useEffect(() => {
    axios.get(`${API}/settings`).then(r => setSettings(r.data)).catch(() => toast.error("Failed to load settings")).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings`, settings, { withCredentials: true });
      toast.success("Settings saved successfully!");
    } catch { toast.error("Failed to save settings"); } finally { setSaving(false); }
  };

  const Field = ({ label, name, placeholder, type = "text" }) => (
    <div>
      <Label className="text-muted-foreground">{label}</Label>
      <Input name={name} value={settings[name] || ""} onChange={handleChange} placeholder={placeholder} type={type}
        className="bg-background border-border focus:border-[#FFD700] text-foreground mt-1" />
    </div>
  );

  const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-secondary rounded-lg border border-border p-5 mb-5">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
        <Icon className="text-[#FFD700]" size={20} />
        <h3 className="text-foreground font-semibold text-base">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-primary">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64">
        <AdminHeader title="Site Settings" setIsOpen={setSidebarOpen} />
        <div className="p-6 max-w-4xl">
          {loading ? (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* Payment Settings */}
              <Section icon={CreditCard} title="Payment Configuration">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-foreground font-medium">Enable Cash Payments</p>
                    <p className="text-muted-foreground text-sm">Show "Pay After Ride" option at checkout</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="enable_cash_payment" checked={settings.enable_cash_payment} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                  </label>
                </div>
              </Section>

              {/* Hero Section */}
              <Section icon={Palette} title="Homepage Hero Section">
                <div className="space-y-4">
                  <Field label="Main Heading" name="hero_heading" placeholder="More Than a Ride — It's an Experience." />
                  <Field label="Subheading" name="hero_subheading" placeholder="Where comfort meets professionalism..." />
                  <Field label="Background Image URL (Leave empty for default)" name="hero_bg_image" placeholder="https://..." />
                  {settings.hero_bg_image && (
                    <img src={resolveImageUrl(settings.hero_bg_image)} alt="Hero BG Preview" className="w-full h-32 object-cover rounded-lg border border-border" onError={e => e.target.style.display = "none"} />
                  )}
                </div>
              </Section>

              {/* Company Info */}
              <Section icon={Globe} title="Company Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Company Name" name="company_name" placeholder="Carvio Cabs" />
                  <Field label="Footer Tagline" name="footer_tagline" placeholder="Premium transportation..." />
                </div>
              </Section>

              {/* Contact */}
              <Section icon={Phone} title="Contact Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Phone" name="phone" placeholder="+91 99999 99999" />
                  <Field label="WhatsApp Number (with country code)" name="whatsapp" placeholder="919999999999" />
                  <Field label="Support Email" name="email" placeholder="support@carviocabs.com" type="email" />
                  <Field label="Address" name="address" placeholder="Mumbai, Maharashtra" />
                </div>
              </Section>

              {/* SEO & Tracking */}
              <Section icon={Settings} title="SEO & Tracking">
                <div className="space-y-4">
                  <Field label="Meta Title (Browser Tab Title)" name="meta_title" placeholder="Carvio Cabs | Premium Taxi Services" />
                  <div>
                    <Label className="text-muted-foreground">Meta Description</Label>
                    <textarea name="meta_description" value={settings.meta_description || ""} onChange={handleChange} rows={3}
                      placeholder="Enter description for search engines..."
                      className="w-full mt-1 bg-background border border-border text-foreground rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#FFD700]" />
                  </div>
                  <Field label="Meta Keywords (Comma separated)" name="meta_keywords" placeholder="taxi, cab, mumbai, luxury" />
                  <Field label="Favicon URL" name="favicon_url" placeholder="https://... (PNG/ICO)" />
                  <div>
                    <Label className="text-muted-foreground">Custom Scripts (GTM, Analytics, etc.)</Label>
                    <textarea name="custom_scripts" value={settings.custom_scripts || ""} onChange={handleChange} rows={5}
                      placeholder="Paste your <script> tags here..."
                      className="w-full mt-1 bg-background border border-border text-foreground rounded-md px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:border-[#FFD700]" />
                  </div>
                </div>
              </Section>

              {/* Social */}
              <Section icon={Globe} title="Social Media Links">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Facebook URL" name="facebook" placeholder="https://facebook.com/..." />
                  <Field label="Instagram URL" name="instagram" placeholder="https://instagram.com/..." />
                  <Field label="Twitter/X URL" name="twitter" placeholder="https://twitter.com/..." />
                </div>
              </Section>

              <Button onClick={handleSave} disabled={saving} className="w-full bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold h-12 text-base">
                {saving ? "Saving..." : <><Save className="mr-2" size={20} /> Save All Settings</>}
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
