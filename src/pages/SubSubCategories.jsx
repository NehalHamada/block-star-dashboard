import {
  Edit,
  Plus,
  Search,
  Trash2,
  Loader,
  ShoppingBag,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import Button from "../components/common/Button";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/common/Card";
import Table, { TableCell, TableRow } from "../components/common/Table";
import SubSubCategoryModal from "../components/dashboard/SubSubCategoryModal";
import { subSubCategoryService } from "../services/subSubCategoryService";
import { categoryService } from "../services/categoryService";
import axiosInstance from "../services/axiosInstance";

const SubSubCategories = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [selectedSubCategoryFilter, setSelectedSubCategoryFilter] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all lists for categories and subcategories
  const fetchFilterLists = useCallback(async () => {
    try {
      const [catsRes, subsRes] = await Promise.all([
        categoryService.getAll(),
        axiosInstance.get("/subcategories")
      ]);
      setCategories(catsRes.data || []);
      setAllSubCategories(subsRes.data?.data || subsRes.data || []);
    } catch (error) {
      // Failed silently
    }
  }, []);

  // Fetch all sub-subcategories
  const fetchSubSubCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subSubCategoryService.getAll();
      // API wrapper might contain data.data or data
      const list = response.data?.data || response.data || [];
      setSubSubCategories(list);
    } catch (error) {
      toast.error("فشل تحميل الأقسام الفرعية الفرعية");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubSubCategories();
    fetchFilterLists();
  }, [fetchSubSubCategories, fetchFilterLists]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Dynamically filter subcategories in filter dropdown based on category filter
  const filteredSubCategoriesForFilter = useMemo(() => {
    if (!selectedCategoryFilter) return allSubCategories;
    return allSubCategories.filter(
      (sub) => String(sub.category_id || sub.category?.id) === String(selectedCategoryFilter)
    );
  }, [allSubCategories, selectedCategoryFilter]);

  // Reset subcategory filter when category filter changes
  useEffect(() => {
    setSelectedSubCategoryFilter("");
  }, [selectedCategoryFilter]);

  // Dynamically filter the list displayed in the table
  const filteredSubSubCategories = useMemo(() => {
    return subSubCategories.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by Category
      let matchesCategory = true;
      if (selectedCategoryFilter) {
        const subCat = allSubCategories.find((s) => String(s.id) === String(item.subcategory_id));
        const catId = subCat?.category_id || subCat?.category?.id;
        matchesCategory = String(catId) === String(selectedCategoryFilter);
      }

      // Filter by Subcategory
      let matchesSubCategory = true;
      if (selectedSubCategoryFilter) {
        matchesSubCategory = String(item.subcategory_id) === String(selectedSubCategoryFilter);
      }

      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  }, [subSubCategories, searchTerm, selectedCategoryFilter, selectedSubCategoryFilter, allSubCategories]);

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await subSubCategoryService.delete(id);
      toast.success("تم حذف القسم الفرعي الفرعي بنجاح");
      fetchSubSubCategories();
    } catch (error) {
      toast.error("فشل حذف القسم الفرعي الفرعي");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingItem) {
        await subSubCategoryService.update(editingItem.id, formData);
        toast.success("تم تحديث القسم الفرعي الفرعي بنجاح");
      } else {
        await subSubCategoryService.create(formData);
        toast.success("تم إضافة القسم الفرعي الفرعي بنجاح");
      }
      setIsModalOpen(false);
      fetchSubSubCategories();
    } catch (error) {
      toast.error(
        editingItem
          ? "فشل تحديث القسم الفرعي الفرعي"
          : "فشل إضافة القسم الفرعي الفرعي",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to find category and subcategory names for the table rows
  const getHierarchyNames = (subcategoryId) => {
    const sub = allSubCategories.find((s) => String(s.id) === String(subcategoryId));
    return {
      subcategoryName: sub?.name || "—",
      categoryName: sub?.category?.name || "—",
    };
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 gap-2">
        <span className="text-secondary font-medium">الأقسام الفرعية الفرعية (المستوى الثالث)</span>
      </nav>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">الأقسام الفرعية الفرعية</h1>
        <Button variant="primary" onClick={handleAdd}>
          <Plus size={20} className="ml-2" />
          إضافة قسم فرعي فرعي
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle>قائمة الأقسام الفرعية الفرعية</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-wrap">
            {/* Category Filter Dropdown */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white text-sm text-black min-w-44"
            >
              <option value="">كل الفئات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Subcategory Filter Dropdown */}
            <select
              value={selectedSubCategoryFilter}
              onChange={(e) => setSelectedSubCategoryFilter(e.target.value)}
              disabled={!selectedCategoryFilter}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white text-sm text-black min-w-44"
            >
              <option value="">كل الأقسام الفرعية</option>
              {filteredSubCategoriesForFilter.map((sub) => (
                <option key={sub.id} value={String(sub.id)}>
                  {sub.name}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث..."
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
                headers={[
                  "الصورة",
                  "الاسم",
                  "الفئة الرئيسية",
                  "القسم الفرعي",
                  "الوصف",
                  "المنتجات",
                  "تاريخ التحديث",
                  "الإجراءات",
                ]}
              >
                {filteredSubSubCategories.map((item) => {
                  const { categoryName, subcategoryName } = getHierarchyNames(item.subcategory_id);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
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
                        {item.name}
                      </TableCell>
                      <TableCell className="text-gray-950 font-semibold">
                        {categoryName}
                      </TableCell>
                      <TableCell className="text-gray-950 font-semibold">
                        {subcategoryName}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.description || "-"}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => navigate(`/sub-subcategories/${item.id}/products`)}
                          className="group inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all duration-300 border border-secondary/20 hover:border-secondary shadow-sm hover:shadow-md cursor-pointer"
                          title="عرض المنتجات"
                        >
                          <ShoppingBag
                            size={16}
                            className="group-hover:scale-110 transition-transform"
                          />
                          <span className="text-sm font-bold leading-none">
                            عرض المنتجات
                          </span>
                        </button>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const d = new Date(item.updated_at || item.created_at);
                          return isNaN(d) ? "—" : d.toLocaleDateString("ar-EG");
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 justify-end">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded cursor-pointer"
                            title="تعديل"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
              {filteredSubSubCategories.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  {searchTerm || selectedCategoryFilter || selectedSubCategoryFilter
                    ? "لا توجد نتائج تطابق خيارات التصفية والبحث"
                    : "لا توجد أقسام فرعية فرعية مضافة بعد"}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <SubSubCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingItem}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default SubSubCategories;
