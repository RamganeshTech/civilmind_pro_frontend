// // pages/RateConfigBackupItemsMain.tsx
// import React, { useState, useMemo } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import {
//   Archive,
//   ArrowLeft,
//   Search,
//   RotateCcw,
//   Trash2,
//   AlertTriangle,
//   Loader2,
// } from 'lucide-react';
// import { Input } from '../../../../components/ui/Input';
// import { Button } from '../../../../components/ui/Button';
// import {  useGetInactiveMaterialItems,
//  useRecoverMaterialItem,
//  useHardDeleteMaterialItem,
//  type MaterialItem,
//  type PopulatedCategory, } from '../../../../api_service/material_api/materialItemApi';
// import { toast } from '../../../../components/ui/toast/Toast';

// export const RateConfigBackupItemsMain: React.FC = () => {
//   const navigate = useNavigate();
//   const { categoryId } = useParams<{ categoryId?: string }>();

//   const [searchTerm, setSearchTerm] = useState('');
//   const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

//   // Queries & Mutations
//   const { data: items = [], isLoading } = useGetInactiveMaterialItems(categoryId);
//   const { mutateAsync: recoverItem } = useRecoverMaterialItem();
//   const { mutateAsync: hardDeleteItem } = useHardDeleteMaterialItem();

//   // Search filter matching name, brand, or populated category name
//   const filteredItems = useMemo(() => {
//     if (!searchTerm.trim()) return items;
//     const term = searchTerm.toLowerCase();
//     return items.filter((item) => {
//       const categoryName = typeof item.categoryId === 'object' 
//         ? (item.categoryId as PopulatedCategory)?.categoryName 
//         : '';
//       return (
//         item.productName?.toLowerCase().includes(term) ||
//         item.brand?.toLowerCase().includes(term) ||
//         categoryName?.toLowerCase().includes(term) ||
//         item.source?.toLowerCase().includes(term)
//       );
//     });
//   }, [items, searchTerm]);

//   // Restore item handler
//   const handleRecover = async (item: MaterialItem) => {
//                       console.log("item id", item)

//     setActionInProgressId(item._id);
//     try {
//       await recoverItem(item._id);
//       toast.success(`"${item.productName}" restored to catalog`);
//     } catch (error: any) {
//       toast.error(error?.message || 'Failed to restore material item');
//     } finally {
//       setActionInProgressId(null);
//     }
//   };

//   // Permanent delete handler
//   const handlePermanentDelete = async (item: MaterialItem) => {
//     const isConfirmed = window.confirm(
//       `Permanently delete "${item.productName}"? This action cannot be undone and will remove all pricing history.`
//     );
//     if (!isConfirmed) return;

//     setActionInProgressId(item._id);
//     try {
//       await hardDeleteItem(item._id);
//       toast.success(`"${item.productName}" permanently purged`);
//     } catch (error: any) {
//       toast.error(error?.message || 'Failed to permanently delete material item');
//     } finally {
//       setActionInProgressId(null);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full bg-page text-body">
//       {/* Header Bar */}
//       <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-surface border-b border-border shadow-sm">
//         <div className="flex items-center gap-3">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => navigate(-1)}
//             className="h-8 w-8 p-0 text-muted hover:text-heading shrink-0"
//             aria-label="Back"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <div>
//             <div className="flex items-center gap-2.5">
//               <Archive className="w-5 h-5 text-warning shrink-0" />
//               <h1 className="text-xl sm:text-2xl font-bold text-heading">
//                 Material Items Archive
//               </h1>
//             </div>
//             <p className="text-xs sm:text-sm text-muted mt-0.5">
//               Manage decommissioned items. Restore to active catalog or permanently purge.
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 w-full sm:w-auto">
//           <div className="relative w-full sm:w-64">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
//             <Input
//               placeholder="Search archived materials..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-9 w-full text-xs h-9"
//             />
//           </div>
//         </div>
//       </header>

//       {/* Main Content Area */}
//       <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
//         {/* Informational Warning Box */}
//         <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl border border-warning/30 bg-surface text-body text-xs shadow-sm">
//           <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
//           <p className="leading-relaxed">
//             These material items are currently marked as soft-deleted. They will not appear in estimations, live BOQs, or rate configuration tables. Restoring an item preserves its historic unit and rate records.
//           </p>
//         </div>

//         {isLoading ? (
//           <div className="flex flex-col items-center justify-center h-48 text-muted gap-2">
//             <Loader2 className="w-5 h-5 animate-spin text-primary" />
//             <span className="text-xs">Loading archived material items...</span>
//           </div>
//         ) : filteredItems?.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-border rounded-xl bg-surface p-6">
//             <Archive className="w-8 h-8 text-muted/50 mb-2" />
//             <p className="text-sm font-semibold text-heading">No archived items found</p>
//             <p className="text-xs text-muted mt-0.5">
//               {searchTerm ? 'No items match your filter criteria.' : 'The material items archive is currently empty.'}
//             </p>
//           </div>
//         ) : (
//           <div className="border border-border rounded-xl bg-surface shadow-sm overflow-hidden">
//             {/* Desktop Table */}
//             <div className="hidden md:block overflow-x-auto">
//               <table className="w-full border-collapse text-left text-xs">
//                 <thead>
//                   <tr className="border-b border-border bg-surface-hover/50 text-muted font-semibold uppercase tracking-wider text-[11px]">
//                     <th className="py-3 px-4">Product Name</th>
//                     <th className="py-3 px-4">Category</th>
//                     <th className="py-3 px-4">Brand</th>
//                     <th className="py-3 px-4">Unit</th>
//                     <th className="py-3 px-4">Last Rate</th>
//                     <th className="py-3 px-4">Archived Date</th>
//                     <th className="py-3 px-4 text-right">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-border">
//                   {filteredItems?.map((item) => {
//                     const isProcessing = actionInProgressId === item._id;
//                     const categoryObj = typeof item.categoryId === 'object' 
//                       ? (item.categoryId as PopulatedCategory) 
//                       : null;

//                       console.log("item id", item)



//                     return (
//                       <tr key={item._id} className="hover:bg-surface-hover/40 transition-colors">
//                         <td className="py-3 px-4 font-medium text-heading">
//                           {item.productName}
//                         </td>
//                         <td className="py-3 px-4">
//                           <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-surface-hover border border-border text-muted">
//                             {categoryObj?.categoryName || 'General'}
//                           </span>
//                         </td>
//                         <td className="py-3 px-4 text-muted">
//                           {item.brand || '—'}
//                         </td>
//                         <td className="py-3 px-4">
//                           <span className="px-1.5 py-0.5 font-mono text-[11px] rounded bg-surface-hover border border-border text-muted">
//                             {item.unit}
//                           </span>
//                         </td>
//                         <td className="py-3 px-4 font-semibold text-heading">
//                           ₹{item.currentRate?.toLocaleString('en-IN') ?? 0}
//                         </td>
//                         <td className="py-3 px-4 text-muted font-mono text-[11px]">
//                           {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—'}
//                         </td>
//                         <td className="py-3 px-4 text-right">
//                           <div className="flex items-center justify-end gap-1.5">
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleRecover(item)}
//                               disabled={isProcessing}
//                               leftIcon={<RotateCcw className="w-3.5 h-3.5 text-success" />}
//                               className="h-7 px-2.5 text-xs font-medium border-border hover:border-success/50 hover:bg-success/5"
//                             >
//                               Restore
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handlePermanentDelete(item)}
//                               disabled={isProcessing}
//                               className="h-7 w-7 p-0 text-muted hover:text-danger hover:bg-danger/10"
//                               aria-label={`Permanently purge ${item.productName}`}
//                             >
//                               <Trash2 className="w-3.5 h-3.5" />
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile Responsive Stacked Cards */}
//             <div className="md:hidden divide-y divide-border">
//               {filteredItems.map((item) => {
//                 const isProcessing = actionInProgressId === item._id;
//                 const categoryObj = typeof item.categoryId === 'object' 
//                   ? (item.categoryId as PopulatedCategory) 
//                   : null;

//                 return (
//                   <div key={item._id} className="p-4 flex flex-col gap-3">
//                     <div className="flex items-start justify-between gap-2">
//                       <div>
//                         <h4 className="text-sm font-semibold text-heading">
//                           {item.productName}
//                         </h4>
//                         <div className="flex items-center gap-2 mt-1">
//                           <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-hover border border-border text-muted">
//                             {categoryObj?.categoryName || 'General'}
//                           </span>
//                           {item.brand && (
//                             <span className="text-xs text-muted">
//                               {item.brand}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       <span className="font-semibold text-sm text-heading shrink-0">
//                         ₹{item.currentRate?.toLocaleString('en-IN') ?? 0}
//                         <span className="text-[10px] text-muted font-normal ml-1">/{item.unit}</span>
//                       </span>
//                     </div>

//                     <div className="flex items-center justify-between pt-2 border-t border-border/60">
//                       <span className="text-[11px] text-muted font-mono">
//                         {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Archived'}
//                       </span>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleRecover(item)}
//                           disabled={isProcessing}
//                           leftIcon={<RotateCcw className="w-3.5 h-3.5 text-success" />}
//                           className="h-8 text-xs font-medium border-border hover:border-success/50 hover:bg-success/5"
//                         >
//                           Restore
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handlePermanentDelete(item)}
//                           disabled={isProcessing}
//                           className="h-8 w-8 p-0 text-muted hover:text-danger hover:bg-danger/10"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };




// pages/RateConfigBackupItemsMain.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  Search,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckSquare
} from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { 
  useGetInactiveMaterialItems,
  useRecoverMaterialItem,
  useHardDeleteMaterialItem,
  useBulkRecoverMaterialItems, // Added import
  type MaterialItem,
  type PopulatedCategory, 
} from '../../../../api_service/material_api/materialItemApi';
import { toast } from '../../../../components/ui/toast/Toast';

export const RateConfigBackupItemsMain: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Queries & Mutations
  const { data: items = [], isLoading } = useGetInactiveMaterialItems(categoryId);
  const { mutateAsync: recoverItem } = useRecoverMaterialItem();
  const { mutateAsync: hardDeleteItem } = useHardDeleteMaterialItem();
  const { mutateAsync: bulkRecoverItems, isPending: isBulkRecovering } = useBulkRecoverMaterialItems();

  // Search filter
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) => {
      const categoryName = typeof item.categoryId === 'object' 
        ? (item.categoryId as PopulatedCategory)?.categoryName 
        : '';
      return (
        item.productName?.toLowerCase().includes(term) ||
        item.brand?.toLowerCase().includes(term) ||
        categoryName?.toLowerCase().includes(term) ||
        item.source?.toLowerCase().includes(term)
      );
    });
  }, [items, searchTerm]);

  // Bulk Selection Handlers
 const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Add .filter(Boolean) to strip out any undefined/null values
      const allValidIds = filteredItems.map(item => item._id).filter(Boolean);
      setSelectedIds(allValidIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const isAllSelected = filteredItems.length > 0 && selectedIds.length === filteredItems.length;

  // Single Actions
  const handleRecover = async (item: MaterialItem) => {
    setActionInProgressId(item._id);
    try {
      await recoverItem(item._id);
      toast.success(`"${item.productName}" restored to catalog`);
      // Remove from selection if it was selected
      setSelectedIds((prev) => prev.filter((id) => id !== item._id));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to restore material item');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handlePermanentDelete = async (item: MaterialItem) => {
    const isConfirmed = window.confirm(
      `Permanently delete "${item.productName}"? This action cannot be undone and will remove all pricing history.`
    );
    if (!isConfirmed) return;

    setActionInProgressId(item._id);
    try {
      await hardDeleteItem(item._id);
      toast.success(`"${item.productName}" permanently purged`);
      // Remove from selection if it was selected
      setSelectedIds((prev) => prev.filter((id) => id !== item._id));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to permanently delete material item');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Bulk Action
 const handleBulkRecover = async () => {
    // Filter out any potential empty or invalid strings just in case
    const validIds = selectedIds.filter((id) => id && id.length > 0);
    
    if (validIds.length === 0) {
      toast.error("No valid items selected");
      return;
    }
    
    try {
      // NOTE: Verify your backend controller. If it expects 'ids' instead of 'itemIds',
      // you need to change this key or update your backend to match.
      await bulkRecoverItems({ itemIds: validIds });
      
      toast.success(`Successfully restored ${validIds.length} items`);
      setSelectedIds([]); 
    } catch (error: any) {
      toast.error(error?.message || 'Failed to bulk restore items');
    }
  };

  return (
    <div className="flex flex-col h-full bg-page text-body">
      {/* Header Bar */}
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
              <h1 className="text-xl sm:text-2xl font-bold text-heading">
                Material Items Archive
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              Manage decommissioned items. Restore to active catalog or permanently purge.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Bulk Actions (Only visible when items are selected) */}
          {selectedIds.length > 0 && (
            <Button
              variant="outline"
              onClick={handleBulkRecover}
              disabled={isBulkRecovering}
              leftIcon={<CheckSquare className="w-4 h-4 text-success" />}
              className="h-9 whitespace-nowrap bg-success/5 border-success/20 hover:bg-success/10 text-success font-medium"
            >
              {isBulkRecovering ? 'Restoring...' : `Restore Selected (${selectedIds.length})`}
            </Button>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              placeholder="Search archived materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full text-xs h-9"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl border border-warning/30 bg-surface text-body text-xs shadow-sm">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            These material items are currently marked as soft-deleted. They will not appear in estimations, live BOQs, or rate configuration tables. Restoring an item preserves its historic unit and rate records.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-xs">Loading archived material items...</span>
          </div>
        ) : filteredItems?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-border rounded-xl bg-surface p-6">
            <Archive className="w-8 h-8 text-muted/50 mb-2" />
            <p className="text-sm font-semibold text-heading">No archived items found</p>
            <p className="text-xs text-muted mt-0.5">
              {searchTerm ? 'No items match your filter criteria.' : 'The material items archive is currently empty.'}
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-surface shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/50 text-muted font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-border cursor-pointer w-4 h-4 accent-primary"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">Last Rate</th>
                    <th className="py-3 px-4">Archived Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems?.map((item) => {
                    const isProcessing = actionInProgressId === item._id;
                    const isSelected = selectedIds.includes(item._id);
                    const categoryObj = typeof item.categoryId === 'object' 
                      ? (item.categoryId as PopulatedCategory) 
                      : null;

                    return (
                      <tr 
                        key={item._id} 
                        className={`transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-surface-hover/40'}`}
                      >
                        <td className="py-3 px-4">
                          <input 
                            type="checkbox" 
                            className="rounded border-border cursor-pointer w-4 h-4 accent-primary"
                            checked={isSelected}
                            onChange={(e) => handleSelectItem(item._id, e.target.checked)}
                          />
                        </td>
                        <td className="py-3 px-4 font-medium text-heading">
                          {item.productName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-surface-hover border border-border text-muted">
                            {categoryObj?.categoryName || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted">
                          {item.brand || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-1.5 py-0.5 font-mono text-[11px] rounded bg-surface-hover border border-border text-muted">
                            {item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-heading">
                          ₹{item.currentRate?.toLocaleString('en-IN') ?? 0}
                        </td>
                        <td className="py-3 px-4 text-muted font-mono text-[11px]">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRecover(item)}
                              disabled={isProcessing || isBulkRecovering}
                              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-success" />}
                              className="h-7 px-2.5 text-xs font-medium border-border hover:border-success/50 hover:bg-success/5"
                            >
                              Restore
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePermanentDelete(item)}
                              disabled={isProcessing || isBulkRecovering}
                              className="h-7 w-7 p-0 text-muted hover:text-danger hover:bg-danger/10"
                              aria-label={`Permanently purge ${item.productName}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Stacked Cards */}
            <div className="md:hidden divide-y divide-border">
              {/* Mobile Select All Header */}
              {filteredItems.length > 0 && (
                <div className="p-3 bg-surface-hover/50 flex items-center gap-3 border-b border-border">
                  <input 
                    type="checkbox" 
                    id="mobile-select-all"
                    className="rounded border-border cursor-pointer w-4 h-4 accent-primary"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                  <label htmlFor="mobile-select-all" className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Select All
                  </label>
                </div>
              )}
              
              {filteredItems.map((item) => {
                const isProcessing = actionInProgressId === item._id;
                const isSelected = selectedIds.includes(item._id);
                const categoryObj = typeof item.categoryId === 'object' 
                  ? (item.categoryId as PopulatedCategory) 
                  : null;

                return (
                  <div key={item._id} className={`p-4 flex flex-col gap-3 ${isSelected ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                         <input 
                            type="checkbox" 
                            className="rounded border-border cursor-pointer w-4 h-4 accent-primary"
                            checked={isSelected}
                            onChange={(e) => handleSelectItem(item._id, e.target.checked)}
                          />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold text-heading">
                              {item.productName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-hover border border-border text-muted">
                                {categoryObj?.categoryName || 'General'}
                              </span>
                              {item.brand && (
                                <span className="text-xs text-muted">
                                  {item.brand}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-semibold text-sm text-heading shrink-0">
                            ₹{item.currentRate?.toLocaleString('en-IN') ?? 0}
                            <span className="text-[10px] text-muted font-normal ml-1">/{item.unit}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60 ml-7">
                      <span className="text-[11px] text-muted font-mono">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Archived'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecover(item)}
                          disabled={isProcessing || isBulkRecovering}
                          leftIcon={<RotateCcw className="w-3.5 h-3.5 text-success" />}
                          className="h-8 text-xs font-medium border-border hover:border-success/50 hover:bg-success/5"
                        >
                          Restore
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePermanentDelete(item)}
                          disabled={isProcessing || isBulkRecovering}
                          className="h-8 w-8 p-0 text-muted hover:text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};