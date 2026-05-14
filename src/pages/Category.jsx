import { Edit, Plus, Search, Trash2, Loader, FolderOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import Button from "../components/common/Button";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/common/Card";
import Table, { TableCell, TableRow } from "../components/common/Table";
import CategoryModal from "../components/dashboard/CategoryModal";
import { categoryService } from "../services/categoryService";

const Category = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll();
      setCategories(response.data || []);
    } catch (error) {
      toast.error("فشل تحميل الفئات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await categoryService.delete(id);
      toast.success("تم حذف الفئة بنجاح");
      fetchCategories(); // Refresh list
    } catch (error) {
      toast.error("فشل حذف الفئة");
      console.error(error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        toast.success("تم تحديث الفئة بنجاح");
      } else {
        await categoryService.create(formData);
        toast.success("تم إضافة الفئة بنجاح");
      }
      setIsModalOpen(false);
      fetchCategories(); // Refresh list
    } catch (error) {
      toast.error(editingCategory ? "فشل تحديث الفئة" : "فشل إضافة الفئة");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-text-black">الفئات</h1>
        <Button variant="primary" onClick={handleAdd}>
          <Plus size={20} className="ml-2" />
          إضافة فئة
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle>قائمة الفئات</CardTitle>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-gray" />
            <input
              type="text"
              placeholder="بحث عن الفئات..."
              className="pr-10 pl-4 py-2 border border-light-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 w-full sm:w-64"
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
                  "الأقسام الفرعية",
                  "تاريخ التحديث",
                  "الإجراءات",
                ]}
              >
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-light-beige/50">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-light-gray">
                            No Img
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-text-black">
                      {category.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {category.description || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-2 space-x-reverse">
                        <button
                          onClick={() =>
                            navigate(`/category/${category.id}/subcategories`)
                          }
                          className="group inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all duration-300 border border-secondary/20 hover:border-secondary shadow-sm hover:shadow-md cursor-pointer"
                          title="عرض الأقسام الفرعية"
                        >
                          <FolderOpen
                            size={16}
                            className="group-hover:scale-110 transition-transform"
                          />
                          <span className="text-sm font-bold leading-none">
                            {category.subcategories_count || 0}
                          </span>
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(
                        category.updated_at || category.created_at,
                      ).toLocaleDateString("ar-EG")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                          title="تعديل"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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
              {filteredCategories.length === 0 && (
                <div className="text-center py-10 text-dark-gray">
                  لا توجد فئات تطابق "{searchTerm}"
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingCategory}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Category;
