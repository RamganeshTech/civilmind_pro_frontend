import React, { useState, useEffect } from 'react';
import { useCreateProject, useUpdateProject } from '../../api_service/project_api/projectApi';
import { toast } from '../../components/ui/toast/Toast';
import { CenterModal } from '../../components/ui/CenterModal';
import { Button } from '../../components/ui/Button';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any | null; // Pass null for create, project object for update
}

const initialFormState = {
  projectName: '',
  clientName: '',
  projectType: 'Residential',
  siteAddress: '',
  builtUpArea: '',
  numberOfFloors: '',
  basement: 'no',
  plotArea: '',
  facingDirection: '',
  startDate: '',
  plannedCompletion: '',
};

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, editData }) => {
  const [formData, setFormData] = useState(initialFormState);
  
  const isEditMode = !!editData;

  const { mutateAsync: createProjectAsync, isPending: isCreating } = useCreateProject();
  const { mutateAsync: updateProjectAsync, isPending: isUpdating } = useUpdateProject();
  
  const isPending = isCreating || isUpdating;

  // Pre-fill form when modal opens or editData changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editData) {
        setFormData({
          projectName: editData.projectName || '',
          clientName: editData.clientName || '',
          projectType: editData.projectType || 'Residential',
          siteAddress: editData.siteAddress || '',
          builtUpArea: editData.builtUpArea || '',
          numberOfFloors: editData.numberOfFloors || '',
          basement: editData.basement || 'no',
          plotArea: editData.plotArea || '',
          facingDirection: editData.facingDirection || '',
          // Format ISO dates to YYYY-MM-DD for HTML date inputs
          startDate: editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : '',
          plannedCompletion: editData.plannedCompletion ? new Date(editData.plannedCompletion).toISOString().split('T')[0] : '',
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [isOpen, editData, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        builtUpArea: Number(formData.builtUpArea),
        numberOfFloors: Number(formData.numberOfFloors),
        plotArea: formData.plotArea ? Number(formData.plotArea) : undefined,
      };

      if (isEditMode) {
        await updateProjectAsync({ projectId: editData._id, data: payload });
        toast.success('Project updated successfully');
      } else {
        await createProjectAsync(payload);
        toast.success('Project created successfully');
      }
      
      onClose();
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${isEditMode ? 'update' : 'create'} project`);
    }
  };

  const actions = (
   <Button
      type="submit"
      form="project-form"
      variant="primary"
      size="sm"
      isLoading={isPending}
      loadingText="Saving..."
    >
      {isEditMode ? 'Update Project' : 'Save Project'}
    </Button>
  );

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Project' : 'Create New Project'}
      maxWidth="max-w-4xl"
      actions={actions}
    >
      <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
        {/* --- Basic Information --- */}
        <div>
          <h3 className="text-sm font-medium text-heading mb-3 border-b border-border pb-1">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-body mb-1">Project Name *</label>
              <input
                required
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="e.g. Riverside Villa"
                className="w-full px-3 py-2 text-sm border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-body mb-1">Client Name *</label>
              <input
                required
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Client Name"
                className="w-full px-3 py-2 text-sm border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-body mb-1">Project Type *</label>
              <select
                required
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Villa">Villa</option>
                <option value="Renovation">Renovation</option>
                <option value="Apartment">Apartment</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-body mb-1">Site Address *</label>
              <textarea
                required
                name="siteAddress"
                value={formData.siteAddress}
                onChange={handleChange}
                rows={2}
                placeholder="Full site address"
                className="w-full px-3 py-2 text-sm border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* --- Site Dimensions --- */}
        <div>
          <h3 className="text-sm font-medium text-heading mb-3 border-b border-border pb-1">Site Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-body mb-1">Built-up Area (sq ft) *</label>
              <input
                required
                type="number"
                name="builtUpArea"
                value={formData.builtUpArea}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-body mb-1">Number of Floors *</label>
              <input
                required
                type="number"
                name="numberOfFloors"
                value={formData.numberOfFloors}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-body mb-1">Plot Area (optional)</label>
              <input
                type="number"
                name="plotArea"
                value={formData.plotArea}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-body mb-1">Basement</label>
              <select
                name="basement"
                value={formData.basement}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="stilt">Stilt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-body mb-1">Facing Direction</label>
              <select
                name="facingDirection"
                value={formData.facingDirection}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Select Direction</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Timeline --- */}
        <div>
          <h3 className="text-sm font-medium text-heading mb-3 border-b border-border pb-1">Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-body mb-1">Start Date *</label>
              <input
                required
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-body mb-1">Planned Completion</label>
              <input
                type="date"
                name="plannedCompletion"
                value={formData.plannedCompletion}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </CenterModal>
  );
};