// hooks/useLabourCategory.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '../../hooks/useAuthData';
import type { BaseApiResponse } from '../material_api/materialCategoryApi';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';
import type { UserRole } from '../../features/slices/authSlice';

// Roles based on your Express router
const READ_ROLES: UserRole[] = ['owner', 'admin', 'cto', 'staff'];
const WRITE_ROLES: UserRole[] = ['owner', 'admin', 'cto'];

// --- 1. Get All Active Labour Categories ---
// Route: GET /api/v1/labour-category/:organizationId
export const useGetAllLabourCategories = (queryParams?: Record<string, any>) => {
    const { currentRole, organizationId } = useAuthData();

    return useQuery({
        queryKey: ['labour-categories', 'active', organizationId, queryParams],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");

                const params = new URLSearchParams(queryParams || {}).toString();
                const url = `/api/v1/labour-category/${organizationId}${params ? `?${params}` : ''}`;

                const { data } = await Api.get<BaseApiResponse<any>>(url);

                if (data.ok) return data.data;
                throw new Error(data.message || 'Failed to fetch labour categories');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!currentRole && !!organizationId,
    });
};

// --- 2. Get Labour Categories Dropdown ---
// Route: GET /api/v1/labour-category/:organizationId/dropdown
export const useGetLabourCategoriesDropdown = () => {
    const { currentRole, organizationId } = useAuthData();

    return useQuery({
        queryKey: ['labour-categories', 'dropdown', organizationId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");

                const { data } = await Api.get<BaseApiResponse<any>>(
                    `/api/v1/labour-category/${organizationId}/dropdown`
                );

                if (data.ok) return data.data;
                throw new Error(data.message || 'Failed to fetch categories dropdown');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!currentRole && !!organizationId,
    });
};

// --- 4. Get Single Labour Category ---
// Route: GET /api/v1/labour-category/:organizationId/:categoryId
export const useGetSingleLabourCategory = (categoryId: string | undefined) => {
    const { currentRole, organizationId } = useAuthData();

    return useQuery({
        queryKey: ['labour-category', 'single', organizationId, categoryId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");
                if (!categoryId) throw new Error("Category ID is missing");

                const { data } = await Api.get<BaseApiResponse<any>>(
                    `/api/v1/labour-category/${organizationId}/${categoryId}`
                );

                if (data.ok) return data.data;
                throw new Error(data.message || 'Failed to fetch category details');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!categoryId && !!currentRole && !!organizationId,
    });
};

// --- 5. Create Labour Category ---
// Route: POST /api/v1/labour-category/:organizationId
export const useCreateLabourCategory = () => {
    const { currentRole, organizationId } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { categoryName: string;[key: string]: any }) => {
            try {
                checkPermission(currentRole, WRITE_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");

                const { data } = await Api.post<BaseApiResponse<any>>(
                    `/api/v1/labour-category/${organizationId}`,
                    payload
                );

                if (data.ok) return data;
                throw new Error(data.message || 'Category creation failed');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            // Invalidate the active list and dropdown so the new category appears instantly
            queryClient.invalidateQueries({ queryKey: ['labour-categories', 'active', organizationId] });
            queryClient.invalidateQueries({ queryKey: ['labour-categories', 'dropdown', organizationId] });
        },
    });
};

// --- 6. Update Labour Category ---
// Route: PATCH /api/v1/labour-category/:organizationId/:categoryId
export const useUpdateLabourCategory = () => {
    const { currentRole, organizationId } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ categoryId, payload }: { categoryId: string; payload: Record<string, any> }) => {
            try {
                checkPermission(currentRole, WRITE_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");
                if (!categoryId) throw new Error("Category ID is missing");

                const { data } = await Api.patch<BaseApiResponse<any>>(
                    `/api/v1/labour-category/${organizationId}/${categoryId}`,
                    payload
                );

                if (data.ok) return data;
                throw new Error(data.message || 'Category update failed');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['labour-categories', 'active', organizationId] });
            queryClient.invalidateQueries({ queryKey: ['labour-categories', 'dropdown', organizationId] });
            queryClient.invalidateQueries({ queryKey: ['labour-category', 'single', organizationId, variables.categoryId] });
        },
    });
};

// --- 7. Delete Labour Category (Soft Delete) ---
// Route: DELETE /api/v1/labour-category/:organizationId/:categoryId
export const useDeleteLabourCategory = () => {
    const { currentRole, organizationId } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (categoryId: string) => {
            try {
                checkPermission(currentRole, WRITE_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");
                if (!categoryId) throw new Error("Category ID is missing");

                const { data } = await Api.delete<BaseApiResponse<any>>(
                    `/api/v1/labour-category/${organizationId}/${categoryId}`
                );

                if (data.ok) return data;
                throw new Error(data.message || 'Category deletion failed');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            // Refresh both active and inactive lists since the item moved between them
            queryClient.invalidateQueries({ queryKey: ['labour-categories', 'active', organizationId] });
            queryClient.invalidateQueries({ queryKey: ['labour-categories', 'dropdown', organizationId] });
            queryClient.invalidateQueries({ queryKey: ['labour-categories', 'inactive', organizationId] });
        },
    });
};

// --- 8. Recover Labour Category ---
// Route: PATCH /api/v1/labour-category/:organizationId/:categoryId/recover
export const useRecoverLabourCategory = () => {
    const { currentRole, organizationId } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (categoryId: string) => {
            try {
                checkPermission(currentRole, WRITE_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");
                if (!categoryId) throw new Error("Category ID is missing");

                const { data } = await Api.patch<BaseApiResponse<any>>(
                    `/api/v1/labour-category/${organizationId}/${categoryId}/recover`,
                    {}
                );

                if (data.ok) return data;
                throw new Error(data.message || 'Category recovery failed');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labour-categories', 'active', organizationId] });
            queryClient.invalidateQueries({ queryKey: ['labour-categories', 'dropdown', organizationId] });
            queryClient.invalidateQueries({ queryKey: ['labour-categories', 'inactive', organizationId] });
        },
    });
};

// --- 9. Hard Delete Labour Category ---
// Route: DELETE /api/v1/labour-category/:organizationId/:categoryId/force
export const useHardDeleteLabourCategory = () => {
    const { currentRole, organizationId } = useAuthData();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (categoryId: string) => {
            try {
                checkPermission(currentRole, WRITE_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");
                if (!categoryId) throw new Error("Category ID is missing");

                const { data } = await Api.delete<BaseApiResponse<any>>(
                    `/api/v1/labour-category/${organizationId}/${categoryId}/force`
                );

                if (data.ok) return data;
                throw new Error(data.message || 'Category hard deletion failed');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labour-categories', 'inactive', organizationId] });
        },
    });
};



// --- 3. Get Inactive Labour Categories ---
// Route: GET /api/v1/labour-category/:organizationId/inactive
export const useGetInactiveLabourCategories = () => {
    const { currentRole, organizationId } = useAuthData();

    return useQuery({
        queryKey: ['labour-categories', 'inactive', organizationId],
        queryFn: async () => {
            try {
                checkPermission(currentRole, READ_ROLES);
                if (!organizationId) throw new Error("Organization ID is missing");

                const { data } = await Api.get<BaseApiResponse<any>>(
                    `/api/v1/labour-category/${organizationId}/inactive`
                );

                if (data.ok) return data.data;
                throw new Error(data.message || 'Failed to fetch inactive categories');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
                throw new Error(errorMessage, { cause: error });
            }
        },
        enabled: !!currentRole && !!organizationId,
    });
};
