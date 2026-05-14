import {
  Edit,
  Plus,
  Search,
  Trash2,
  Loader,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import Button from "../components/common/Button";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/common/Card";
import Table, { TableCell, TableRow } from "../components/common/Table";
import SubCategoryModal from "../components/dashboard/SubCategoryModal";
import { subCategoryService } from "../services/subCategoryService";
import { categoryService } from "../services/categoryService";

const SubCategories = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategory = useCallback(async () => {
    try {
      const response = await categoryService.getById(categoryId);
      setCategory(response.data);
    } catch (error) {
      toast.error(
        "\u0641\u0634\u0644 \u062a\u062d\u0645\u064a\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0641\u0626\u0629",
      );
      console.error(error);
    }
  }, [categoryId]);

  const fetchSubCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subCategoryService.getAll(categoryId);

      setSubCategories(response.data || []);
    } catch (error) {
      toast.error(
        "\u0641\u0634\u0644 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u0641\u0631\u0639\u064a\u0629",
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
      fetchSubCategories();
    }
  }, [categoryId, fetchCategory, fetchSubCategories]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredSubCategories = subCategories.filter((sub) =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAdd = () => {
    setEditingSubCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subCategory) => {
    setEditingSubCategory(subCategory);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await subCategoryService.delete(id);
      toast.success("تم حذف القسم الفرعي بنجاح");
      fetchSubCategories();
    } catch (error) {
      toast.error("فشل حذف القسم الفرعي");
      console.error(error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingSubCategory) {
        const response = await subCategoryService.update(
          editingSubCategory.id,
          formData,
        );
        // Update local state immediately with returned data so dates refresh at once
        const updated = response?.data || response;
        setSubCategories((prev) =>
          prev.map((s) =>
            s.id === editingSubCategory.id ? { ...s, ...updated } : s,
          ),
        );
        toast.success("تم تحديث القسم الفرعي بنجاح");
      } else {
        await subCategoryService.create({
          ...formData,
          category_id: categoryId,
        });
        toast.success("تم إضافة القسم الفرعي بنجاح");
        fetchSubCategories();
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        editingSubCategory
          ? "فشل تحديث القسم الفرعي"
          : "فشل إضافة القسم الفرعي",
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 gap-2">
        <button
          onClick={() => navigate("/category")}
          className="hover:text-secondary transition-colors font-medium"
        >
          الفئات
        </button>
        <ArrowRight size={14} className="rotate-180" />
        <span className="text-gray-900 font-medium">
          {category?.name || "..."}
        </span>
        <ArrowRight size={14} className="rotate-180" />
        <span className="text-secondary font-medium">الأقسام الفرعية</span>
      </nav>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          الأقسام الفرعية - {category?.name || ""}
        </h1>
        <Button variant="primary" onClick={handleAdd}>
          <Plus size={20} className="ml-2" />
          إضافة قسم فرعي
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle>قائمة الأقسام الفرعية</CardTitle>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن الأقسام الفرعية..."
              className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary w-full sm:w-64"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="animate-spin h-8 w-8 text-secondary" />
            </div>
          ) : (
            <>
              <Table
                headers={[
                  "الصورة",
                  "الاسم",
                  "الوصف",
                  "عدد المنتجات",
                  "تاريخ التحديث",
                  "الإجراءات",
                ]}
              >
                {filteredSubCategories.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                        {sub.image ? (
                          <img
                            src={sub.image}
                            alt={sub.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                            No Img
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {sub.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {sub.description || "-"}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() =>
                          navigate(
                            `/category/${categoryId}/subcategories/${sub.id}/products`,
                          )
                        }
                        className="group inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all duration-300 border border-secondary/20 hover:border-secondary shadow-sm hover:shadow-md cursor-pointer"
                        title="عرض المنتجات"
                      >
                        <ShoppingBag
                          size={16}
                          className="group-hover:scale-110 transition-transform"
                        />
                        <span className="text-sm font-bold leading-none">
                          {sub.products_count || 0}
                        </span>
                      </button>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const d = new Date(sub.updated_at || sub.created_at);
                        return isNaN(d) ? "—" : d.toLocaleDateString("ar-EG");
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2   justify-end">
                        <button
                          onClick={() => handleEdit(sub)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                          title="تعديل"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="حذف"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
              {filteredSubCategories.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  {searchTerm
                    ? `لا توجد أقسام فرعية تطابق "${searchTerm}"`
                    : "لا توجد أقسام فرعية في هذه الفئة"}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <SubCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingSubCategory}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default SubCategories;
