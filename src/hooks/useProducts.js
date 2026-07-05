// RATIONALE: We define useProducts as a custom hook to centralize server state queries and mutations for products, categories, and their sub-hierarchies, aligning with the Spec-Driven Development architecture.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { subCategoryService } from "../services/subCategoryService";
import { subSubCategoryService } from "../services/subSubCategoryService";
import toast from "react-hot-toast";

export const useProducts = (subcategoryId = null, categoryId = null, subSubcategoryId = null) => {
  const queryClient = useQueryClient();

  // Fetch all products
  const productsQuery = useQuery({
    queryKey: ["products", { subcategoryId, categoryId, subSubcategoryId }],
    queryFn: () => productService.getAll(subcategoryId, categoryId, subSubcategoryId),
    select: (res) => res.data?.data || res.data || [],
  });

  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
    select: (res) => res.data || [],
  });

  // Fetch subcategories
  const subcategoriesQuery = useQuery({
    queryKey: ["subcategories"],
    queryFn: () => subCategoryService.getAll(),
    select: (res) => res.data || [],
  });

  // Fetch sub-subcategories
  const subSubcategoriesQuery = useQuery({
    queryKey: ["sub-subcategories"],
    queryFn: subSubCategoryService.getAll,
    select: (res) => res.data || [],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("تم حذف المنتج بنجاح");
    },
    onError: (error) => {
      const errorMsg = error?.message || "فشل حذف المنتج";
      toast.error(errorMsg);
    },
  });

  return {
    products: productsQuery.data || [],
    isLoadingProducts: productsQuery.isLoading,
    isRefetchingProducts: productsQuery.isRefetching,
    refetchProducts: productsQuery.refetch,
    categories: categoriesQuery.data || [],
    subcategories: subcategoriesQuery.data || [],
    subSubcategories: subSubcategoriesQuery.data || [],
    isLoadingHierarchy:
      categoriesQuery.isLoading ||
      subcategoriesQuery.isLoading ||
      subSubcategoriesQuery.isLoading,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
