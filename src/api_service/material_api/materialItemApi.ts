// types/materialItem.types.ts
import type { UserRole } from '../../features/slices/authSlice';
import { useAuthData } from '../../hooks/useAuthData';
import { Api } from '../../lib/api';
import { checkPermission } from '../../utils/utils';

export type IMaterialUnit =
    | "Bag" | "Kg" | "Ton" | "Cft" | "Cum" | "Sqft" | "Sqm"
    | "Rft" | "Nos" | "Litre" | "Load" | "Bundle" | "Roll"
    | "Box";

export type IMaterialItemStatus = "Active" | "Inactive" | "Discontinued";

export type IRateChangeDirection = "increase" | "decrease" | "no_change";

export interface PopulatedCategory {
    _id: string;
    categoryName: string;
    code?: string;
    icon?: string;
    color?: string;
}

export interface MaterialItem {
    _id: string;
    organizationId: string;
    categoryId: PopulatedCategory | string;
    productName: string;
    brand?: string;
    unit: IMaterialUnit;
    currentRate: number;
    previousRate?: number;
    rateChangePercentage: number;
    rateChangeDirection: IRateChangeDirection;
    lastRateUpdatedAt?: string;
    status: IMaterialItemStatus;
    source?: string;
    notes?: string;
    isActive: boolean;
    createdBy: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ItemFilters {
    categoryId?: string;
    status?: IMaterialItemStatus;
    search?: string;
    isActive?: string;
    // page?: number | string;
    // limit?: number | string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CreateItemInput {
    categoryId: string;
    productName: string;
    brand?: string;
    unit: IMaterialUnit;
    currentRate: number;
    status?: IMaterialItemStatus;
    source?: string;
    notes?: string;
}

export type UpdateItemInput = Partial<CreateItemInput> & { isActive?: boolean };

export interface GetAllItemsResponseData {
    items: MaterialItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}


// api_service/material_api/materialItemApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BaseApiResponse } from './materialCategoryApi';


const READ_ROLES: UserRole[] = ['owner', 'admin', 'cto', 'staff'];
const WRITE_ROLES: UserRole[] = ['owner', 'admin', 'cto'];

// --- 1. Get All Material Items Hook ---
// Route: GET /api/v1/material-items/:organizationId?page=1&limit=10...
export const useGetAllMaterialItems = (filters?: ItemFilters) => {
    const { currentRole, organizationId } = useAuthData();

    //   return useQuery({
    return useQuery<GetAllItemsResponseData>({
        queryKey: ['material-items', organizationId, filters],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");

                // Clean up undefined filter values
                const cleanParams = Object.entries(filters || {}).reduce((acc, [key, val]) => {
                    if (val !== undefined && val !== '') acc[key] = String(val);
                    return acc;
                }, {} as Record<string, string>);

                const queryString = new URLSearchParams(cleanParams).toString();
                const url = `/api/v1/material-items/${organizationId}${queryString ? `?${queryString}` : ''}`;

                const { data } = await Api.get<BaseApiResponse<GetAllItemsResponseData>>(url);

                if (data.ok) {
                    return data.data;
                }
                throw new Error(data.message || 'Failed to fetch material items');
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!currentRole && !!organizationId,
    });
};

// --- 2. Get Single Material Item Hook ---
// Route: GET /api/v1/material-items/:organizationId/:itemId
export const useGetSingleMaterialItem = (itemId: string | undefined) => {
    const { currentRole, organizationId } = useAuthData();

    return useQuery({
        queryKey: ['material-item', organizationId, itemId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");
                if (!itemId) throw new Error("Item ID is missing");

                const { data } = await Api.get<BaseApiResponse<{ item: MaterialItem }>>(
                    `/api/v1/material-items/${organizationId}/${itemId}`
                );

                if (data.ok) {
                    return data.data.item;
                }
                throw new Error(data.message || 'Failed to fetch material item details');
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!itemId && !!currentRole && !!organizationId,
    });
};

// --- 3. Create Material Item Hook ---
// Route: POST /api/v1/material-items/:organizationId
export const useCreateMaterialItem = () => {
    const { currentRole, organizationId } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateItemInput) => {
            try {
                checkPermission(currentRole, WRITE_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");

                const { data } = await Api.post<BaseApiResponse<{ item: MaterialItem }>>(
                    `/api/v1/material-items/${organizationId}`,
                    payload
                );

                if (data.ok) {
                    return data.data.item;
                }
                throw new Error(data.message || 'Material item creation failed');
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['material-items', organizationId] });
        },
    });
};

// --- 4. Update Material Item Hook ---
// Route: PATCH /api/v1/material-items/:organizationId/:itemId
export const useUpdateMaterialItem = () => {
    const { currentRole, organizationId } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ itemId, payload }: { itemId: string; payload: UpdateItemInput }) => {
            try {
                checkPermission(currentRole, WRITE_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");
                if (!itemId) throw new Error("Item ID is missing");

                const { data } = await Api.patch<BaseApiResponse<{ item: MaterialItem }>>(
                    `/api/v1/material-items/${organizationId}/${itemId}`,
                    payload
                );

                if (data.ok) {
                    return data.data.item;
                }
                throw new Error(data.message || 'Material item update failed');
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['material-items', organizationId] });
            queryClient.invalidateQueries({ queryKey: ['material-item', organizationId, variables.itemId] });
        },
    });
};

// --- 5. Delete (Soft Delete) Material Item Hook ---
// Route: DELETE /api/v1/material-items/:organizationId/:itemId
export const useDeleteMaterialItem = () => {
    const { currentRole, organizationId } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (itemId: string) => {
            try {
                checkPermission(currentRole, WRITE_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");
                if (!itemId) throw new Error("Item ID is missing");

                const { data } = await Api.delete<BaseApiResponse<{ item: MaterialItem }>>(
                    `/api/v1/material-items/${organizationId}/${itemId}`
                );

                if (data.ok) {
                    return data.data.item;
                }
                throw new Error(data.message || 'Material item deletion failed');
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['material-items', organizationId] });
        },
    });
};




//  FOR THE BACKUPS 

// --- 6. Get Inactive (Soft-Deleted) Items Hook ---
// Route: GET /api/v1/material-items/:organizationId/inactive
export const useGetInactiveMaterialItems = (categoryId?: string) => {
  const { currentRole, organizationId } = useAuthData();

  return useQuery<MaterialItem[]>({
    queryKey: ['inactive-material-items', organizationId, categoryId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, READ_ROLES);
        if (!organizationId) throw new Error("Organization ID is missing");

        const queryParams = categoryId ? `?categoryId=${categoryId}` : '';
        const { data } = await Api.get<BaseApiResponse<{ items: MaterialItem[] } | MaterialItem[]>>(
          `/api/v1/material-items/${organizationId}/inactive${queryParams}`
        );

        if (data.ok) {
          // Normalizes whether backend returns { items: [...] } or direct array [...]
          return Array.isArray(data.data) ? data.data : data.data.items;
        }
        throw new Error(data.message || 'Failed to fetch inactive material items');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!currentRole && !!organizationId,
  });
};

// --- 7. Recover Material Item Hook ---
// Route: PUT /api/v1/material-items/:organizationId/:itemId/recover
export const useRecoverMaterialItem = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error("Organization ID is missing");
        if (!itemId) throw new Error("Item ID is missing");

        const { data } = await Api.put<BaseApiResponse<{ item: MaterialItem }>>(
          `/api/v1/material-items/${organizationId}/${itemId}/recover`
        );

        if (data.ok) {
          return data;
        }
        throw new Error(data.message || 'Failed to recover material item');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inactive-material-items', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['material-items', organizationId] });
    },
  });
};

// --- 8. Hard Delete (Permanent Delete) Material Item Hook ---
// Route: DELETE /api/v1/material-items/:organizationId/:itemId/hard-delete
export const useHardDeleteMaterialItem = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error("Organization ID is missing");
        if (!itemId) throw new Error("Item ID is missing");

        const { data } = await Api.delete<BaseApiResponse<any>>(
          `/api/v1/material-items/${organizationId}/${itemId}/hard-delete`
        );

        if (data.ok) {
          return data;
        }
        throw new Error(data.message || 'Failed to permanently delete material item');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inactive-material-items', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['material-items', organizationId] });
    },
  });
};