import {
  Edit,
  Plus,
  Search,
  Trash2,
  Loader,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch category info if in category-scoped mode
  const fetchCategory = useCallback(async () => {
    if (!categoryId) return;
    try {
      const response = await categoryService.getById(categoryId);
      setCategory(response.data);
    } catch (error) {
      toast.error("فشل تحميل بيانات الفئة");
    }
  }, [categoryId]);

  // Fetch all categories for filter dropdown if in standalone mode
  const fetchCategoriesList = useCallback(async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data || []);
    } catch (error) {
      // Handled silently
    }
  }, []);

  // Fetch subcategories
  const fetchSubCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subCategoryService.getAll(categoryId || null);
      // API response wrapper might contain data.data or data
      const list = response.data?.data || response.data || [];
      setSubCategories(list);
    } catch (error) {
      toast.error("فشل تحميل الأقسام الفرعية");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchSubCategories();
    if (categoryId) {
      fetchCategory();
    } else {
      fetchCategoriesList();
    }
  }, [categoryId, fetchCategory, fetchCategoriesList, fetchSubCategories]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter subcategories dynamically
  const filteredSubCategories = useMemo(() => {
    return subCategories.filter((sub) => {
      const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by Category Select in standalone mode
      if (!categoryId && selectedCategoryFilter) {
        const subCatId = sub.category_id || sub.category?.id;
        return matchesSearch && String(subCatId) === String(selectedCategoryFilter);
      }
      
      return matchesSearch;
    });
  }, [subCategories, searchTerm, categoryId, selectedCategoryFilter]);

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
        const updated = response?.data || response;
        setSubCategories((prev) =>
          prev.map((s) =>
            s.id === editingSubCategory.id ? { ...s, ...updated } : s,
          ),
        );
        toast.success("تم تحديث القسم الفرعي بنجاح");
      } else {
        // In standalone mode, category_id comes from modal form data.
        // In scoped mode, category_id comes from categoryId URL param.
        const targetCategoryId = categoryId || formData.category_id;
        await subCategoryService.create({
          ...formData,
          category_id: targetCategoryId,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {categoryId ? (
        <nav className="flex items-center text-sm text-gray-500 gap-2">
          <button
            onClick={() => navigate("/category")}
            className="hover:text-secondary transition-colors font-medium cursor-pointer"
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
      ) : (
        <nav className="flex items-center text-sm text-gray-500 gap-2">
          <span className="text-secondary font-medium">الأقسام الفرعية</span>
        </nav>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          {categoryId ? `الأقسام الفرعية - ${category?.name || ""}` : "كافة الأقسام الفرعية"}
        </h1>
        <Button variant="primary" onClick={handleAdd}>
          <Plus size={20} className="ml-2" />
          إضافة قسم فرعي
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle>قائمة الأقسام الفرعية</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Category Filter Dropdown (Only in standalone mode) */}
            {!categoryId && (
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white text-sm text-black min-w-48"
              >
                <option value="">كل الفئات</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث عن الأقسام الفرعية..."
                className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
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
                headers={
                  categoryId
                    ? [
                        "الصورة",
                        "الاسم",
                        "الوصف",
                        "عدد المنتجات",
                        "تاريخ التحديث",
                        "الإجراءات",
                      ]
                    : [
                        "الصورة",
                        "الاسم",
                        "الفئة الرئيسية",
                        "الوصف",
                        "عدد المنتجات",
                        "تاريخ التحديث",
                        "الإجراءات",
                      ]
                }
              >
                {filteredSubCategories.map((sub) => {
                  const subCatId = sub.category_id || sub.category?.id;
                  const finalCategoryId = categoryId || subCatId;
                  
                  return (
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
                      
                      {/* Render Category Name column in standalone mode */}
                      {!categoryId && (
                        <TableCell className="text-gray-950 font-semibold">
                          {sub.category?.name || "—"}
                        </TableCell>
                      )}

                      <TableCell className="max-w-xs truncate">
                        {sub.description || "-"}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() =>
                            navigate(
                              `/category/${finalCategoryId}/subcategories/${sub.id}/products`,
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
                        <div className="flex items-center space-x-2 justify-end">
                          <button
                            onClick={() => handleEdit(sub)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded cursor-pointer"
                            title="تعديل"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Table>
              {filteredSubCategories.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  {searchTerm || selectedCategoryFilter
                    ? "لا توجد أقسام فرعية تطابق خيارات التصفية والبحث"
                    : "لا توجد أقسام فرعية مضافة بعد"}
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
        showCategorySelect={!categoryId}
        categories={categories}
      />
    </div>
  );
};

export default SubCategories;
