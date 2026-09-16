// pages/LabourItemBackupMain.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, RefreshCw, Trash2, CheckSquare, Loader2 } from 'lucide-react';
import { useGetSingleLabourCategory } from '../../../../api_service/labour_api/labourCategoryApi';
import { useGetInactiveLabourItems, 
useRecoverSingleLabourItem, 
useBulkRecoverLabourItems, 
useHardDeleteLabourItem  } from '../../../../api_service/labour_api/labourItemsApi';
import { toast } from '../../../../components/ui/toast/Toast';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import type { LabourItem } from '../LabourItemMain';


export const LabourItemBackupMain: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    // Queries
    const { data: categoryData } = useGetSingleLabourCategory(categoryId);
    const { data: allInactiveItems = [], isLoading } = useGetInactiveLabourItems();

    // Mutations
    const { mutateAsync: recoverSingle, isPending: isRecoveringSingle } = useRecoverSingleLabourItem();
    const { mutateAsync: recoverBulk, isPending: isRecoveringBulk } = useBulkRecoverLabourItems();
    const { mutateAsync: hardDelete, isPending: isDeleting } = useHardDeleteLabourItem();

    const category = categoryData?.category || categoryData;
    
    // The inactive endpoint fetches all inactive items for the organization.
    // We must filter them down to just the current category.
    const categoryInactiveItems = useMemo(() => {
        const itemsArray = Array.isArray(allInactiveItems) ? allInactiveItems : (allInactiveItems as any).items || [];
        if (!categoryId) return [];
        return itemsArray.filter((item: LabourItem) => String(item.categoryId) === String(categoryId));
    }, [allInactiveItems, categoryId]);

    // Search filter
    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return categoryInactiveItems;
        const term = searchTerm.toLowerCase();
        return categoryInactiveItems.filter((item: LabourItem) =>
            item.role.toLowerCase().includes(term) ||
            item.refNo?.toLowerCase().includes(term) ||
            item.notes?.toLowerCase().includes(term)
        );
    }, [categoryInactiveItems, searchTerm]);

    // Handlers
    const handleToggleSelectAll = () => {
        if (selectedItems.length === filteredItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredItems.map((item: LabourItem) => item._id));
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedItems((prev) => 
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const handleRecoverSingle = useCallback(async (id: string, role: string) => {
        if (window.confirm(`Are you sure you want to recover "${role}"?`)) {
            try {
                await recoverSingle(id);
                toast.success(`"${role}" has been restored successfully.`);
                setSelectedItems((prev) => prev.filter(itemId => itemId !== id));
            } catch (error: any) {
                toast.error(error.message || 'Failed to recover item.');
            }
        }
    }, [recoverSingle]);

    const handleHardDelete = useCallback(async (id: string, role: string) => {
        if (window.confirm(`WARNING: Are you sure you want to PERMANENTLY delete "${role}"? This action cannot be undone.`)) {
            try {
                await hardDelete(id);
                toast.success(`"${role}" was permanently deleted.`);
                setSelectedItems((prev) => prev.filter(itemId => itemId !== id));
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete item permanently.');
            }
        }
    }, [hardDelete]);

    const handleBulkRecover = async () => {
        if (!selectedItems.length) return;
        if (window.confirm(`Are you sure you want to recover ${selectedItems.length} selected item(s)?`)) {
            try {
                await recoverBulk({ itemIds: selectedItems });
                toast.success(`${selectedItems.length} items have been restored.`);
                setSelectedItems([]);
            } catch (error: any) {
                toast.error(error.message || 'Failed to bulk recover items.');
            }
        }
    };

    const isProcessing = isRecoveringSingle || isDeleting || isRecoveringBulk;

    return (
        <div className="flex flex-col h-full bg-page text-body">
            {/* Header Area */}
            {/* <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-surface border-b border-border shadow-sm"> */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 bg-surface border-b border-border shadow-xs">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="h-8 w-8 p-0 text-muted hover:text-heading"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-heading">Deleted Labour Items</h1>
                            {category?.categoryName && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-hover border border-border text-muted">
                                    {category.categoryName}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted mt-0.5">Recover or permanently remove deleted roles.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input
                            placeholder="Search backups..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full h-9 text-sm"
                        />
                    </div>

                    {selectedItems.length > 0 && (
                        <Button
                            variant="secondary"
                            onClick={handleBulkRecover}
                            disabled={isProcessing}
                            leftIcon={<CheckSquare className="w-4 h-4 shrink-0" />}
                            className="text-xs h-9 px-3 shrink-0 text-success border-success/30 hover:bg-success/10"
                        >
                            Recover {selectedItems.length} Selected
                        </Button>
                    )}
                </div>
            </header>

            {/* Main Table View */}
            <main className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="border border-border rounded-xl bg-surface shadow-sm overflow-hidden min-w-[900px]">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-border bg-surface-hover/80 text-heading font-semibold uppercase tracking-wider text-[11px]">
                                <th className="py-3 px-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                        checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                                        onChange={handleToggleSelectAll}
                                        disabled={filteredItems.length === 0}
                                    />
                                </th>
                                <th className="py-3 px-3">Role</th>
                                <th className="py-3 px-3 w-32">Skill Level</th>
                                <th className="py-3 px-3 w-28">Daily (₹)</th>
                                <th className="py-3 px-3 w-28">Half (₹)</th>
                                <th className="py-3 px-3 w-28">OT/Hr (₹)</th>
                                <th className="py-3 px-3 w-32">Notes</th>
                                <th className="py-3 px-4 w-28 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-xs">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-muted font-medium">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                                        Loading backups...
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-muted">
                                        <div className="flex flex-col items-center justify-center">
                                            <ArchiveEmptyStateIcon className="w-10 h-10 text-border mb-2" />
                                            <p className="font-medium text-heading">No deleted items found</p>
                                            <p className="text-xs mt-1">The backup archive for this category is empty.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item: LabourItem) => {
                                    const isSelected = selectedItems.includes(item._id);

                                    return (
                                        <tr 
                                            key={item._id} 
                                            className={`transition-colors group opacity-75 hover:opacity-100 ${
                                                isSelected ? 'bg-primary/5' : 'hover:bg-surface-hover/50'
                                            }`}
                                        >
                                            <td className="py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelect(item._id)}
                                                />
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-muted line-through text-sm">
                                                        {item.role}
                                                    </span>
                                                    <span className="text-[10px] text-muted font-mono mt-0.5">
                                                        {item.refNo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="px-2 py-0.5 font-medium text-[11px] rounded bg-page border border-border text-muted shadow-sm whitespace-nowrap">
                                                    {item.skillLevel}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 font-semibold text-muted tracking-wide line-through">
                                                ₹{item.rate.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3 px-3 text-muted font-medium line-through">
                                                ₹{item.halfDayRate.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3 px-3 text-muted font-medium line-through">
                                                ₹{item.otPerHour.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3 px-3 text-muted font-medium truncate max-w-[140px]">
                                                {item.notes || '—'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRecoverSingle(item._id, item.role)}
                                                        disabled={isProcessing}
                                                        className="h-7 px-2 text-success hover:bg-success/10 font-medium text-xs flex items-center gap-1"
                                                    >
                                                        <RefreshCw className="w-3 h-3" /> Restore
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleHardDelete(item._id, item.role)}
                                                        disabled={isProcessing}
                                                        className="h-7 w-7 p-0 text-danger hover:bg-danger/10"
                                                        aria-label="Delete Permanently"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

// Simple empty state SVG for visual polish
const ArchiveEmptyStateIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);