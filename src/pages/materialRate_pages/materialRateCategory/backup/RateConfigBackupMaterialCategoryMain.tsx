// pages/RateConfigBackupMaterialCategoryMain.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Archive, 
  ArrowLeft, 
  Search, 
  RotateCcw, 
  Trash2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import {  useGetInactiveMaterialCategories, 
 useRecoverMaterialCategory, 
 useHardDeleteMaterialCategory,
 type MaterialCategory  } from '../../../../api_service/material_api/materialCategoryApi';
import { toast } from '../../../../components/ui/toast/Toast';
import { Input } from '../../../../components/ui/Input';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';

export const RateConfigBackupMaterialCategoryMain: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // React Query Hooks
  const { data: categories = [], isLoading } = useGetInactiveMaterialCategories();
  const { mutateAsync: recoverCategory } = useRecoverMaterialCategory();
  const { mutateAsync: hardDeleteCategory } = useHardDeleteMaterialCategory();

  // Search filter
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter((cat) => 
      cat.categoryName?.toLowerCase().includes(term) ||
      cat.code?.toLowerCase().includes(term) ||
      cat.description?.toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  // Handlers
  const handleRecover = async (category: MaterialCategory) => {
    setActionInProgressId(category._id);
    try {
      await recoverCategory(category._id);
      toast.success(`"${category.categoryName}" restored successfully`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to restore category');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handlePermanentDelete = async (category: MaterialCategory) => {
    const isConfirmed = window.confirm(
      `Warning: Permanently deleting "${category.categoryName}" will also remove all associated material items. This action cannot be undone. Do you wish to continue?`
    );
    if (!isConfirmed) return;

    setActionInProgressId(category._id);
    try {
      const response = await hardDeleteCategory(category._id);
      toast.success(response?.message || 'Category permanently purged');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to permanently delete category');
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-page text-body">
      {/* Header bar matching theme and standards */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-surface border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 w-8 p-0 text-muted hover:text-heading shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <Archive className="w-5 h-5 text-warning shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold text-heading">Category Archive & Recovery</h1>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              View deactivated material categories, recover them to active stock, or purge permanently.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input 
              placeholder="Search archived..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full text-xs h-9"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {/* Informational Warning Banner */}
        <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl border border-warning/30 bg-surface text-body text-xs shadow-sm">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Archived categories are hidden from quotation generators and material lookups. Restoring a category will make it immediately selectable again. Permanent deletion will remove the category and cascade delete its catalog items.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-xs">Loading archived categories...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-border rounded-xl bg-surface p-6">
            <Archive className="w-8 h-8 text-muted/50 mb-2" />
            <p className="text-sm font-semibold text-heading">No archived categories found</p>
            <p className="text-xs text-muted mt-0.5">
              {searchTerm ? 'No matches found for your filter criteria.' : 'The recovery archive is currently empty.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => {
              const tagCode = (category.code || category.categoryName.slice(0, 2)).toUpperCase();
              const isProcessing = actionInProgressId === category._id;

              return (
                <Card 
                  key={category._id} 
                  className="relative flex flex-col justify-between p-4 bg-surface border border-border rounded-xl transition-all duration-150 hover:border-border hover:shadow-sm"
                >
                  {/* Subtle Deactivated Marker Bar */}
                  <span 
                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-muted/40" 
                    aria-hidden="true" 
                  />

                  <div>
                    {/* Top Row: Spec Code + Name */}
                    <div className="flex items-start justify-between gap-3 pl-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 h-7 px-2 flex items-center justify-center font-mono text-xs font-semibold tracking-wider text-muted bg-surface-hover border border-border rounded">
                          {tagCode}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-heading truncate">
                            {category.categoryName}
                          </h3>
                          <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
                            Archived
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-3 pl-2">
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed min-h-[2rem]">
                        {category.description || <span className="italic opacity-60">No description logged.</span>}
                      </p>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="mt-4 pt-3 pl-2 border-t border-border flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-muted">
                      {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : 'Archived'}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecover(category)}
                        disabled={isProcessing}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5 text-success" />}
                        className="h-8 text-xs font-medium border-border hover:border-success/50 hover:bg-success/5"
                      >
                        Restore
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePermanentDelete(category)}
                        disabled={isProcessing}
                        className="h-8 px-2 text-muted hover:text-danger hover:bg-danger/10"
                        aria-label={`Permanently purge ${category.categoryName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};