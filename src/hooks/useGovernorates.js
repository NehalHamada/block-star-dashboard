import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import governorateService from "../services/governorateService";
import toast from "react-hot-toast";

export const useGovernorates = () => {
  const queryClient = useQueryClient();

  // Fetch all governorates
  const governoratesQuery = useQuery({
    queryKey: ["governorates"],
    queryFn: governorateService.getAll,
    select: (res) => res.data || [],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => governorateService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governorates"] });
      toast.success("تمت إضافة المنطقة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة المنطقة");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => governorateService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governorates"] });
      toast.success("تم تحديث المنطقة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث المنطقة");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => governorateService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governorates"] });
      toast.success("تم حذف المنطقة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف المنطقة");
    },
  });

  return {
    governorates: governoratesQuery.data,
    isLoading: governoratesQuery.isLoading,
    isError: governoratesQuery.isError,
    error: governoratesQuery.error,
    createGovernorate: createMutation.mutateAsync,
    updateGovernorate: updateMutation.mutateAsync,
    deleteGovernorate: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
