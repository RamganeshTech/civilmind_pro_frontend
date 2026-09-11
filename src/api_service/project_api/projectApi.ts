// import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
// import { useAuthData } from "../../hooks/useAuthData";
// import { checkPermission } from "../../utils/utils";
// import { Api } from "../../lib/api";

// // --- Interfaces ---
// export interface BaseApiResponse<T> {
//   ok: boolean;
//   data: T;
//   message?: string;
// }

// export interface IProjectFilters {
//   projectType?: string;
//   status?: string;
//   currentStage?: string;
//   basement?: string;
//   facingDirection?: string;
//   siteEngineerId?: string;
//   clientName?: string;
//   search?: string;
//   startDateFrom?: string;
//   startDateTo?: string;
//   isActive?: string;
//   page?: string;
//   limit?: string;
//   sortBy?: string;
//   sortOrder?: string;
// }

// export interface ProjectsListResponse {
//   projects: any[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

// export interface UpdateProjectParams {
//   projectId: string;
//   data: Record<string, any>;
// }

// // // --- 1. Get All Projects Hook ---
// // export const useGetAllProjects = (filters: IProjectFilters = {}) => {
// //   const { currentRole } = useAuthData();

// //   return useQuery({
// //     queryKey: ['all-projects', filters],
// //     queryFn: async () => {
// //       try {
// //         checkPermission(currentRole, ['owner', 'admin', 'cto', 'staff']);

// //         const { data } = await Api.get<BaseApiResponse<ProjectsListResponse>>(
// //           '/api/v1/projects',
// //           { params: filters }
// //         );

// //         if (data.ok) {
// //           return data.data;
// //         }
// //         throw new Error(data.message || 'Failed to fetch projects');
// //       } catch (error: any) {
// //         const errorMessage =
// //           error.response?.data?.message || error.message || 'An unexpected error occurred';
// //         throw new Error(errorMessage, { cause: error });
// //       }
// //     },
// //     enabled: !!currentRole,
// //   });
// // };

// // --- 1. Get All Projects (Infinite Scroll) ---
// export const useInfiniteProjects = (filters: IProjectFilters = {}) => {
//   const { currentRole } = useAuthData();

//   return useInfiniteQuery({
//     queryKey: ['all-projects', filters],
//     initialPageParam: 1,
//     queryFn: async ({ pageParam = 1 }) => {
//       try {
//         checkPermission(currentRole, ['owner', 'admin', 'cto', 'staff']);

//         const { data } = await Api.get<BaseApiResponse<ProjectsListResponse>>(
//           '/api/v1/projects',
//           { params: { ...filters, page: pageParam } }
//         );

//         if (data.ok) {
//           return data.data; // returns { projects, total, page, limit, totalPages }
//         }
//         throw new Error(data.message || 'Failed to fetch projects');
//       } catch (error: any) {
//         const errorMessage =
//           error.response?.data?.message || error.message || 'An unexpected error occurred';
//         throw new Error(errorMessage, { cause: error });
//       }
//     },
//     getNextPageParam: (lastPage) => {
//       // If the current page is less than the total pages, return the next page number
//       if (lastPage.page < lastPage.totalPages) {
//         return lastPage.page + 1;
//       }
//       return undefined; // No more pages to fetch
//     },
//     enabled: !!currentRole,
//   });
// };

// // --- 2. Get Single Project Hook ---
// export const useGetSingleProject = (projectId: string | undefined) => {
//   const { currentRole } = useAuthData();

//   return useQuery({
//     queryKey: ['project', projectId],
//     queryFn: async () => {
//       try {
//         checkPermission(currentRole, ['owner', 'admin', 'cto', 'staff']);

//         const { data } = await Api.get<BaseApiResponse<{ project: any }>>(
//           `/api/v1/projects/${projectId}`
//         );

//         if (data.ok) {
//           return data.data.project;
//         }
//         throw new Error(data.message || 'Failed to fetch project details');
//       } catch (error: any) {
//         const errorMessage =
//           error.response?.data?.message || error.message || 'An unexpected error occurred';
//         throw new Error(errorMessage, { cause: error });
//       }
//     },
//     enabled: !!projectId && !!currentRole,
//   });
// };

// // --- 3. Create Project Hook ---
// export const useCreateProject = () => {
//   const { currentRole } = useAuthData();
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (payload: Record<string, any>) => {
//       try {
//         checkPermission(currentRole, ['owner', 'admin', 'cto']);

//         const { data } = await Api.post<BaseApiResponse<{ project: any }>>(
//           '/api/v1/projects',
//           payload
//         );

//         if (data.ok) {
//           return data;
//         }
//         throw new Error(data.message || 'Project creation failed');
//       } catch (error: any) {
//         const errorMessage =
//           error.response?.data?.message || error.message || 'An unexpected error occurred';
//         throw new Error(errorMessage, { cause: error });
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['all-projects'] });
//     },
//   });
// };

// // --- 4. Update Project Hook ---
// export const useUpdateProject = () => {
//   const { currentRole } = useAuthData();
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ projectId, data: updateData }: UpdateProjectParams) => {
//       try {
//         checkPermission(currentRole, ['owner', 'admin', 'cto']);

//         const { data } = await Api.patch<BaseApiResponse<{ project: any }>>(
//           `/api/v1/projects/${projectId}`,
//           updateData
//         );

//         if (data.ok) {
//           return data;
//         }
//         throw new Error(data.message || 'Project update failed');
//       } catch (error: any) {
//         const errorMessage =
//           error.response?.data?.message || error.message || 'An unexpected error occurred';
//         throw new Error(errorMessage, { cause: error });
//       }
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
//       queryClient.invalidateQueries({ queryKey: ['all-projects'] });
//     },
//   });
// };

// // --- 5. Delete Project Hook ---
// export const useDeleteProject = () => {
//   const { currentRole } = useAuthData();
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (projectId: string) => {
//       try {
//         checkPermission(currentRole, ['owner', 'admin', 'cto']);

//         const { data } = await Api.delete<BaseApiResponse<{ project: any }>>(
//           `/api/v1/projects/${projectId}`
//         );

//         if (data.ok) {
//           return data;
//         }
//         throw new Error(data.message || 'Project deletion failed');
//       } catch (error: any) {
//         const errorMessage =
//           error.response?.data?.message || error.message || 'An unexpected error occurred';
//         throw new Error(errorMessage, { cause: error });
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['all-projects'] });
//     },
//   });
// };



import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useAuthData } from "../../hooks/useAuthData";
import { checkPermission } from "../../utils/utils";
import { Api } from "../../lib/api";

// --- Interfaces ---
export interface BaseApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}

export interface IProjectFilters {
  projectType?: string;
  status?: string;
  currentStage?: string;
  basement?: string;
  facingDirection?: string;
  siteEngineerId?: string;
  clientName?: string;
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
  isActive?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface ProjectsListResponse {
  projects: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateProjectParams {
  projectId: string;
  data: Record<string, any>;
}

// --- 1. Get All Projects (Infinite Scroll) ---
export const useInfiniteProjects = (filters: IProjectFilters = {}) => {
  // Extract organizationId from your auth state
  const { currentRole, organizationId } = useAuthData();

  return useInfiniteQuery({
    // Include organizationId in the queryKey for cache isolation
    queryKey: ['all-projects', organizationId, filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        checkPermission(currentRole, ['owner', 'admin', 'cto', 'staff']);

        if (!organizationId) throw new Error("Organization ID is missing");

        const { data } = await Api.get<BaseApiResponse<ProjectsListResponse>>(
          // Include organizationId in the URL
          `/api/v1/projects/${organizationId}`,
          { params: { ...filters, page: pageParam } }
        );

        if (data.ok) {
          return data.data;
        }
        throw new Error(data.message || 'Failed to fetch projects');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    // Only run if we have BOTH a role and an organizationId
    enabled: !!currentRole && !!organizationId,
  });
};

// --- 2. Get Single Project Hook ---
export const useGetSingleProject = (projectId: string | undefined) => {
  const { currentRole, organizationId } = useAuthData();

  return useQuery({
    queryKey: ['project', organizationId, projectId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, ['owner', 'admin', 'cto', 'staff']);

        if (!organizationId) throw new Error("Organization ID is missing");

        const { data } = await Api.get<BaseApiResponse<{ project: any }>>(
          `/api/v1/projects/${organizationId}/${projectId}`
        );

        if (data.ok) {
          return data.data.project;
        }
        throw new Error(data.message || 'Failed to fetch project details');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!projectId && !!currentRole && !!organizationId,
  });
};

// --- 3. Create Project Hook ---
export const useCreateProject = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      try {
        checkPermission(currentRole, ['owner', 'admin', 'cto']);

        if (!organizationId) throw new Error("Organization ID is missing");

        const { data } = await Api.post<BaseApiResponse<{ project: any }>>(
          `/api/v1/projects/${organizationId}`,
          payload
        );

        if (data.ok) {
          return data;
        }
        throw new Error(data.message || 'Project creation failed');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      // Target the specific organization's cache
      queryClient.invalidateQueries({ queryKey: ['all-projects', organizationId] });
    },
  });
};

// --- 4. Update Project Hook ---
export const useUpdateProject = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data: updateData }: UpdateProjectParams) => {
      try {
        checkPermission(currentRole, ['owner', 'admin', 'cto']);

        if (!organizationId) throw new Error("Organization ID is missing");

        const { data } = await Api.patch<BaseApiResponse<{ project: any }>>(
          `/api/v1/projects/${organizationId}/${projectId}`,
          updateData
        );

        if (data.ok) {
          return data;
        }
        throw new Error(data.message || 'Project update failed');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', organizationId, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['all-projects', organizationId] });
    },
  });
};

// --- 5. Delete Project Hook ---
export const useDeleteProject = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      try {
        checkPermission(currentRole, ['owner', 'admin', 'cto']);

        if (!organizationId) throw new Error("Organization ID is missing");

        const { data } = await Api.delete<BaseApiResponse<{ project: any }>>(
          `/api/v1/projects/${organizationId}/${projectId}`
        );

        if (data.ok) {
          return data;
        }
        throw new Error(data.message || 'Project deletion failed');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-projects', organizationId] });
    },
  });
};