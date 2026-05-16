import { useState } from "react";
import {
  Truck,
  Plus,
  Search,
  MapPin,
  Edit2,
  Trash2,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGovernorates } from "../hooks/useGovernorates";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import GovernorateModal from "../components/shipping/GovernorateModal";
import ConfirmModal from "../components/common/ConfirmModal";
import toast from "react-hot-toast";

const ShippingManagement = () => {
  const {
    governorates,
    isLoading,
    createGovernorate,
    updateGovernorate,
    deleteGovernorate,
    isCreating,
    isUpdating,
    isDeleting,
  } = useGovernorates();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Filtered list
  const filteredData = governorates?.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.name_ar?.includes(search) ||
      item.name_en?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await deleteGovernorate(deleteId);
      setDeleteId(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingItem) {
        await updateGovernorate({ id: editingItem.id, data });
      } else {
        await createGovernorate(data);
      }
      setIsModalOpen(false);
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="التحكم في سعر الشحن"
        subtitle="إدارة مناطق الشحن وتكاليف التوصيل لكل منطقة"
      >
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-secondary/20 hover:scale-[1.02] transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>إضافة منطقة</span>
        </button>
      </PageHeader>

      {/* Stats / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-gray group-focus-within:text-secondary transition-colors"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن منطقة..."
            className="w-full pr-12 pl-4 py-3 bg-white border border-light-gray/20 rounded-2xl outline-none focus:border-secondary transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-dark-gray bg-light-beige/50 px-4 py-2 rounded-lg border border-light-gray/10">
          <MapPin size={16} className="text-secondary" />
          <span>
            إجمالي المناطق:{" "}
            <span className="font-bold text-text-black">
              {governorates?.length || 0}
            </span>
          </span>
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-light-gray/5 animate-pulse space-y-3"
            >
              <div className="h-4 w-1/2 bg-light-gray rounded" />
              <div className="h-8 w-1/3 bg-light-beige rounded" />
              <div className="h-10 w-full bg-light-gray/50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredData?.length === 0 ? (
        <EmptyState icon={Truck} message="لا توجد مناطق شحن مطابقة لبحثك" />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredData.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white rounded-xl p-4 border border-light-gray/10 shadow-sm hover:shadow-lg hover:border-secondary/20 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                    <Truck size={20} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-dark-gray hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-dark-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-base font-bold text-text-black group-hover:text-secondary transition-colors">
                    {item.name_ar}
                  </h4>
                  <p className="text-[11px] text-dark-gray opacity-60 truncate">
                    {item.name_en}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-light-gray/5 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-dark-gray block mb-0.5">
                      تكلفة الشحن
                    </span>
                    <span className="text-xl font-black text-secondary">
                      {item.shipping_cost}
                      <span className="text-xs font-normal mr-1">ج.م</span>
                    </span>
                  </div>
                  <div className="text-[10px] text-light-gray">
                    ID: #{item.id}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal */}
      <GovernorateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingItem}
        isLoading={isCreating || isUpdating}
      />

      {deleteId && (
        <ConfirmModal
          isOpen={!!deleteId}
          onCancel={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title="حذف المنطقة"
          message="هل أنت متأكد من حذف هذه المنطقة؟ لا يمكن التراجع عن هذا الإجراء."
          confirmLabel="حذف"
          cancelLabel="إلغاء"
          danger={true}
        />
      )}
    </div>
  );
};

export default ShippingManagement;
