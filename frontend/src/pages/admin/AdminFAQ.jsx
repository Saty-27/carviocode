import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API } from "@/apiConfig";
import { AdminSidebar, AdminHeader } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Save, ChevronDown, HelpCircle } from "lucide-react";

const PAGES = [
  { value: "home",     label: "🏠 Home" },
  { value: "about",    label: "ℹ️ About Us" },
  { value: "services", label: "🚗 Services" },
  { value: "contact",  label: "📞 Contact" },
  { value: "fleet",    label: "🚘 Fleet" },
  { value: "gallery",  label: "🖼 Gallery" },
];

const emptyForm = { question: "", answer: "", page: "home", order: 0, is_active: true };

export default function AdminFAQ() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("home");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null); // faq_id of FAQ being edited
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get(`${API}/admin/faqs`, { withCredentials: true });
      setFaqs(res.data);
    } catch (e) {
      toast.error("Failed to load FAQs");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchFaqs(); }, []);

  const pageFaqs = faqs.filter(f => f.page === activePage).sort((a, b) => a.order - b.order);
  const pageCounts = PAGES.reduce((acc, p) => {
    acc[p.value] = faqs.filter(f => f.page === p.value).length;
    return acc;
  }, {});

  const resetForm = () => {
    setForm({ ...emptyForm, page: activePage });
    setEditing(null);
    setShowForm(false);
  };

  const openAdd = () => {
    setForm({ ...emptyForm, page: activePage });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (faq) => {
    setForm({ question: faq.question, answer: faq.answer, page: faq.page, order: faq.order, is_active: faq.is_active });
    setEditing(faq.faq_id);
    setShowForm(true);
    setExpandedId(null);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Question and Answer are required.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/admin/faqs/${editing}`, form, { withCredentials: true });
        toast.success("FAQ updated!");
      } else {
        await axios.post(`${API}/admin/faqs`, form, { withCredentials: true });
        toast.success("FAQ added!");
      }
      resetForm();
      fetchFaqs();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to save FAQ");
    } finally { setSaving(false); }
  };

  const handleDelete = async (faqId, question) => {
    if (!window.confirm(`Delete this FAQ?\n"${question}"`)) return;
    try {
      await axios.delete(`${API}/admin/faqs/${faqId}`, { withCredentials: true });
      toast.success("FAQ deleted");
      setFaqs(p => p.filter(f => f.faq_id !== faqId));
    } catch (e) { toast.error("Failed to delete"); }
  };

  return (
    <div className="min-h-screen bg-primary">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64">
        <AdminHeader title="FAQ Manager" setIsOpen={setSidebarOpen} />
        <div className="p-6">

          {/* Page Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {PAGES.map(p => (
              <button key={p.value} onClick={() => { setActivePage(p.value); resetForm(); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${activePage === p.value ? "bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20" : "bg-background text-muted-foreground hover:text-foreground border border-border"}`}>
                {p.label}
                {pageCounts[p.value] > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activePage === p.value ? "bg-black/20 text-black" : "bg-secondary text-muted-foreground"}`}>
                    {pageCounts[p.value]}
                  </span>
                )}
              </button>
            ))}
            <Button onClick={openAdd} className="ml-auto bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold">
              <Plus size={16} className="mr-1.5" /> Add FAQ
            </Button>
          </div>

          {/* Add / Edit Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="bg-secondary border border-border rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                    <HelpCircle className="text-[#FFD700]" size={20} />
                    {editing ? "Edit FAQ" : `Add FAQ for ${PAGES.find(p => p.value === form.page)?.label}`}
                  </h3>
                  <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Page *</Label>
                      <select value={form.page} onChange={e => setForm(p => ({ ...p, page: e.target.value }))}
                        className="w-full mt-1 bg-background border border-border text-foreground rounded-md px-3 py-2 text-sm focus:border-[#FFD700] focus:outline-none">
                        {PAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Display Order (lower = first)</Label>
                      <Input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                        className="bg-background border-border text-foreground mt-1" min={0} />
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Question *</Label>
                    <Input value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                      placeholder="What is the minimum booking time?" className="bg-background border-border text-foreground mt-1" />
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Answer *</Label>
                    <textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} rows={4}
                      placeholder="The minimum booking time is 4 hours for our local rental packages..."
                      className="w-full mt-1 bg-background border border-border text-foreground rounded-md px-3 py-2 text-sm resize-none focus:border-[#FFD700] focus:outline-none" />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                        className="w-4 h-4 accent-[#FFD700]" />
                      <span className="text-muted-foreground text-sm">Active (visible on public page)</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleSave} disabled={saving} className="bg-[#FFD700] text-black hover:bg-[#E5C100] font-semibold px-8">
                      <Save size={15} className="mr-2" /> {saving ? "Saving..." : editing ? "Update FAQ" : "Save FAQ"}
                    </Button>
                    <Button onClick={resetForm} variant="outline" className="border-border text-muted-foreground hover:text-foreground">Cancel</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAQ List for active page */}
          {loading ? (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          ) : pageFaqs.length === 0 ? (
            <div className="text-center py-20 bg-secondary rounded-2xl border border-border">
              <HelpCircle size={48} className="text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No FAQs for this page yet</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Click "Add FAQ" to create your first FAQ for this page</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pageFaqs.map((faq, i) => (
                <motion.div key={faq.faq_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`border rounded-xl overflow-hidden transition-all ${!faq.is_active ? "opacity-50 border-border" : "border-border"}`}>
                  <div className="flex items-center gap-4 p-4 bg-secondary">
                    <span className="text-muted-foreground text-xs font-mono w-5 text-center">{faq.order}</span>
                    <button className="flex-1 text-left text-foreground font-medium text-sm" onClick={() => setExpandedId(expandedId === faq.faq_id ? null : faq.faq_id)}>
                      {faq.question}
                      {!faq.is_active && <span className="ml-2 text-xs text-muted-foreground font-normal">(hidden)</span>}
                    </button>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(faq)} className="w-8 h-8 rounded-lg bg-background hover:bg-[#FFD700]/20 flex items-center justify-center text-muted-foreground hover:text-[#FFD700] transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(faq.faq_id, faq.question)} className="w-8 h-8 rounded-lg bg-background hover:bg-red-500/20 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-all">
                        <Trash2 size={13} />
                      </button>
                      <ChevronDown size={16} className={`text-muted-foreground transition-transform ${expandedId === faq.faq_id ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedId === faq.faq_id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="px-5 py-4 text-muted-foreground text-sm leading-relaxed border-t border-border bg-background whitespace-pre-wrap">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
