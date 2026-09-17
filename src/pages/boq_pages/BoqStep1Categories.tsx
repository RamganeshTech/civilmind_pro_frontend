import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useCreateBOQDraft, useSaveBOQSections, type IBOQ } from '../../api_service/boq_api/boqApi';
import { toast } from '../../components/ui/toast/Toast';
import { Button } from '../../components/ui/Button';

// Hardcoded catalog of available categories (mirrored from your reference)
const CATEGORY_CATALOG = [
  { id: 'brickwork', name: 'Brickwork', code: 'F01', is: 'IS 2212:1991', priority: 'p1' },
  { id: 'concrete', name: 'Concrete Mix', code: 'F02', is: 'IS 456:2000', priority: 'p1' },
  { id: 'plastering', name: 'Plastering', code: 'F03', is: 'IS 1661:1972', priority: 'p1' },
  { id: 'steel', name: 'Steel / RCC', code: 'F04', is: 'IS 456:2000', priority: 'p1' },
  { id: 'foundation', name: 'Foundation & PCC', code: 'F05', is: 'IS 1080:1985', priority: 'p1' },
  { id: 'flooring', name: 'Flooring & Tiling', code: 'F06', is: 'IS 1237:1980', priority: 'p1' },
  { id: 'waterproof', name: 'Waterproofing', code: 'F07', is: 'IS 2645:2003', priority: 'p2' },
  { id: 'paint', name: 'Paint & Putty', code: 'F08', is: 'NBC 2016', priority: 'p2' },
  { id: 'rccSlab', name: 'RCC Slab', code: 'F09', is: 'IS 456 Cl.24', priority: 'p2' },
  { id: 'rccColumn', name: 'RCC Column', code: 'F10', is: 'IS 456 Cl.39', priority: 'p2' },
  { id: 'rccBeam', name: 'RCC Beam BBS', code: 'F11', is: 'IS 456 Cl.26', priority: 'p2' },
  { id: 'staircase', name: 'Staircase', code: 'F12', is: 'IS 456 Cl.33', priority: 'p2' },
  { id: 'drainage', name: 'Drainage & Plumbing', code: 'F13', is: 'IS 1742:1983', priority: 'p2' },
  { id: 'septic', name: 'Septic & Water Tank', code: 'F14', is: 'IS 2470:1985', priority: 'p3' },
  { id: 'earthwork', name: 'Earthwork', code: 'F15', is: 'IS 2720', priority: 'p2' },
  { id: 'electrical', name: 'Electrical Load', code: 'F16', is: 'IS 732:1989', priority: 'p2' },
  { id: 'aac', name: 'AAC / Hollow Brick', code: 'F17', is: 'IS 2185 Pt.3', priority: 'p1' },
  { id: 'thumbrule', name: 'Thumb Rules', code: 'F09', is: 'BN Datta/NBC', priority: 'p1' },
  { id: 'compound', name: 'Compound Wall', code: 'F15', is: 'IRC SP 72', priority: 'p3' },
];

interface BoqStep1CategoriesProps {
  projectId: string;
  existingBoq?: IBOQ | null;
  onNextStep: (boqId: string) => void;
}

export const BoqStep1Categories: React.FC<BoqStep1CategoriesProps> = ({
  projectId,
  existingBoq,
  onNextStep,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Mutations
  const { mutateAsync: createDraft, isPending: isCreating } = useCreateBOQDraft();
  const { mutateAsync: updateSections, isPending: isUpdating } = useSaveBOQSections();
  const isProcessing = isCreating || isUpdating;

  // Hydrate selections if we are editing an existing BOQ
  useEffect(() => {
    if (existingBoq && existingBoq.sections) {
      const existingIds = existingBoq.sections.map((sec) => sec.sectionId);
      setSelectedIds(new Set(existingIds));
    } else {
      // Default behavior for a brand new BOQ: Pre-select P1 as a helpful starting point
      handleSelectP1();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingBoq]);

  // Handlers for selection logic
  const toggleCategory = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => setSelectedIds(new Set(CATEGORY_CATALOG.map((c) => c.id)));
  const handleSelectP1 = () => setSelectedIds(new Set(CATEGORY_CATALOG.filter((c) => c.priority === 'p1').map((c) => c.id)));
  const handleClear = () => setSelectedIds(new Set());

  // Submit Handler using mutateAsync
  const handleNext = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one category to proceed.');
      return;
    }

    // Map the selected string IDs back to the payload shape expected by the backend
    const sectionsPayload = Array.from(selectedIds).map((id) => {
      const cat = CATEGORY_CATALOG.find((c) => c.id === id)!;
      return {
        sectionId: cat.id,
        sectionName: cat.name,
        sectionCode: cat.code,
        govtCode: cat.is,
      };
    });

    try {
      let savedBoqId = existingBoq?._id;

      if (existingBoq && savedBoqId) {
        // Updation Flow
        await updateSections({
          boqId: savedBoqId,
          sections: sectionsPayload,
        });
        toast.success('Categories updated successfully.');
      } else {
        // Creation Flow
        const response = await createDraft({
          projectId,
          sections: sectionsPayload,
        });
        savedBoqId = response._id;
        toast.success('BOQ draft initialized successfully.');
      }

      // Proceed to Step 2 with the secured BOQ ID
      if (savedBoqId) {
        onNextStep(savedBoqId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save categories. Please try again.');
    }
  };

  // Helper for priority badge colors based on your semantic theme
  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'p1': return 'bg-success/10 text-success';
      case 'p2': return 'bg-warning/10 text-warning';
      case 'p3': return 'bg-muted/10 text-muted';
      default: return 'bg-surface-hover text-muted';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Container Card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        
        {/* Card Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border-b border-border bg-surface">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-primary shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-heading">Select BOQ Categories</h2>
              <p className="text-xs text-muted mt-0.5">
                {selectedIds.size} of {CATEGORY_CATALOG.length} selected
              </p>
            </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll} className="text-xs h-8">
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleSelectP1} className="text-xs h-8">
              P1 Only
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} className="text-xs h-8 text-danger hover:bg-danger/5 hover:border-danger/30">
              Clear
            </Button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-6">
          
          {/* Instructions Banner */}
          <div className="flex items-start gap-3 p-3.5 mb-6 rounded-lg bg-primary/5 border border-primary/20 text-primary text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Select the categories relevant to this project. <strong>P1 = Phase 1</strong> formulas (recommended to start). 
              Each selected category will generate a dimension input form on the next step.
            </p>
          </div>

          {/* Grid of Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CATEGORY_CATALOG.map((cat) => {
              const isSelected = selectedIds.has(cat.id);

              return (
                <div
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`
                    relative p-4 rounded-xl border cursor-pointer select-none transition-all duration-200
                    hover:shadow-sm
                    ${isSelected 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-hover/50'
                    }
                  `}
                >
                  {/* Priority Badge */}
                  <span className={`absolute top-3 left-3 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityClasses(cat.priority)}`}>
                    {cat.priority}
                  </span>

                  {/* Selection Checkmark */}
                  {isSelected && (
                    <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-primary" />
                  )}

                  {/* Content */}
                  <div className="mt-6">
                    <h3 className={`text-sm font-semibold mb-1 ${isSelected ? 'text-primary' : 'text-heading'}`}>
                      {cat.name}
                    </h3>
                    <p className="text-xs font-mono text-muted mb-2">
                      {cat.code}
                    </p>
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${isSelected ? 'bg-primary/10 text-primary' : 'bg-surface-hover border border-border text-muted'}`}>
                      {cat.is}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end">
        <Button 
          variant="primary" 
          onClick={handleNext}
          disabled={isProcessing || selectedIds.size === 0}
          className="px-6 py-2.5 shadow-sm font-medium flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next: Enter Dimensions
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

    </div>
  );
};