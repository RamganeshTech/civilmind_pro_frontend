import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import type { UserRole } from '../../features/slices/authSlice';
import { Api } from '../../lib/api';

export interface BaseApiResponse<T = any> {
  ok: boolean;
  message?: string;
  data: T;
}

/**
 * Material Category entity definition
 */
export interface MaterialCategory {
  _id: string;
  organizationId: string;
  categoryName: string; // e.g. "Bricks", "Sand", "Steel", "Cement"
  code?: string;        // e.g. "BRK", "STL"
  description?: string;
  icon?: string;        // Lucide icon identifier
  color?: string;       // Hex color for chips/badges
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

/**
 * Lightweight dropdown item structure
 */
export interface MaterialCategoryDropdownItem {
  _id: string;
  name: string;
  [key: string]: any;
}

// ------------------------------------------------------------------
// Specific Endpoint Response Types
// ------------------------------------------------------------------

// Response data type for hard-delete category
export interface HardDeleteCategoryResponseData {
  deletedItemsCount?: number;
  [key: string]: any;
}

// GET /api/v1/material-category?organizationId=xxx
export type GetAllCategoriesResponse = BaseApiResponse<{
  categories: MaterialCategory[];
  total?: number;
  page?: number;
  limit?: number;
  [key: string]: any;
}>;

// GET /api/v1/material-category/:organizationId/dropdown
export type GetCategoriesDropdownResponse = BaseApiResponse<MaterialCategoryDropdownItem[]>;

// GET /api/v1/material-category/:organizationId/:categoryId
export type GetCategoryByIdResponse = BaseApiResponse<{
  category: MaterialCategory;
}>;

// POST /api/v1/material-category/:organizationId
export type CreateCategoryResponse = BaseApiResponse<{
  category: MaterialCategory;
}>;

// PATCH /api/v1/material-category/:organizationId/:categoryId
export type UpdateCategoryResponse = BaseApiResponse<{
  category: MaterialCategory;
}>;

// DELETE /api/v1/material-category/:organizationId/:categoryId
export type DeleteCategoryResponse = BaseApiResponse<{
  deletedId?: string;
  [key: string]: any;
}>;

const READ_ROLES: UserRole[]= ['owner', 'admin', 'cto', 'staff'];
const WRITE_ROLES: UserRole[] = ['owner', 'admin', 'cto'];

// --- 1. Get All Material Categories Hook ---
// Route: GET /api/v1/material-category?organizationId=xxx
export const useGetAllMaterialCategories = (queryParams?: Record<string, any>) => {
  const { currentRole, organizationId } = useAuthData();

  return useQuery({
    queryKey: ['material-categories', organizationId, queryParams],
    queryFn: async () => {
      try {
        checkPermission(currentRole, READ_ROLES);

        if (!organizationId) throw new Error("Organization ID is missing");

        // Construct query string if you have pagination/filters
        const params = new URLSearchParams({
          
          ...(queryParams || {})
        }).toString();

        const { data } = await Api.get<GetAllCategoriesResponse>(
          `/api/v1/material-category/${organizationId}?${params}`
        );

        if (data.ok) {
          return data.data; 
        }
        throw new Error(data.message || 'Failed to fetch material categories');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!currentRole && !!organizationId,
  });
};

// --- 2. Get Material Categories Dropdown Hook ---
// Route: GET /api/v1/material-category/:organizationId/dropdown
export const useGetMaterialCategoriesDropdown = () => {
  const { currentRole, organizationId } = useAuthData();

  return useQuery({
    queryKey: ['material-categories-dropdown', organizationId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, READ_ROLES);

        if (!organizationId) throw new Error("Organization ID is missing");

        const { data } = await Api.get<BaseApiResponse<any>>(
          `/api/v1/material-category/${organizationId}/dropdown`
        );

        if (data.ok) {
          return data.data;
        }
        throw new Error(data.message || 'Failed to fetch categories dropdown');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!currentRole && !!organizationId,
  });
};

// --- 3. Get Single Material Category Hook ---
// Route: GET /api/v1/material-category/:organizationId/:categoryId
export const useGetSingleMaterialCategory = (categoryId: string | undefined) => {
  const { currentRole, organizationId } = useAuthData();

  return useQuery({
    queryKey: ['material-category', organizationId, categoryId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, READ_ROLES);

        if (!organizationId) throw new Error("Organization ID is missing");
        if (!categoryId) throw new Error("Category ID is missing");

        const { data } = await Api.get<BaseApiResponse<any>>(
          `/api/v1/material-category/${organizationId}/${categoryId}`
        );

        if (data.ok) {
          return data.data;
        }
        throw new Error(data.message || 'Failed to fetch category details');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!categoryId && !!currentRole && !!organizationId,
  });
};

// --- 4. Create Material Category Hook ---
// Route: POST /api/v1/material-category/:organizationId
export const useCreateMaterialCategory = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);

        if (!organizationId) throw new Error("Organization ID is missing");

        const { data } = await Api.post<BaseApiResponse<any>>(
          `/api/v1/material-category/${organizationId}`,
          payload
        );

        if (data.ok) {
          return data;
        }
        throw new Error(data.message || 'Category creation failed');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      // Invalidate both the main list and the dropdown list
      queryClient.invalidateQueries({ queryKey: ['material-categories', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['material-categories-dropdown', organizationId] });
    },
  });
};

// --- 5. Update Material Category Hook ---
// Route: PATCH /api/v1/material-category/:organizationId/:categoryId
export const useUpdateMaterialCategory = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, payload }: { categoryId: string; payload: Record<string, any> }) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);

        if (!organizationId) throw new Error("Organization ID is missing");
        if (!categoryId) throw new Error("Category ID is missing");

        const { data } = await Api.patch<BaseApiResponse<any>>(
          `/api/v1/material-category/${organizationId}/${categoryId}`,
          payload
        );

        if (data.ok) {
          return data;
        }
        throw new Error(data.message || 'Category update failed');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['material-categories', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['material-categories-dropdown', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['material-category', organizationId, variables.categoryId] });
    },
  });
};

// --- 6. Delete Material Category Hook ---
// Route: DELETE /api/v1/material-category/:organizationId/:categoryId
export const useDeleteMaterialCategory = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);

        if (!organizationId) throw new Error("Organization ID is missing");
        if (!categoryId) throw new Error("Category ID is missing");

        const { data } = await Api.delete<BaseApiResponse<any>>(
          `/api/v1/material-category/${organizationId}/${categoryId}`
        );

        if (data.ok) {
          return data;
        }
        throw new Error(data.message || 'Category deletion failed');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-categories', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['material-categories-dropdown', organizationId] });
    },
  });
};



//  FOR BACKUP FILES

// --- 7. Get Inactive (Soft-Deleted) Categories Hook ---
// Route: GET /api/v1/material-category/:organizationId/inactive
export const useGetInactiveMaterialCategories = () => {
  const { currentRole, organizationId } = useAuthData();

  return useQuery<MaterialCategory[]>({
    queryKey: ['inactive-material-categories', organizationId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, READ_ROLES);

        if (!organizationId) throw new Error("Organization ID is missing");

        const { data } = await Api.get<BaseApiResponse<MaterialCategory[]>>(
          `/api/v1/material-category/${organizationId}/inactive`
        );

        if (data.ok) {
          return data.data;
        }
        throw new Error(data.message || 'Failed to fetch inactive categories');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!currentRole && !!organizationId,
  });
};

// --- 8. Recover Category Hook ---
// Route: PUT /api/v1/material-category/:organizationId/:categoryId/recover
export const useRecoverMaterialCategory = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);

        if (!organizationId) throw new Error("Organization ID is missing");
        if (!categoryId) throw new Error("Category ID is missing");

        const { data } = await Api.put<BaseApiResponse<any>>(
          `/api/v1/material-category/${organizationId}/${categoryId}/recover`
        );

        if (data.ok) {
          return data;
        }
        throw new Error(data.message || 'Failed to recover category');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      // Invalidate active list, dropdown, and inactive backup list
      queryClient.invalidateQueries({ queryKey: ['inactive-material-categories', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['material-categories', organizationId] });
      // queryClient.invalidateQueries({ queryKey: ['material-categories-dropdown', organizationId] });
    },
  });
};

// --- 9. Hard Delete (Permanent Delete) Category Hook ---
// Route: DELETE /api/v1/material-category/:organizationId/:categoryId/hard-delete
export const useHardDeleteMaterialCategory = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);

        if (!organizationId) throw new Error("Organization ID is missing");
        if (!categoryId) throw new Error("Category ID is missing");

        const { data } = await Api.delete<BaseApiResponse<HardDeleteCategoryResponseData>>(
          `/api/v1/material-category/${organizationId}/${categoryId}/hard-delete`
        );

        if (data.ok) {
          return data;
        }
        throw new Error(data.message || 'Failed to permanently delete category');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      // Invalidate inactive backup list and material items
      queryClient.invalidateQueries({ queryKey: ['inactive-material-categories', organizationId] });
      // queryClient.invalidateQueries({ queryKey: ['material-items', organizationId] });
    },
  });
};