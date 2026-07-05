// RATIONALE: AllProducts is a UI-only component that uses useAllProductsPage to handle state, following SDD and React best practices.
import { Edit, Plus, Search, Trash2, Loader, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/common/Card";
import Table, { TableCell, TableRow } from "../components/common/Table";
import ProductModal from "../components/dashboard/ProductModal";
import ConfirmModal from "../components/common/ConfirmModal";
import Pagination from "../components/common/Pagination";
import { useAllProductsPage } from "../hooks/useAllProductsPage";

const AllProducts = () => {
  const navigate = useNavigate();
  const {
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
    isSubmitting,
    getProductCategoryPath,
  } = useAllProductsPage();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {/* RATIONALE: Arabic breadcrumbs aligned in LTR container or RTL direction matching the project standard. */}
      <nav className="flex items-center text-sm text-gray-500 gap-2 flex-wrap">
        <button
          onClick={() => navigate("/")}
          className="hover:text-secondary transition-colors font-medium cursor-pointer"
        >
          نظرة عامة
        </button>
        <ArrowRight size={14} className="rotate-180" />
        <span className="text-gray-900 font-medium">المتجر</span>
        <ArrowRight size={14} className="rotate-180" />
        <span className="text-secondary font-medium">كل المنتجات</span>
      </nav>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">كل المنتجات</h1>
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
              className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary w-full sm:w-64 text-black bg-white"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingProducts ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="animate-spin h-8 w-8 text-secondary" />
            </div>
          ) : (
            <>
              <Table
                headers={[
                  "الصورة",
                  "الاسم",
                  "التصنيف",
                  "السعر",
                  "حالة المخزون",
                  "التقييم",
                  "الإجراءات",
                ]}
              >
                {paginatedProducts.map((product) => (
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
                    <TableCell className="text-gray-500 text-sm">
                      {getProductCategoryPath(product)}
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
                    : "لا توجد منتجات حالياً"}
                </div>
              )}
              <Pagination
                currentPage={currentPage}
                lastPage={lastPage}
                onPrev={handlePrevPage}
                onNext={handleNextPage}
              />
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

export default AllProducts;
