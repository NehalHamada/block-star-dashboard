import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Plus, Edit, Trash2, Loader, Tag, TreePine } from "lucide-react";
import productTypesService from "../services/productTypesService";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/common/Card";
import Table, { TableCell, TableRow } from "../components/common/Table";
import Button from "../components/common/Button";

// ─── Reusable Add/Edit Modal ──────────────────────────────────────────────────
const TypeModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  title,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialData?.name || "");
    setDescription(initialData?.description || "");
    setIsActive(initialData?.is_active ?? true);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      is_active: isActive,
    });
  };

  const inputCls =
    "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الاسم <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="مثال: كرسي"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوصف
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputCls}
              placeholder="وصف مختصر..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-secondary w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              نشط
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-secondary text-white rounded-xl text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isLoading
                ? "جارٍ الحفظ..."
                : initialData
                  ? "حفظ التعديلات"
                  : "إضافة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Generic CRUD Table ───────────────────────────────────────────────────────
const TypesTable = ({ items, loading, onEdit, onDelete, deletingId }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin h-8 w-8 text-secondary" />
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">
        لا توجد عناصر بعد
      </div>
    );
  }
  return (
    <Table headers={["#", "الاسم", "الوصف", "الحالة", "الإجراءات"]}>
      {items.map((item) => (
        <TableRow key={item.id}>
          <TableCell className="text-gray-400 text-xs w-10">
            {item.id}
          </TableCell>
          <TableCell className="font-medium text-gray-900">
            {item.name}
          </TableCell>
          <TableCell className="text-gray-500 text-sm max-w-xs truncate">
            {item.description || "—"}
          </TableCell>
          <TableCell>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${item.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {item.is_active !== false ? "نشط" : "غير نشط"}
            </span>
          </TableCell>
          <TableCell>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => onEdit(item)}
                className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                title="تعديل"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                disabled={deletingId === item.id}
                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
                title="حذف"
              >
                {deletingId === item.id ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProductTypes = () => {
  const [activeTab, setActiveTab] = useState("product");

  // Product Types state
  const [productTypes, setProductTypes] = useState([]);
  const [ptLoading, setPtLoading] = useState(true);
  const [ptModalOpen, setPtModalOpen] = useState(false);
  const [ptEditing, setPtEditing] = useState(null);
  const [ptSubmitting, setPtSubmitting] = useState(false);
  const [ptDeletingId, setPtDeletingId] = useState(null);

  // Wood Types state
  const [woodTypes, setWoodTypes] = useState([]);
  const [wtLoading, setWtLoading] = useState(true);
  const [wtModalOpen, setWtModalOpen] = useState(false);
  const [wtEditing, setWtEditing] = useState(null);
  const [wtSubmitting, setWtSubmitting] = useState(false);
  const [wtDeletingId, setWtDeletingId] = useState(null);

  // ── Product Types CRUD ────
  const fetchProductTypes = useCallback(async () => {
    try {
      setPtLoading(true);
      const res = await productTypesService.getAllProductTypes();
      setProductTypes(res.data || []);
    } catch {
      toast.error("فشل تحميل أنواع المنتجات");
    } finally {
      setPtLoading(false);
    }
  }, []);

  const handlePtSubmit = async (data) => {
    try {
      setPtSubmitting(true);
      if (ptEditing) {
        await productTypesService.updateProductType(ptEditing.id, data);
        toast.success("تم تحديث نوع المنتج");
      } else {
        await productTypesService.createProductType(data);
        toast.success("تم إضافة نوع المنتج");
      }
      setPtModalOpen(false);
      fetchProductTypes();
    } catch (err) {
      toast.error(err?.message || "حدث خطأ");
    } finally {
      setPtSubmitting(false);
    }
  };

  const handlePtDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا النوع؟")) return;
    try {
      setPtDeletingId(id);
      await productTypesService.deleteProductType(id);
      toast.success("تم حذف نوع المنتج");
      fetchProductTypes();
    } catch {
      toast.error("فشل حذف نوع المنتج");
    } finally {
      setPtDeletingId(null);
    }
  };

  // ── Wood Types CRUD ───────
  const fetchWoodTypes = useCallback(async () => {
    try {
      setWtLoading(true);
      const res = await productTypesService.getAllWoodTypes();
      setWoodTypes(res.data || []);
    } catch {
      toast.error("فشل تحميل أنواع الخشب");
    } finally {
      setWtLoading(false);
    }
  }, []);

  const handleWtSubmit = async (data) => {
    try {
      setWtSubmitting(true);
      if (wtEditing) {
        await productTypesService.updateWoodType(wtEditing.id, data);
        toast.success("تم تحديث نوع الخشب");
      } else {
        await productTypesService.createWoodType(data);
        toast.success("تم إضافة نوع الخشب");
      }
      setWtModalOpen(false);
      fetchWoodTypes();
    } catch (err) {
      toast.error(err?.message || "حدث خطأ");
    } finally {
      setWtSubmitting(false);
    }
  };

  const handleWtDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا النوع؟")) return;
    try {
      setWtDeletingId(id);
      await productTypesService.deleteWoodType(id);
      toast.success("تم حذف نوع الخشب");
      fetchWoodTypes();
    } catch {
      toast.error("فشل حذف نوع الخشب");
    } finally {
      setWtDeletingId(null);
    }
  };

  useEffect(() => {
    fetchProductTypes();
    fetchWoodTypes();
  }, [fetchProductTypes, fetchWoodTypes]);

  const tabs = [
    { id: "product", label: "أنواع المنتجات", icon: Tag },
    { id: "wood", label: "أنواع الخشب", icon: TreePine },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">إدارة الأنواع</h1>
        <Button
          variant="primary"
          onClick={() => {
            if (activeTab === "product") {
              setPtEditing(null);
              setPtModalOpen(true);
            } else {
              setWtEditing(null);
              setWtModalOpen(true);
            }
          }}
        >
          <Plus size={20} className="ml-2" />
          {activeTab === "product" ? "إضافة نوع منتج" : "إضافة نوع خشب"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-secondary text-secondary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Types Tab */}
      {activeTab === "product" && (
        <Card>
          <CardHeader>
            <CardTitle>أنواع المنتجات ({productTypes.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TypesTable
              items={productTypes}
              loading={ptLoading}
              onEdit={(item) => {
                setPtEditing(item);
                setPtModalOpen(true);
              }}
              onDelete={handlePtDelete}
              deletingId={ptDeletingId}
            />
          </CardContent>
        </Card>
      )}

      {/* Wood Types Tab */}
      {activeTab === "wood" && (
        <Card>
          <CardHeader>
            <CardTitle>أنواع الخشب ({woodTypes.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TypesTable
              items={woodTypes}
              loading={wtLoading}
              onEdit={(item) => {
                setWtEditing(item);
                setWtModalOpen(true);
              }}
              onDelete={handleWtDelete}
              deletingId={wtDeletingId}
            />
          </CardContent>
        </Card>
      )}

      {/* Product Type Modal */}
      <TypeModal
        isOpen={ptModalOpen}
        onClose={() => setPtModalOpen(false)}
        onSubmit={handlePtSubmit}
        initialData={ptEditing}
        isLoading={ptSubmitting}
        title={ptEditing ? "تعديل نوع المنتج" : "إضافة نوع منتج جديد"}
      />

      {/* Wood Type Modal */}
      <TypeModal
        isOpen={wtModalOpen}
        onClose={() => setWtModalOpen(false)}
        onSubmit={handleWtSubmit}
        initialData={wtEditing}
        isLoading={wtSubmitting}
        title={wtEditing ? "تعديل نوع الخشب" : "إضافة نوع خشب جديد"}
      />
    </div>
  );
};

export default ProductTypes;
