// import React, { useState, useEffect } from 'react';
// import { ArrowLeft, Play, Calculator, FileText, ChevronDown, ChevronUp } from 'lucide-react';
// import { Input } from '../../components/ui/Input';
// import { Label } from '../../components/ui/Label';
// import { toast } from '../../components/ui/toast/Toast';
// import { Button } from '../../components/ui/Button';
// import { useSaveSectionInputs, type IBOQ } from '../../api_service/boq_api/boqApi';

// // Representative config translated from your HTML. (Add remaining categories as needed)
// const INPUT_FORMS: Record<string, { label: string; fields: any[] }> = {
//   brickwork: {
//     label: 'Brickwork',
//     fields: [
//       { id: 'length', label: 'Wall Length (ft)', type: 'number', placeholder: 'e.g. 40', hint: 'Total linear feet' },
//       { id: 'height', label: 'Wall Height (ft)', type: 'number', placeholder: 'e.g. 10' },
//       { id: 'thickness', label: 'Wall Thickness', type: 'select', options: [{ v: '0.75', l: '9 inch (main)' }, { v: '0.375', l: '4.5 inch (partition)' }] },
//       { id: 'mortarRatio', label: 'Mortar Ratio', type: 'select', options: [{ v: '6', l: '1:6 (standard)' }, { v: '4', l: '1:4 (exposed)' }] },
//       { id: 'waste', label: 'Wastage %', type: 'number', placeholder: '10' },
//     ],
//   },
//   concrete: {
//     label: 'Concrete Mix',
//     fields: [
//       { id: 'length', label: 'Length (ft)', type: 'number', placeholder: 'e.g. 20' },
//       { id: 'width', label: 'Width (ft)', type: 'number', placeholder: 'e.g. 15' },
//       { id: 'depth', label: 'Depth (inches)', type: 'number', placeholder: 'e.g. 6' },
//       { id: 'grade', label: 'Concrete Grade', type: 'select', options: [{ v: 'M20', l: 'M20 (standard)' }, { v: 'M25', l: 'M25' }] },
//       { id: 'waste', label: 'Wastage %', type: 'number', placeholder: '2' },
//     ],
//   },
//   plastering: {
//     label: 'Plastering',
//     fields: [
//       { id: 'area', label: 'Area to Plaster (sqft)', type: 'number', placeholder: 'e.g. 2400' },
//       { id: 'thickness', label: 'Thickness (mm)', type: 'select', options: [{ v: '12', l: '12mm (Internal)' }, { v: '15', l: '15mm (External)' }] },
//       { id: 'ratio', label: 'Mortar Ratio', type: 'select', options: [{ v: '4', l: '1:4' }, { v: '6', l: '1:6' }] },
//     ],
//   }
//   // Add steel, foundation, etc., following the exact same pattern[cite: 1]
// };

// interface BoqStep2DimensionsProps {
//   boq: IBOQ;
//   onBack: () => void;
//   onNextStep: () => void;
// }

// export const BoqStep2Dimensions: React.FC<BoqStep2DimensionsProps> = ({ boq, onBack, onNextStep }) => {
//   // Store form state locally mapped by sectionId
//   const [formData, setFormData] = useState<Record<string, Record<string, string | number>>>({});
//   const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(boq.sections.map(s => s.sectionId)));
  
//   const { mutateAsync: saveInputs, isPending } = useSaveSectionInputs();

//   // Hydrate forms with existing inputs if any
//   useEffect(() => {
//     const initialData: Record<string, Record<string, string | number>> = {};
//     boq.sections.forEach(sec => {
//       initialData[sec.sectionId] = sec.inputs || {};
//     });
//     setFormData(initialData);
//   }, [boq]);

//   const handleInputChange = (sectionId: string, fieldId: string, value: string | number) => {
//     setFormData(prev => ({
//       ...prev,
//       [sectionId]: {
//         ...(prev[sectionId] || {}),
//         [fieldId]: value
//       }
//     }));
//   };

//   const toggleSection = (sectionId: string) => {
//     const next = new Set(expandedSections);
//     if (next.has(sectionId)) next.delete(sectionId);
//     else next.add(sectionId);
//     setExpandedSections(next);
//   };

//   const handleRunEngine = async () => {
//     try {
//       // Save inputs for every section sequentially (or Promise.all)
//       await Promise.all(boq.sections.map(sec => 
//         saveInputs({ 
//           boqId: boq._id, 
//           sectionId: sec.sectionId, 
//           inputs: formData[sec.sectionId] || {} 
//         })
//       ));
//       toast.success('Dimensions saved successfully.');
//       onNextStep(); // Moves to step 3
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to save dimensions.');
//     }
//   };

//   return (
//     <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300">
      
//       {/* Left Column: Input Forms */}
//       <div className="flex-1 space-y-4">
//         {boq.sections.map((section) => {
//           const formConfig = INPUT_FORMS[section.sectionId];
//           const isExpanded = expandedSections.has(section.sectionId);
          
//           if (!formConfig) return null; // Skip if no config matches (fallback)

//           return (
//             <div key={section.sectionId} className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
//               <div 
//                 className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-hover/50 border-b border-transparent transition-colors"
//                 onClick={() => toggleSection(section.sectionId)}
//               >
//                 <div className="flex items-center gap-2">
//                   <Calculator className="w-4 h-4 text-primary" />
//                   <h3 className="font-semibold text-heading text-sm">{formConfig.label}</h3>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
//                     {section.govtCode || section.sectionCode}
//                   </span>
//                   {isExpanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
//                 </div>
//               </div>

//               {isExpanded && (
//                 <div className="p-4 sm:p-5 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-5 bg-page/30">
//                   {formConfig.fields.map((field) => (
//                     <div key={field.id} className="space-y-1.5">
//                       <Label htmlFor={`inp-${section.sectionId}-${field.id}`}>{field.label}</Label>
//                       {field.type === 'select' ? (
//                         <select
//                           id={`inp-${section.sectionId}-${field.id}`}
//                           value={formData[section.sectionId]?.[field.id] || ''}
//                           onChange={(e) => handleInputChange(section.sectionId, field.id, e.target.value)}
//                           className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
//                         >
//                           <option value="">Select option...</option>
//                           {field.options?.map((opt: any) => (
//                             <option key={opt.v} value={opt.v}>{opt.l}</option>
//                           ))}
//                         </select>
//                       ) : (
//                         <Input
//                           id={`inp-${section.sectionId}-${field.id}`}
//                           type={field.type}
//                           placeholder={field.placeholder}
//                           value={formData[section.sectionId]?.[field.id] || ''}
//                           onChange={(e) => handleInputChange(section.sectionId, field.id, e.target.value)}
//                         />
//                       )}
//                       {field.hint && <p className="text-[11px] text-muted">{field.hint}</p>}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           );
//         })}

//         <div className="flex items-center justify-between pt-4">
//           <Button variant="outline" onClick={onBack} disabled={isPending}>
//             <ArrowLeft className="w-4 h-4 mr-2" /> Back
//           </Button>
//           <Button variant="primary" onClick={handleRunEngine} disabled={isPending} className="flex items-center gap-2">
//             {isPending ? 'Saving...' : 'Run Formula Engine'}
//             <Play className="w-4 h-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Right Column: Rate Reference */}
//       <div className="w-full lg:w-80 shrink-0">
//         <div className="bg-surface border border-border rounded-xl shadow-sm sticky top-24">
//           <div className="p-4 border-b border-border">
//             <h3 className="font-semibold text-heading flex items-center gap-2 text-sm">
//               <FileText className="w-4 h-4 text-primary" /> Rate Reference
//             </h3>
//           </div>
//           <div className="p-4 space-y-3">
//             {[
//               ['Cement (OPC 53)', '₹390/bag'],
//               ['River Sand', '₹35/cft'],
//               ['Solid Brick', '₹9/nos'],
//               ['Steel Fe500', '₹60/kg'],
//               ['AAC Block', '₹50/nos'],
//             ].map(([mat, rate], i) => (
//               <div key={i} className="flex justify-between items-center text-sm pb-2 border-b border-border/50 last:border-0 last:pb-0">
//                 <span className="text-muted">{mat}</span>
//                 <span className="font-mono font-medium text-heading">{rate}</span>
//               </div>
//             ))}
//             <div className="text-[10px] text-muted mt-4 pt-2 border-t border-border">
//               Market rates synced from Rate Configuration.
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };




// components/boq/BoqStep2Dimensions.tsx
import React, { useState, useEffect } from 'react';
import { Ruler, PlayCircle, ArrowRight, ArrowLeft, Loader2, Package, HardHat } from 'lucide-react';
import {
  useGetBOQById,
  useSaveSectionInputs,
  useRunFormulaEngine,
  useAssignMaterialToLineItem,
  useAssignLabourToLabourItem,
} from '../../api_service/boq_api/boqApi';
// import { useGetMaterialItemsDropdown } from '../material_api/materialItemApi';
// import { useGetLabourItemsDropdown } from '../labour_api/labourItemApi';
// import { BOQ_INPUT_FORMS } from '../../config/boqInputForms';
import { toast } from '../../components/ui/toast/Toast';
import { Button } from '../../components/ui/Button';
import { useGetMaterialItemsDropdown } from '../../api_service/material_api/materialItemApi';
import { BOQ_INPUT_FORMS } from './config/boqInputForms';
import { useGetLabourItemsDropdown } from '../../api_service/labour_api/labourItemsApi';

interface BoqStep2Props {
  boqId: string;
  onNextStep: () => void;
  onBack: () => void;
}

export const BoqStep2Dimensions: React.FC<BoqStep2Props> = ({ boqId, onNextStep, onBack }) => {
  const { data: boq, isLoading } = useGetBOQById(boqId);
  const { data: materialItems } = useGetMaterialItemsDropdown();
  const { data: labourItems } = useGetLabourItemsDropdown();

  const { mutateAsync: saveInputs } = useSaveSectionInputs();
  const { mutateAsync: runEngine, isPending: isRunning } = useRunFormulaEngine();
  const { mutateAsync: assignMaterial } = useAssignMaterialToLineItem();
  const { mutateAsync: assignLabour } = useAssignLabourToLabourItem();

  const [localInputs, setLocalInputs] = useState<Record<string, Record<string, string | number>>>({});
  const [engineHasRun, setEngineHasRun] = useState(false);

  useEffect(() => {
    if (!boq) return;
    const seeded: Record<string, Record<string, string | number>> = {};
    boq.sections.forEach((s) => { seeded[s.sectionId] = s.inputs || {}; });
    setLocalInputs(seeded);
    // if any section already has lineItems (e.g. reloaded mid-wizard), skip straight to results view
    if (boq.sections.some((s) => s.lineItems.length > 0 || s.labours.length > 0)) {
      setEngineHasRun(true);
    }
  }, [boq]);

  const handleFieldChange = (sectionId: string, fieldId: string, value: string) => {
    setLocalInputs((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [fieldId]: value },
    }));
  };

  const handleSaveSectionInputs = async (sectionId: string) => {
    try {
      await saveInputs({ boqId, sectionId, inputs: localInputs[sectionId] || {} });
    } catch (error: any) {
      toast.error(error.message || 'Failed to save inputs');
    }
  };

  const handleRunEngine = async () => {
    try {
      // save every section's current local inputs first, so the engine reads the latest values
      for (const sectionId of Object.keys(localInputs)) {
        await saveInputs({ boqId, sectionId, inputs: localInputs[sectionId] });
      }
      await runEngine(boqId);
      setEngineHasRun(true);
      toast.success('Quantities calculated. Now assign materials and labour below.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to run formula engine');
    }
  };

  const handleAssignMaterial = async (sectionId: string, lineItemId: string, materialItemId: string) => {
    if (!materialItemId) return;
    try {
      await assignMaterial({ boqId, sectionId, lineItemId, materialItemId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign material');
    }
  };

  const handleAssignLabour = async (sectionId: string, labourRowId: string, labourItemId: string) => {
    if (!labourItemId) return;
    try {
      await assignLabour({ boqId, sectionId, labourRowId, labourItemId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign labour');
    }
  };

  if (isLoading || !boq) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {!engineHasRun && (
        <>
          {boq.sections.map((section) => {
            const form = BOQ_INPUT_FORMS[section.sectionId];
            if (!form) return null;

            return (
              <div key={section.sectionId} className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 p-4 border-b border-border bg-primary/5">
                  <Ruler className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-heading">{section.sectionName}</h3>
                  <span className="text-xs text-muted font-mono ml-auto">{section.sectionCode}</span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {form.fields.map((field) => (
                    <div key={field.id} className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          className="border border-border rounded-lg px-3 py-2 text-sm bg-surface"
                          value={String(localInputs[section.sectionId]?.[field.id] ?? '')}
                          onChange={(e) => handleFieldChange(section.sectionId, field.id, e.target.value)}
                          onBlur={() => handleSaveSectionInputs(section.sectionId)}
                        >
                          <option value="">Select…</option>
                          {field.options?.map((opt) => (
                            <option key={opt.v} value={opt.v}>{opt.l}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          className="border border-border rounded-lg px-3 py-2 text-sm bg-surface"
                          placeholder={field.placeholder}
                          value={localInputs[section.sectionId]?.[field.id] ?? ''}
                          onChange={(e) => handleFieldChange(section.sectionId, field.id, e.target.value)}
                          onBlur={() => handleSaveSectionInputs(section.sectionId)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button variant="primary" onClick={handleRunEngine} disabled={isRunning}>
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              Run Formula Engine
            </Button>
          </div>
        </>
      )}

      {engineHasRun && (
        <>
          {boq.sections.map((section) => (
            <div key={section.sectionId} className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
                <h3 className="text-sm font-semibold text-heading">{section.sectionName}</h3>
                <span className="text-sm font-mono font-semibold text-primary">
                  ₹{section.subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* MATERIAL LINE ITEMS */}
              {section.lineItems.map((item) => (
                <div key={item._id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0">
                  <Package className="w-4 h-4 text-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-heading truncate">{item.description}</p>
                    <p className="text-xs text-muted">{item.quantity} {item.unit}</p>
                  </div>
                  <select
                    className="border border-border rounded-lg px-2 py-1.5 text-xs bg-surface min-w-[200px]"
                    value={item.materialItemId ?? ''}
                    onChange={(e) => handleAssignMaterial(section.sectionId, item._id, e.target.value)}
                  >
                    <option value="">Select material…</option>
                    {materialItems?.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.productName}{m.brand ? ` — ${m.brand}` : ''} (₹{m.currentRate}/{m.unit})
                      </option>
                    ))}
                  </select>
                  <span className="text-sm font-mono font-medium text-heading w-24 text-right shrink-0">
                    {item.amount ? `₹${item.amount.toLocaleString('en-IN')}` : '—'}
                  </span>
                </div>
              ))}

              {/* LABOUR ITEMS */}
              {section.labours.map((labour) => (
                <div key={labour._id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 bg-warning/5">
                  <HardHat className="w-4 h-4 text-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-heading truncate">{labour.description}</p>
                    <p className="text-xs text-muted">{labour.quantity} {labour.unit} · suggested: {labour.labourType}</p>
                  </div>
                  <select
                    className="border border-border rounded-lg px-2 py-1.5 text-xs bg-surface min-w-[200px]"
                    value={labour.labourItemId ?? ''}
                    onChange={(e) => handleAssignLabour(section.sectionId, labour._id, e.target.value)}
                  >
                    <option value="">Select labour…</option>
                    {labourItems?.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.role} ({l.skillLevel}) — ₹{l.rate}/{labour.unit}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm font-mono font-medium text-heading w-24 text-right shrink-0">
                    {labour.amount ? `₹${labour.amount.toLocaleString('en-IN')}` : '—'}
                  </span>
                </div>
              ))}
            </div>
          ))}

          <div className="bg-navy text-white rounded-xl p-5 flex items-center justify-between">
            <span className="text-sm text-white/60 uppercase tracking-wide">Total BOQ Value (so far)</span>
            <span className="text-2xl font-mono font-semibold">
              ₹{boq.totalCost.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setEngineHasRun(false)}>
              <ArrowLeft className="w-4 h-4" /> Edit Dimensions
            </Button>
            <Button variant="primary" onClick={onNextStep}>
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};