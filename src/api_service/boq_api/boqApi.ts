// hooks/useBOQ.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IMaterialUnit } from '../material_api/materialItemApi';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import type { UserRole } from '../../features/slices/authSlice';
import type { BaseApiResponse } from '../material_api/materialCategoryApi';
import { Api } from '../../lib/api';
// types/boq.types.ts

export const IBOQStatus = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  SUPERSEDED: 'superseded',
} as const;

export type IBOQStatus = (typeof IBOQStatus)[keyof typeof IBOQStatus];

// ── 1. Line Item ───────────────────────────────────────────────────────────
export interface IBOQLineItem {
  _id: string;
  description: string;
  unit: IMaterialUnit;
  quantity: number;
  rate: number;
  amount: number;
  govtCode?: string | null;
  materialItemId?: string | null;
}

// ── 2. Labour Item ─────────────────────────────────────────────────────────
export interface IBOQLabourItem {
  _id: string;
  labourType: string;
  description: string;
  unit: IMaterialUnit;
  quantity: number;
  rate: number;
  amount: number;
  govtCode?: string | null;
  labourItemId?: string | null;
}

// ── 3. Section ─────────────────────────────────────────────────────────────
export interface IBOQSection {
  _id: string;
  sectionId: string;
  sectionName: string;
  sectionCode: string;
  govtCode?: string;
  inputs: Record<string, string | number>;
  lineItems: IBOQLineItem[];
  labours: IBOQLabourItem[];
  subtotal: number;
  warnings: string[];
}

// ── 4. Main BOQ Document ───────────────────────────────────────────────────
export interface IBOQ {
  _id: string;
  organizationId: string;
  projectId: string;
  boqNo: string;
  version: number;
  status: IBOQStatus;
  sections: IBOQSection[];
  totalCost: number;
  materialsTotal: number;
  labourTotal: number;
  perSqftRate: number | null;
  warnings: string[];
  approvedBy: string | null;
  approvalNotes: string | null;
  approvedAt: string | null;
  createdBy?: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── 5. Payload Types ───────────────────────────────────────────────────────
export interface SaveSectionsPayload {
  sections: Pick<IBOQSection, 'sectionId' | 'sectionName' | 'sectionCode' | 'govtCode'>[];
}

export interface SaveSectionInputsPayload {
  inputs: Record<string, string | number>;
}

export interface UpdateLineItemPayload {
  description?: string;
  quantity?: number;
  rate?: number;
}

const READ_ROLES:UserRole[] = ['owner', 'admin', 'cto', 'staff'];
const WRITE_ROLES:UserRole[] = ['owner', 'admin', 'cto'];

// ── 1. GET ALL BOQs ──────────────────────────────────────────────────────────
// Route: GET /api/v1/boq/:organizationId
export const useGetAllBOQ = () => {
  const { currentRole, organizationId } = useAuthData();

  return useQuery({
    queryKey: ['boqs', organizationId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, READ_ROLES);
        if (!organizationId) throw new Error('Organization ID is missing');

        const { data } = await Api.get<BaseApiResponse<IBOQ[]>>(
          `/api/v1/boq/${organizationId}`
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to fetch BOQs');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!currentRole && !!organizationId,
  });
};

// ── 2. GET SINGLE BOQ BY ID ──────────────────────────────────────────────────
// Route: GET /api/v1/boq/:organizationId/:boqId
export const useGetBOQById = (boqId: string | undefined) => {
  const { currentRole, organizationId } = useAuthData();

  return useQuery({
    queryKey: ['boq', organizationId, boqId],
    queryFn: async () => {
      try {
        checkPermission(currentRole, READ_ROLES);
        if (!organizationId) throw new Error('Organization ID is missing');
        if (!boqId) throw new Error('BOQ ID is missing');

        const { data } = await Api.get<BaseApiResponse<IBOQ>>(
          `/api/v1/boq/${organizationId}/${boqId}`
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to fetch BOQ details');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    enabled: !!boqId && !!currentRole && !!organizationId,
  });
};

// ── 3. STEP 1: CREATE NEW DRAFT BOQ (No BOQ ID yet) ──────────────────────────
// Route: POST /api/v1/boq/:organizationId/:projectId
export const useCreateBOQDraft = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      sections,
    }: {
      projectId: string;
      sections: Pick<IBOQSection, 'sectionId' | 'sectionName' | 'sectionCode' | 'govtCode'>[];
    }) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error('Organization ID is missing');

        const { data } = await Api.post<BaseApiResponse<IBOQ>>(
          `/api/v1/boq/${organizationId}/${projectId}`,
          { sections }
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to initialize BOQ draft');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boqs', organizationId] });
    },
  });
};

// ── 4. STEP 1: UPDATE EXISTING DRAFT SECTIONS ────────────────────────────────
// Route: PATCH /api/v1/boq/:organizationId/:boqId/sections
export const useSaveBOQSections = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boqId,
      sections,
    }: {
      boqId: string;
      sections: Pick<IBOQSection, 'sectionId' | 'sectionName' | 'sectionCode' | 'govtCode'>[];
    }) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error('Organization ID is missing');

        const { data } = await Api.patch<BaseApiResponse<IBOQ>>(
          `/api/v1/boq/${organizationId}/${boqId}/sections`,
          { sections }
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to update BOQ sections');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: (updatedBOQ, variables) => {
      queryClient.setQueryData(['boq', organizationId, variables.boqId], updatedBOQ);
      queryClient.invalidateQueries({ queryKey: ['boqs', organizationId] });
    },
  });
};

// ── 5. STEP 2: SAVE SECTION INPUTS ──────────────────────────────────────────
// Route: PATCH /api/v1/boq/:organizationId/:boqId/sections/:sectionId/inputs
export const useSaveSectionInputs = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boqId,
      sectionId,
      inputs,
    }: {
      boqId: string;
      sectionId: string;
      inputs: Record<string, string | number>;
    }) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error('Organization ID is missing');

        const { data } = await Api.patch<BaseApiResponse<IBOQ>>(
          `/api/v1/boq/${organizationId}/${boqId}/sections/${sectionId}/inputs`,
          { inputs }
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to save section inputs');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: (updatedBOQ, variables) => {
      queryClient.setQueryData(['boq', organizationId, variables.boqId], updatedBOQ);
    },
  });
};

// ── 6. STEP 3: RUN ENGINE / FORMULAS ─────────────────────────────────────────
// Route: POST /api/v1/boq/:organizationId/:boqId/run-engine
export const useRunFormulaEngine = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boqId: string) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error('Organization ID is missing');

        const { data } = await Api.post<BaseApiResponse<IBOQ>>(
          `/api/v1/boq/${organizationId}/${boqId}/run-engine`,
          {}
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to run calculation engine');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: (updatedBOQ, boqId) => {
      queryClient.setQueryData(['boq', organizationId, boqId], updatedBOQ);
      queryClient.invalidateQueries({ queryKey: ['boqs', organizationId] });
    },
  });
};

// ── 7. STEP 4: UPDATE MANUAL LINE ITEM ──────────────────────────────────────
// Route: PATCH /api/v1/boq/:organizationId/:boqId/sections/:sectionId/line-items/:lineItemId
export const useUpdateBOQLineItem = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boqId,
      sectionId,
      lineItemId,
      changes,
    }: {
      boqId: string;
      sectionId: string;
      lineItemId: string;
      changes: Partial<{ description: string; quantity: number; rate: number }>;
    }) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error('Organization ID is missing');

        const { data } = await Api.patch<BaseApiResponse<IBOQ>>(
          `/api/v1/boq/${organizationId}/${boqId}/sections/${sectionId}/line-items/${lineItemId}`,
          changes
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to update line item');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: (updatedBOQ, variables) => {
      queryClient.setQueryData(['boq', organizationId, variables.boqId], updatedBOQ);
    },
  });
};

// ── 8. STEP 4: ASSIGN MATERIAL ITEM ──────────────────────────────────────────
// Route: PATCH /api/v1/boq/:organizationId/:boqId/sections/:sectionId/line-items/:lineItemId/assign-material
export const useAssignMaterialToLineItem = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boqId,
      sectionId,
      lineItemId,
      materialItemId,
    }: {
      boqId: string;
      sectionId: string;
      lineItemId: string;
      materialItemId: string;
    }) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error('Organization ID is missing');

        const { data } = await Api.patch<BaseApiResponse<IBOQ>>(
          `/api/v1/boq/${organizationId}/${boqId}/sections/${sectionId}/line-items/${lineItemId}/assign-material`,
          { materialItemId }
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to assign material to item');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: (updatedBOQ, variables) => {
      queryClient.setQueryData(['boq', organizationId, variables.boqId], updatedBOQ);
      queryClient.invalidateQueries({ queryKey: ['boqs', organizationId] });
    },
  });
};

// ── 9. STEP 4: ASSIGN LABOUR ITEM ────────────────────────────────────────────
// Route: PATCH /api/v1/boq/:organizationId/:boqId/sections/:sectionId/labours/:labourRowId/assign-labour
export const useAssignLabourToLabourItem = () => {
  const { currentRole, organizationId } = useAuthData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boqId,
      sectionId,
      labourRowId,
      labourItemId,
    }: {
      boqId: string;
      sectionId: string;
      labourRowId: string;
      labourItemId: string;
    }) => {
      try {
        checkPermission(currentRole, WRITE_ROLES);
        if (!organizationId) throw new Error('Organization ID is missing');

        const { data } = await Api.patch<BaseApiResponse<IBOQ>>(
          `/api/v1/boq/${organizationId}/${boqId}/sections/${sectionId}/labours/${labourRowId}/assign-labour`,
          { labourItemId }
        );

        if (data.ok) return data.data;
        throw new Error(data.message || 'Failed to assign labour to row');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage, { cause: error });
      }
    },
    onSuccess: (updatedBOQ, variables) => {
      queryClient.setQueryData(['boq', organizationId, variables.boqId], updatedBOQ);
      queryClient.invalidateQueries({ queryKey: ['boqs', organizationId] });
    },
  });
};