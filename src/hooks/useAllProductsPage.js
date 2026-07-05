// RATIONALE: Logic is extracted into this custom hook to keep the AllProducts component purely UI-focused, adhering to the architecture rules.
import { useState, useCallback, useMemo, useEffect } from "react";
import { useProducts } from "./useProducts";
import { productService } from "../services/productService";
import { toast } from "react-hot-toast";

export const useAllProductsPage = () => {
  const {
    products,
    isLoadingProducts,
    categories,
    subcategories,
    subSubcategories,
    createProduct,
    updateProduct,
    deleteProduct,
    isCreating,
    isUpdating,
    refetchProducts,
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [fetchingProductId, setFetchingProductId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Search filter
  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const lastPage = useMemo(() => {
    return Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  }, [filteredProducts.length, itemsPerPage]);

  useEffect(() => {
    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }
  }, [lastPage, currentPage]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, lastPage));
  };

  // Map category path for a product
  const getProductCategoryPath = useCallback(
    (product) => {
      const subId = product.subcategory_id || product.subcategory?.id;
      if (!subId) return "-";

      const sub = subcategories.find((s) => String(s.id) === String(subId));
      if (!sub) return "-";

      const catId = sub.category_id || sub.category?.id;
      const cat = categories.find((c) => String(c.id) === String(catId));

      const subSubId = product.sub_subcategory_id || product.sub_subcategory?.id;
      const subSub = subSubcategories.find((ss) => String(ss.id) === String(subSubId));

      let path = cat ? cat.name : "";
      if (sub) {
        path += ` ➔ ${sub.name}`;
      }
      if (subSub) {
        path += ` ➔ ${subSub.name}`;
      }
      return path;
    },
    [categories, subcategories, subSubcategories]
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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
      await deleteProduct(id);
      refetchProducts();
    } catch (error) {
      // handled in mutation
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, data: formData });
        toast.success("تم تحديث المنتج بنجاح");
      } else {
        await createProduct(formData);
        toast.success("تم إضافة المنتج بنجاح");
      }
      setIsModalOpen(false);
      refetchProducts();
    } catch (error) {
      const errorMessage = error?.message || "حدث خطأ غير متوقع";
      toast.error(
        editingProduct
          ? `فشل تحديث المنتج: ${errorMessage}`
          : `فشل إضافة المنتج: ${errorMessage}`
      );
    }
  };

  return {
    searchTerm,
    handleSearch,
    filteredProducts,
    paginatedProducts,
    currentPage,
    lastPage,
    handlePrevPage,
    handleNextPage,
    isLoadingProducts,
    isModalOpen,
    setIsModalOpen,
    editingProduct,
    fetchingProductId,
    confirmDeleteId,
    setConfirmDeleteId,
    handleAdd,
    handleEdit,
    handleDelete,
    executeDelete,
    handleSubmit,
    isSubmitting: isCreating || isUpdating,
    getProductCategoryPath,
  };
};
