import { useState, useEffect } from "react";
import { Save, Edit3, X, Globe, AlertCircle, Loader2 } from "lucide-react";
import homeService from "../services/homeService";
import PageHeader from "../components/common/PageHeader";

// Import new components
import { LangTabs, Toast } from "../components/home/HomeUI";
import MainInfoSection from "../components/home/MainInfoSection";
import VideoSection from "../components/home/VideoSection";
import MediaSection from "../components/home/MediaSection";
import ContentRowsSection from "../components/home/ContentRowsSection";
import HomeSiteSection from "../components/home/HomeSiteSection";
import CompanyOrdersSection from "../components/home/CompanyOrdersSection";

/* ═══════════════════════════════════════════════════════════════════════════
   Main Page Component (Orchestrator)
   ═══════════════════════════════════════════════════════════════════════════ */

const Home = () => {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeLang, setActiveLang] = useState("ar");
  const [videoMode, setVideoMode] = useState("url");

  // media[i] file + preview state (replacements for existing slots)
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  // new media items to append
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  const [newMediaPreviews, setNewMediaPreviews] = useState([]);

  // ── Home Site-Section state
  const [sectionData, setSectionData] = useState(null);
  const [sectionForm, setSectionForm] = useState(null);
  const [sectionEditing, setSectionEditing] = useState(false);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [sectionError, setSectionError] = useState(null);
  const [sectionSuccess, setSectionSuccess] = useState(false);
  const [sectionImageFile, setSectionImageFile] = useState(null);
  const [sectionImagePreview, setSectionImagePreview] = useState(null);

  // ── Company Orders Site-Section state
  const [coData, setCoData] = useState(null);
  const [coForm, setCoForm] = useState(null);
  const [coEditing, setCoEditing] = useState(false);
  const [coSaving, setCoSaving] = useState(false);
  const [coError, setCoError] = useState(null);
  const [coSuccess, setCoSuccess] = useState(false);
  const [coImageFile, setCoImageFile] = useState(null);
  const [coImagePreview, setCoImagePreview] = useState(null);

  // ── Fetch ──
  useEffect(() => {
    (async () => {
      try {
        const d = await homeService.getHomeBoth();
        setData(d);
        setForm(d);
        setVideoMode(d.video_url ? "url" : "file");
        setMediaFiles(new Array((d.media ?? []).length).fill(null));
        setMediaPreviews(new Array((d.media ?? []).length).fill(null));
      } catch (err) {
        setError(err.message || "حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const s = await homeService.getSiteSection();
        setSectionData(s);
        setSectionForm(s);
      } catch (err) {
        console.error("Failed to load site section:", err);
      }
    })();

    (async () => {
      try {
        const c = await homeService.getCompanyOrdersSection();
        setCoData(c);
        setCoForm(c);
      } catch (err) {
        console.error("Failed to load company_orders section:", err);
      }
    })();
  }, []);

  // ── Handlers (Main Info) ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRowChange = (rowIndex, field, value) => {
    setForm((prev) => {
      const rows = [...(prev.rows ?? [])];
      rows[rowIndex] = { ...rows[rowIndex], [field]: value };
      return { ...prev, rows };
    });
  };

  const handleImageChange = (e, rowKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => {
      if (prev[`${rowKey}_image_preview`]) URL.revokeObjectURL(prev[`${rowKey}_image_preview`]);
      return {
        ...prev,
        [`${rowKey}_image_file`]: file,
        [`${rowKey}_image_preview`]: previewUrl,
      };
    });
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => {
      if (prev.video_preview) URL.revokeObjectURL(prev.video_preview);
      return {
        ...prev,
        video_file: file,
        video_preview: previewUrl,
        video_url: "",
      };
    });
  };

  const handleMediaFileChange = (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setMediaFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    setMediaPreviews((prev) => {
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      const next = [...prev];
      next[index] = previewUrl;
      return next;
    });
    setForm((prev) => {
      const media_files = [...(prev.media_files ?? [])];
      media_files[index] = file;
      return { ...prev, media_files };
    });
  };

  // Add one or more brand-new media items
  const handleAddMedia = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewMediaFiles((prev) => [...prev, ...files]);
    setNewMediaPreviews((prev) => [...prev, ...previews]);
    setForm((prev) => ({
      ...prev,
      new_media_files: [...(prev.new_media_files ?? []), ...files],
    }));
    // reset input so same file can be re-selected if needed
    e.target.value = "";
  };

  // Remove a pending new media item by list index
  const handleRemoveNewMedia = (index) => {
    setNewMediaPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setForm((prev) => ({
      ...prev,
      new_media_files: (prev.new_media_files ?? []).filter((_, i) => i !== index),
    }));
  };

  // Delete an existing media item from the server by index
  const handleDeleteMedia = async (index) => {
    try {
      await homeService.deleteMedia(index);
      const d = await homeService.getHomeBoth();
      setData(d);
      setForm(d);
      setMediaFiles(new Array((d.media ?? []).length).fill(null));
      setMediaPreviews(new Array((d.media ?? []).length).fill(null));
    } catch (err) {
      console.error("Delete media error:", err);
      setError(err.message || "فشل حذف الوسيط، حاول مرة أخرى");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await homeService.update(form);
      const d = await homeService.getHomeBoth();
      setData(d);
      setForm(d);
      mediaPreviews.forEach((url) => url && URL.revokeObjectURL(url));
      newMediaPreviews.forEach((url) => URL.revokeObjectURL(url));
      setMediaFiles(new Array((d.media ?? []).length).fill(null));
      setMediaPreviews(new Array((d.media ?? []).length).fill(null));
      setNewMediaFiles([]);
      setNewMediaPreviews([]);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Update error:", err);
      if (err.errors) {
        setError(Object.values(err.errors)[0][0]);
      } else {
        setError(err.message || "فشل حفظ التغييرات، حاول مرة أخرى");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (form?.row0_image_preview) URL.revokeObjectURL(form.row0_image_preview);
    if (form?.row1_image_preview) URL.revokeObjectURL(form.row1_image_preview);
    if (form?.video_preview) URL.revokeObjectURL(form.video_preview);
    mediaPreviews.forEach((url) => url && URL.revokeObjectURL(url));
    newMediaPreviews.forEach((url) => URL.revokeObjectURL(url));
    setMediaFiles(new Array((data?.media ?? []).length).fill(null));
    setMediaPreviews(new Array((data?.media ?? []).length).fill(null));
    setNewMediaFiles([]);
    setNewMediaPreviews([]);
    setForm(data);
    setEditing(false);
    setError(null);
  };

  // ── Handlers (Home Site-Section) ──
  const handleSectionChange = (e) => {
    const { name, value } = e.target;
    setSectionForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSectionButtonChange = (index, field, value) => {
    setSectionForm((prev) => {
      const buttons = [...(prev.buttons ?? [])];
      buttons[index] = { ...buttons[index], [field]: value };
      return { ...prev, buttons };
    });
  };
  const handleSectionImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (sectionImagePreview) URL.revokeObjectURL(sectionImagePreview);
    setSectionImageFile(file);
    setSectionImagePreview(URL.createObjectURL(file));
  };
  const handleSectionSave = async () => {
    setSectionSaving(true);
    setSectionError(null);
    try {
      await homeService.updateSiteSection(sectionForm, sectionImageFile);
      const s = await homeService.getSiteSection();
      setSectionData(s);
      setSectionForm(s);
      setSectionImageFile(null);
      setSectionImagePreview(null);
      setSectionEditing(false);
      setSectionSuccess(true);
      setTimeout(() => setSectionSuccess(false), 3000);
    } catch (err) {
      setSectionError(err.errors ? Object.values(err.errors)[0][0] : err.message);
    } finally {
      setSectionSaving(false);
    }
  };

  // ── Handlers (Company Orders Section) ──
  const handleCoChange = (e) => {
    const { name, value } = e.target;
    setCoForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleCoButtonChange = (index, field, value) => {
    setCoForm((prev) => {
      const buttons = [...(prev.buttons ?? [])];
      buttons[index] = { ...buttons[index], [field]: value };
      return { ...prev, buttons };
    });
  };
  const handleCoImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (coImagePreview) URL.revokeObjectURL(coImagePreview);
    setCoImageFile(file);
    setCoImagePreview(URL.createObjectURL(file));
  };
  const handleCoSave = async () => {
    setCoSaving(true);
    setCoError(null);
    try {
      await homeService.updateCompanyOrdersSection(coForm, coImageFile);
      const c = await homeService.getCompanyOrdersSection();
      setCoData(c);
      setCoForm(c);
      setCoImageFile(null);
      setCoImagePreview(null);
      setCoEditing(false);
      setCoSuccess(true);
      setTimeout(() => setCoSuccess(false), 3000);
    } catch (err) {
      setCoError(err.errors ? Object.values(err.errors)[0][0] : err.message);
    } finally {
      setCoSaving(false);
    }
  };

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-56 bg-gray-200 rounded-xl" />
        {[1, 2, 3].map((i) => <div key={i} className="h-44 bg-gray-100 rounded-2xl" />)}
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={40} className="text-red-300" />
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="الصفحة الرئيسية" subtitle="إدارة محتوى الصفحة الرئيسية">
        {editing ? (
          <>
            <button onClick={handleCancel} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all duration-200">
              <X size={15} /> إلغاء
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-60 shadow-sm shadow-secondary/20">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </button>
          </>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:opacity-90 transition-all duration-200 shadow-sm shadow-secondary/20">
            <Edit3 size={15} /> تعديل
          </button>
        )}
      </PageHeader>

      {success && <Toast type="success" message="تم حفظ التغييرات بنجاح ✅" onClose={() => setSuccess(false)} />}
      {error && <Toast type="error" message={error} onClose={() => setError(null)} />}

      {editing && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Globe size={14} /> <span>اختر اللغة لتعديل المحتوى:</span>
          </div>
          <LangTabs activeLang={activeLang} onChange={setActiveLang} />
        </div>
      )}

      {/* Main Sections */}
      <MainInfoSection editing={editing} activeLang={activeLang} form={form} data={data} onChange={handleChange} />
      <VideoSection editing={editing} data={data} form={form} onFileChange={handleVideoFileChange} />
      <MediaSection
        editing={editing}
        data={data}
        mediaFiles={mediaFiles}
        mediaPreviews={mediaPreviews}
        onMediaFileChange={handleMediaFileChange}
        newMediaFiles={newMediaFiles}
        newMediaPreviews={newMediaPreviews}
        onAddMedia={handleAddMedia}
        onRemoveNewMedia={handleRemoveNewMedia}
        onDeleteMedia={handleDeleteMedia}
      />
      <ContentRowsSection editing={editing} activeLang={activeLang} form={form} data={data} onRowChange={handleRowChange} onImageChange={handleImageChange} />

      {/* Site Sections (Independent Edit) */}
      <HomeSiteSection
        sectionData={sectionData} sectionForm={sectionForm} sectionEditing={sectionEditing}
        sectionSaving={sectionSaving} sectionSuccess={sectionSuccess} sectionError={sectionError}
        sectionImagePreview={sectionImagePreview} onChange={handleSectionChange}
        onButtonChange={handleSectionButtonChange} onImageChange={handleSectionImageChange}
        onSave={handleSectionSave} onCancel={() => { setSectionForm(sectionData); setSectionImagePreview(null); setSectionEditing(false); }}
        onEdit={() => setSectionEditing(true)} onCloseSuccess={() => setSectionSuccess(false)}
        onCloseError={() => setSectionError(null)}
      />

      <CompanyOrdersSection
        coData={coData} coForm={coForm} coEditing={coEditing}
        coSaving={coSaving} coSuccess={coSuccess} coError={coError}
        coImagePreview={coImagePreview} onChange={handleCoChange}
        onButtonChange={handleCoButtonChange} onImageChange={handleCoImageChange}
        onSave={handleCoSave} onCancel={() => { setCoForm(coData); setCoImagePreview(null); setCoEditing(false); }}
        onEdit={() => setCoEditing(true)} onCloseSuccess={() => setCoSuccess(false)}
        onCloseError={() => setCoError(null)}
      />
    </div>
  );
};

export default Home;
