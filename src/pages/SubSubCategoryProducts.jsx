import { Edit, Plus, Search, Trash2, Loader, ArrowRight } from "lucide-react";
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
import ProductModal from "../components/dashboard/ProductModal";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { subCategoryService } from "../services/subCategoryService";
import { subSubCategoryService } from "../services/subSubCategoryService";
import ConfirmModal from "../components/common/ConfirmModal";
import axiosInstance from "../services/axiosInstance";

const SubSubCategoryProducts = () => {
  const { subSubCategoryId } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  
  // Hierarchy state for breadcrumbs
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [subSubCategory, setSubSubCategory] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingProductId, setFetchingProductId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Fetch product hierarchy and products
  const fetchHierarchyAndProducts = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch products belonging to this sub-subcategory
      const productsRes = await productService.getAll(null, null, subSubCategoryId);
      const productsList = productsRes.data?.data || productsRes.data || [];
      setProducts(Array.isArray(productsList) ? productsList : []);

      // 2. Fetch all sub-subcategories to find details of the current one
      const subSubsRes = await subSubCategoryService.getAll();
      const subSubsList = subSubsRes.data?.data || subSubsRes.data || [];
      const currentSubSub = subSubsList.find((item) => String(item.id) === String(subSubCategoryId));
      
      if (currentSubSub) {
        setSubSubCategory(currentSubSub);

        // 3. Load subcategory to find parent category ID
        const subsRes = await axiosInstance.get("/subcategories");
        const subsList = subsRes.data?.data || subsRes.data || [];
        const currentSub = subsList.find((s) => String(s.id) === String(currentSubSub.subcategory_id));
        
        if (currentSub) {
          setSubCategory(currentSub);
          
          // 4. Load category details
          const catId = currentSub.category_id || currentSub.category?.id;
          if (catId) {
            const catRes = await categoryService.getById(catId);
            setCategory(catRes.data || catRes);
          }
        }
      }
    } catch (error) {
      toast.error("فشل تحميل البيانات الهيكلية أو المنتجات");
    } finally {
      setLoading(false);
    }
  }, [subSubCategoryId]);

  useEffect(() => {
    if (subSubCategoryId) {
      fetchHierarchyAndProducts();
    }
  }, [subSubCategoryId, fetchHierarchyAndProducts]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (product) => {
    try {
      setFetchingProductId(product.id);
      const response = await productService.getById(product.id);
      const fullProduct = response.data || response;
      setEditingProduct(fullProduct);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("فشل تحميل بيانات المنتج");
    } finally {
      setFetchingProductId(null);
    }
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await productService.delete(id);
      toast.success("تم حذف المنتج بنجاح");
      fetchHierarchyAndProducts();
    } catch (error) {
      const errorMsg = error?.message || "فشل حذف المنتج";
      toast.error(errorMsg);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingProduct) {
        // Update product with both subcategory_id and sub_subcategory_id
        await productService.update(editingProduct.id, {
          ...formData,
          subcategory_id: subCategory?.id,
          sub_subcategory_id: subSubCategoryId,
        });
        toast.success("تم تحديث المنتج بنجاح");
      } else {
        // Create product with both subcategory_id and sub_subcategory_id
        await productService.create({
          ...formData,
          subcategory_id: subCategory?.id,
          sub_subcategory_id: subSubCategoryId,
        });
        toast.success("تم إضافة المنتج بنجاح");
      }
      setIsModalOpen(false);
      fetchHierarchyAndProducts();
    } catch (error) {
      const errorMessage = error?.message || "حدث خطأ غير متوقع";
      toast.error(
        editingProduct
          ? `فشل تحديث المنتج: ${errorMessage}`
          : `فشل إضافة المنتج: ${errorMessage}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 gap-2 flex-wrap">
        <button
          onClick={() => navigate("/category")}
          className="hover:text-secondary transition-colors font-medium cursor-pointer"
        >
          الفئات
        </button>
        <ArrowRight size={14} className="rotate-180" />
        <button
          onClick={() => navigate(`/category/${category?.id}/subcategories`)}
          className="hover:text-secondary transition-colors font-medium cursor-pointer"
        >
          {category?.name || "..."}
        </button>
        <ArrowRight size={14} className="rotate-180" />
        <button
          onClick={() => navigate(`/sub-subcategories`)}
          className="hover:text-secondary transition-colors font-medium cursor-pointer"
        >
          {subCategory?.name || "..."}
        </button>
        <ArrowRight size={14} className="rotate-180" />
        <span className="text-gray-900 font-medium">
          {subSubCategory?.name || "..."}
        </span>
        <ArrowRight size={14} className="rotate-180" />
        <span className="text-secondary font-medium">المنتجات</span>
      </nav>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          منتجات - {subSubCategory?.name || ""}
        </h1>
        <Button variant="primary" onClick={handleAdd}>
          <Plus size={20} className="ml-2" />
          إضافة منتج
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle>قائمة المنتجات</CardTitle>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن المنتجات..."
              className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary w-full sm:w-64 text-black"
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
                  "السعر",
                  "حالة المخزون",
                  "التقييم",
                  "الإجراءات",
                ]}
              >
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                        {product?.main_image ? (
                          <img
                            src={product.main_image}
                            alt={product.name}
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
                      {product.name}
                    </TableCell>
                    <TableCell>
                      {product.price
                        ? `${Number(product.price).toLocaleString("ar-EG")} ر.س`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock_status === "in_stock"
                            ? "bg-green-100 text-green-700"
                            : product.stock_status === "out_of_stock"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {product.stock_status === "in_stock"
                          ? "متوفر"
                          : product.stock_status === "out_of_stock"
                            ? "نفذ"
                            : (product.stock_status ?? "-")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.average_rating > 0 ? (
                        <span className="flex items-center gap-1 text-secondary font-medium">
                          ★ {Number(product.average_rating).toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">لا يوجد</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleEdit(product)}
                          disabled={fetchingProductId === product.id}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded disabled:opacity-50 cursor-pointer"
                          title="تعديل"
                        >
                          {fetchingProductId === product.id ? (
                            <Loader size={18} className="animate-spin" />
                          ) : (
                            <Edit size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  {searchTerm
                    ? `لا توجد منتجات تطابق "${searchTerm}"`
                    : "لا توجد منتجات في هذا القسم الفرعي الفرعي"}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <ProductModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          initialData={editingProduct}
          isLoading={isSubmitting}
          subcategoryId={subCategory?.id}
          subSubcategoryId={subSubCategoryId}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <ConfirmModal
          title="حذف المنتج"
          message="هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
          confirmLabel="حذف"
          cancelLabel="إلغاء"
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={executeDelete}
          danger
        />
      )}
    </div>
  );
};

export default SubSubCategoryProducts;
