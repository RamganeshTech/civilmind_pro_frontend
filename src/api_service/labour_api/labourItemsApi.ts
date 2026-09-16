// hooks/useLabourItem.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import type { BaseApiResponse } from '../material_api/materialCategoryApi';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';
import type { UserRole } from '../../features/slices/authSlice';


const READ_ROLES: UserRole[] = ['owner', 'admin', 'cto', 'staff'];
const WRITE_ROLES: UserRole[] = ['owner', 'admin', 'cto'];

// --- 1. Get All Active Labour Items ---
// Route: GET /api/v1/labour-items/:organizationId?categoryId=...&search=...
export const useGetAllLabourItems = (filters?: Record<string, any>) => {
  const { currentRole, organizationId } = useAuthData();

  return useQuery({
    queryKey: ['labour-items', 'active', organizationId, filters],
    queryFn: async () => {
      try {
        checkPermission(currentRole, READ_ROLES);
        if (!organizationId) throw new Error("Organization ID is missing");

        // Clean up undefined filter values to build a clean query string
        const cleanParams = Object.entries(filters || {}).reduce((acc, [key, val]) => {
          if (val !== undefined && val !== '') acc[key] = String(val);
          return acc;
        }, {} as Record<string, string>);

        const queryString = new URLSearchParams(cleanParams).toString();
        const url = `/api/v1/labour-items/${organizationId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await Api.get<BaseApiResponse<any>>(url);

        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to fetch labour items');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!currentRole && !!organizationId,
  });
};

// --- 3. Get Single Labour Item ---
// Route: GET /api/v1/labour-items/:organizationId/:itemId
export const useGetSingleLabourItem = (itemId: string | undefined) => {
  const { currentRole, organizationId } = useAuthData();

  return useQuery({
    queryKey: ['labour-item', 'single', organizationId, itemId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, READ_ROLES);
        if (!organizationId) throw new Error("Organization ID is missing");
        if (!itemId) throw new Error("Item ID is missing");

        const { data } = await Api.get<BaseApiResponse<any>>(
          `/api/v1/labour-items/${organizationId}/${itemId}`
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to fetch labour item details');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!itemId && !!currentRole && !!organizationId,
  });
};

// --- 4. Create Labour Item ---
// Route: POST /api/v1/labour-items/:organizationId
export const useCreateLabourItem = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { 
      categoryId: string; 
      role: string; 
      skillLevel: string; 
      rate: number; 
      halfDayRate: number; 
      otPerHour: number; 
      [key: string]: any 
    }) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error("Organization ID is missing");

        const { data } = await Api.post<BaseApiResponse<any>>(
          `/api/v1/labour-items/${organizationId}`,
          payload
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Labour item creation failed');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-items', 'active', organizationId] });
    },
  });
};

// --- 5. Update Labour Item ---
// Route: PATCH /api/v1/labour-items/:organizationId/:itemId
export const useUpdateLabourItem = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, payload }: { itemId: string; payload: Record<string, any> }) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error("Organization ID is missing");
        if (!itemId) throw new Error("Item ID is missing");

        const { data } = await Api.patch<BaseApiResponse<any>>(
          `/api/v1/labour-items/${organizationId}/${itemId}`,
          payload
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Labour item update failed');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['labour-items', 'active', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['labour-items', 'inactive', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['labour-item', 'single', organizationId, variables.itemId] });
    },
  });
};

// --- 6. Delete Labour Item (Soft Delete) ---
// Route: DELETE /api/v1/labour-items/:organizationId/:itemId
export const useDeleteLabourItem = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error("Organization ID is missing");
        if (!itemId) throw new Error("Item ID is missing");

        const { data } = await Api.delete<BaseApiResponse<any>>(
          `/api/v1/labour-items/${organizationId}/${itemId}`
        );

        if (data.ok) return data;
        throw new Error(data.message || 'Labour item deletion failed');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-items', 'active', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['labour-items', 'inactive', organizationId] });
    },
  });
};

// --- 7. Hard Delete Labour Item ---
// Route: DELETE /api/v1/labour-items/:organizationId/:itemId/force
export const useHardDeleteLabourItem = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error("Organization ID is missing");
        if (!itemId) throw new Error("Item ID is missing");

        const { data } = await Api.delete<BaseApiResponse<any>>(
          `/api/v1/labour-items/${organizationId}/${itemId}/force`
        );

        if (data.ok) return data;
        throw new Error(data.message || 'Labour item hard deletion failed');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-items', 'inactive', organizationId] });
    },
  });
};

// --- 8. Recover Single Labour Item ---
// Route: PATCH /api/v1/labour-items/:organizationId/:itemId/recover
export const useRecoverSingleLabourItem = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error("Organization ID is missing");
        if (!itemId) throw new Error("Item ID is missing");

        const { data } = await Api.patch<BaseApiResponse<any>>(
          `/api/v1/labour-items/${organizationId}/${itemId}/recover`,
          {}
        );

        if (data.ok) return data;
        throw new Error(data.message || 'Labour item recovery failed');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-items', 'active', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['labour-items', 'inactive', organizationId] });
    },
  });
};

// --- 9. Bulk Recover Labour Items ---
// Route: PATCH /api/v1/labour-items/:organizationId/recover
export const useBulkRecoverLabourItems = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { itemIds?: string[]; refNos?: string[]; fromDate?: string; toDate?: string; }) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error("Organization ID is missing");

        const { data } = await Api.patch<BaseApiResponse<any>>(
          `/api/v1/labour-items/${organizationId}/recover`,
          payload
        );

        if (data.ok) return data;
        throw new Error(data.message || 'Bulk labour item recovery failed');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-items', 'active', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['labour-items', 'inactive', organizationId] });
    },
  });
};


// --- 2. Get Inactive Labour Items ---
// Route: GET /api/v1/labour-items/:organizationId/inactive
export const useGetInactiveLabourItems = () => {
  const { currentRole, organizationId } = useAuthData();

  return useQuery({
    queryKey: ['labour-items', 'inactive', organizationId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, READ_ROLES);
        if (!organizationId) throw new Error("Organization ID is missing");

        const { data } = await Api.get<BaseApiResponse<any>>(
          `/api/v1/labour-items/${organizationId}/inactive`
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to fetch inactive items');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!currentRole && !!organizationId,
  });
};
