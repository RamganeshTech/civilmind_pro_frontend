import { useState, useEffect, type FormEvent } from 'react';
import {
  Building2, Mail, Phone, Save, Calendar, Loader2
} from 'lucide-react';
import { useAuthData } from '../../hooks/useAuthData';
import { Input } from '../../components/ui/Input'; // Adjust path
import { Button } from '../../components/ui/Button'; // Adjust path
import { toast } from '../../components/ui/toast/Toast'; // Adjust path
import { useGetSingleOrganization, useUpdateOrganization } from '../../api_service/organization_api/organizationapi';

export const OrganizationSettings = () => {
  const { organizationId, currentRole } = useAuthData();

  const { data: orgData, isLoading, isError } = useGetSingleOrganization(organizationId || undefined);
  const { mutateAsync: updateOrgAsync, isPending: isUpdating } = useUpdateOrganization();

  // Local state for the editable form
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    phone: '',
  });

  // Sync fetched data into local form state
  useEffect(() => {
    if (orgData) {
      setFormData({
        name: orgData.name || '',
        contactEmail: orgData.contactEmail || '',
        phone: orgData.phone || '',
      });
    }
  }, [orgData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!organizationId) {
      toast.error('Organization ID is missing.');
      return;
    }

    try {
      await updateOrgAsync({
        id: organizationId,
        data: formData,
      });
      toast.success('Organization settings updated successfully.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update settings.');
    }
  };

  // Only Owner, Admin, and CTO can edit
  const canEdit = ['owner', 'admin', 'cto'].includes(currentRole || '');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted text-sm font-medium">Loading workspace settings...</p>
      </div>
    );
  }

  if (isError || !orgData) {
    return (
      <div className="p-8 text-center bg-surface border border-danger/20 rounded-xl">
        <p className="text-danger font-medium">Failed to load organization data.</p>
      </div>
    );
  }

  const formattedDate = orgData.createdAt
    ? new Date(orgData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div className="w-full mx-auto space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-heading">Organization Settings</h1>
        <p className="text-sm text-muted mt-1">
          Manage your organization's profile, contact details, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Editable Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
                <Building2 className="text-primary" size={20} />
                Organization Details
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
              <Input
                label="Organization Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                leftIcon={<Building2 size={18} />}
                placeholder="e.g. Apex Construction Ltd."
                disabled={!canEdit || isUpdating}
                required
              />

              <Input
                label="Contact Email"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                leftIcon={<Mail size={18} />}
                placeholder="info@company.com"
                disabled={!canEdit || isUpdating}
                required
              />

              <Input
                label="Contact Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                leftIcon={<Phone size={18} />}
                placeholder="+1 (555) 000-0000"
                disabled={!canEdit || isUpdating}
              />

              {canEdit && (
                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isUpdating}
                    leftIcon={!isUpdating && <Save size={18} />}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Read-Only Metadata & Status */}
        <div className="space-y-6">

          <div className="bg-surface border border-border rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-md font-semibold text-heading tracking-wider mb-4">
              System Metadata
            </h3>

            <div className="space-y-4">
              {/* <div>
                <label className="text-xs text-muted flex items-center gap-1.5 mb-1">
                  <Hash size={14} /> Organization ID
                </label>
                <div className="bg-page border border-border rounded-lg px-3 py-2 text-sm text-heading font-mono select-all">
                  {orgData._id}
                </div>
              </div> */}

              <div>
                <label className="text-xs text-muted flex items-center gap-1.5 mb-1">
                  <Calendar size={14} /> Registered On
                </label>
                <div className="px-1 py-1 text-sm text-heading font-medium">
                  {formattedDate}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted flex items-center gap-1.5 mb-1">
                  Status
                </label>
                <div className="px-1 py-1">
                  {orgData.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                      Active Workspace
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-danger/10 text-danger">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
                      Suspended
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* If the user is just a staff member viewing this page, tell them it's read-only */}
          {!canEdit && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-primary">
              <p>
                <strong>Note:</strong> Your current role (<b>{currentRole}</b>) grants you view-only access to these settings.
                Contact your Workspace Administrator to request changes.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};