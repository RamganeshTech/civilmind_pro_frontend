import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Calculator, AlertTriangle } from 'lucide-react';
import { useGetBOQById, useRunFormulaEngine } from '../../api_service/boq_api/boqApi';
import { toast } from '../../components/ui/toast/Toast';
import { Button } from '../../components/ui/Button';

interface BoqStep3ViewerProps {
  boqId: string;
  onBack: () => void;
  onApproveStep: () => void; // Proceeds to approval/export
}

export const BoqStep3Viewer: React.FC<BoqStep3ViewerProps> = ({ boqId, onBack, onApproveStep }) => {
  const [engineRan, setEngineRan] = useState(false);

  // Queries & Mutations
  const { data: boq, isLoading: isFetching, refetch } = useGetBOQById(boqId);
  const { mutateAsync: runEngine, isPending: isRunning } = useRunFormulaEngine();

  // Trigger engine calculation automatically on mount if line items are empty
  useEffect(() => {
    const executeEngine = async () => {
      if (!boq) return;
      
      // Check if this BOQ needs processing (e.g. no line items exist yet)
      const needsCalculation = boq.sections.some(s => s.lineItems.length === 0);
      
      if (needsCalculation && !engineRan) {
        try {
          setEngineRan(true); // Prevent loops
          await runEngine(boqId);
          toast.success('BOQ calculations completed.');
          refetch();
        } catch (error: any) {
          toast.error(error.message || 'Formula engine failed.');
        }
      }
    };
    
    executeEngine();
  }, [boq, boqId, runEngine, engineRan, refetch]);

  if (isFetching || isRunning) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-in fade-in">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4"></div>
        <h3 className="text-lg font-semibold text-heading">Formula Engine Running</h3>
        <p className="text-sm text-muted mt-2">Calculating quantities and generating line items...</p>
      </div>
    );
  }

  if (!boq) return null;

  const totalCost = boq.totalCost || 0;
  const matCost = boq.materialsTotal || 0;
  const labCost = boq.labourTotal || 0;

  return (
    <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in duration-300">
      
      {/* Left Column: Sections & Line Items */}
      <div className="flex-1 space-y-6">
        
        {/* Warnings Box */}
        {boq.warnings && boq.warnings.length > 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 space-y-2">
            {boq.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-warning text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Generated Sections */}
        <div className="space-y-4">
          {boq.sections.map((sec) => (
            <div key={sec.sectionId} className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="bg-page/50 p-4 border-b border-border flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-heading flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-primary" /> {sec.sectionName}
                  </h3>
                  <p className="text-[11px] font-mono text-muted mt-1">{sec.lineItems.length} line items generated</p>
                </div>
                <div className="text-lg font-mono font-semibold text-primary">
                  ₹{sec.subtotal?.toLocaleString('en-IN') || 0}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-surface text-muted text-xs uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-4 py-2 font-medium">Description</th>
                      <th className="px-4 py-2 font-medium text-center">Unit</th>
                      <th className="px-4 py-2 font-medium text-right">Qty</th>
                      <th className="px-4 py-2 font-medium text-right">Rate (₹)</th>
                      <th className="px-4 py-2 font-medium text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sec.lineItems.map((li, idx) => (
                      <tr key={idx} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-heading font-medium truncate max-w-sm">{li.description}</p>
                          {li.govtCode && <p className="text-[10px] text-muted font-mono mt-0.5">{li.govtCode}</p>}
                        </td>
                        <td className="px-4 py-3 text-center text-muted">{li.unit}</td>
                        <td className="px-4 py-3 text-right font-mono text-muted">{li.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono text-muted">{li.rate}</td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-heading">{li.amount}</td>
                      </tr>
                    ))}
                    {sec.lineItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-muted">No line items generated.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Edit Inputs
          </Button>
          <Button variant="primary" onClick={onApproveStep} className="flex items-center gap-2">
            Send for Approval <CheckCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right Column: Financial Summary */}
      <div className="w-full xl:w-80 shrink-0 space-y-4">
        {/* Total Highlight Card */}
        <div className="bg-primary text-white rounded-xl p-6 shadow-sm">
          <p className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1">Total Estimated BOQ</p>
          <h2 className="text-3xl font-mono font-bold mb-4">₹{totalCost.toLocaleString('en-IN')}</h2>
          
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-2">
            <div>
              <p className="text-xs text-white/60 mb-0.5">Materials</p>
              <p className="font-mono font-medium text-sm">₹{matCost.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-0.5">Labour</p>
              <p className="font-mono font-medium text-sm">₹{labCost.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-heading mb-4 border-b border-border pb-2">Category Breakdown</h3>
          <div className="space-y-3">
            {boq.sections.map((sec) => {
              const pct = totalCost > 0 ? ((sec.subtotal / totalCost) * 100).toFixed(1) : '0.0';
              return (
                <div key={sec.sectionId} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end text-xs">
                    <span className="font-medium text-heading truncate pr-2">{sec.sectionName}</span>
                    <span className="font-mono text-muted">₹{sec.subtotal?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="text-[10px] text-muted w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};