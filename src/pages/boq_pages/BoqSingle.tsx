// pages/BoqSingle.tsx
import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Check, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { BoqStep1Categories } from './BoqStep1Categories';
import { BoqStep2Dimensions } from './BoqStep2Dimensions';
import { BoqStep3Viewer } from './BoqStep3Viewer';
import { useGetProjectsDropdown } from '../../api_service/project_api/projectApi';
import { useGetBOQById } from '../../api_service/boq_api/boqApi';

const WIZARD_STEPS = [
    { id: 1, label: 'Categories' },
    { id: 2, label: 'Dimensions' },
    { id: 3, label: 'Formula Engine' },
    { id: 4, label: 'Approve' },
    { id: 5, label: 'Export' },
];

export const BoqSingle: React.FC = () => {
    const { boqId: paramBoqId } = useParams();
    const [searchParams] = useSearchParams();

    const isCreated = searchParams.get('isCreated') === 'true' || paramBoqId === 'new';
    const urlBoqId = searchParams.get('boqId') || (paramBoqId !== 'new' ? paramBoqId : undefined);

    // State
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [boqId, setBoqId] = useState<string | undefined>(!isCreated && urlBoqId ? urlBoqId : undefined);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    // Queries
    const { data: rawProjects = [], isLoading: isFetchingProjects } = useGetProjectsDropdown();
    const { data: boq, isLoading: isFetchingBoq } = useGetBOQById(boqId);

    console.log("data in the boq", boq)
    // Safely ensure projects is an array before mapping (prevents .map is not a function crash)
    const projects = Array.isArray(rawProjects)
        ? rawProjects
        : (rawProjects as any)?.projects || (rawProjects as any)?.data || [];

    // Early return for update flow missing ID
    if (!isCreated && !urlBoqId) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 text-danger bg-page min-h-screen">
                <AlertCircle className="w-10 h-10 mb-4" />
                <p className="font-semibold text-lg">Missing BOQ ID</p>
                <p className="text-sm">Cannot edit a BOQ without a valid boqId in the URL.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-page min-h-screen text-body p-4 sm:p-6">

            {/* ── TOP BAR: PROJECT SELECTION ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 mb-6 bg-surface border border-border rounded-xl shadow-sm">
                <div>
                    <h1 className="text-lg font-bold text-heading">
                        {isCreated ? 'Create New BOQ' : 'Edit BOQ Document'}
                    </h1>
                    {boqId && <p className="text-xs text-muted font-mono mt-0.5">ID: {boqId}</p>}
                </div>

                {isCreated && (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Building2 className="w-4 h-4 text-muted shrink-0" />
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            disabled={isFetchingProjects || currentStep > 1}
                            className="w-full sm:w-64 flex h-9 rounded-md border border-border bg-surface px-3 py-1.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Select a project to begin...</option>
                            {projects.map((p: any) => (
                                <option key={p?._id || Math.random()} value={p?._id}>
                                    {p?.name || `Project ${p?.projectCode || p?._id?.slice(-4)}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* ── WIZARD PROGRESS BAR ────────────────────────────────────────────── */}
            <div className="flex items-center bg-surface border border-border rounded-xl p-4 sm:p-6 mb-6 shadow-sm overflow-x-auto">
                {WIZARD_STEPS.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isPast = currentStep > step.id;

                    return (
                        <div key={step.id} className="flex-1 flex flex-col items-center relative min-w-[80px]">
                            {index !== WIZARD_STEPS.length - 1 && (
                                <div
                                    className={`absolute top-[14px] left-[55%] right-[-55%] h-0.5 z-0 transition-colors duration-300
                    ${isPast ? 'bg-primary' : 'bg-border'}
                  `}
                                />
                            )}
                            <button
                                type="button"
                                disabled={!isPast && !isActive}
                                onClick={() => isPast && setCurrentStep(step.id)}
                                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isPast
                                        ? 'bg-primary border-2 border-primary text-white cursor-pointer hover:bg-primary-hover'
                                        : isActive
                                            ? 'bg-primary border-2 border-primary text-white ring-4 ring-primary/15'
                                            : 'bg-surface border-2 border-border text-muted cursor-not-allowed'
                                    }
                `}
                            >
                                {isPast ? <Check className="w-4 h-4" /> : step.id}
                            </button>
                            <span
                                className={`text-[10px] sm:text-xs mt-2 text-center whitespace-nowrap font-medium transition-colors
                  ${isActive ? 'text-primary font-semibold' : isPast ? 'text-primary/80' : 'text-muted'}
                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* ── STEP CONTENT AREA ──────────────────────────────────────────────── */}
            <div className="flex-1">
                {currentStep === 1 && (
                    isCreated && !selectedProjectId ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-surface border border-border rounded-xl border-dashed">
                            <Building2 className="w-8 h-8 text-muted mb-3" />
                            <p className="text-heading font-medium">No Project Selected</p>
                            <p className="text-sm text-muted mt-1">Please select a project from the dropdown above to start creating a BOQ.</p>
                        </div>
                    ) : (
                        <BoqStep1Categories
                            // SAFELY handle the projectId fallback here
                            projectId={isCreated ? selectedProjectId : (boq?.projectId || '')}
                            existingBoq={boq}
                            onNextStep={(newBoqId) => {
                                setBoqId(newBoqId);
                                setCurrentStep(2);
                            }}
                        />
                    )
                )}

                {currentStep === 2 && (
                    isFetchingBoq ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                            <p className="text-muted text-sm">Loading BOQ dimensions...</p>
                        </div>
                    ) : boq ? (
                        <BoqStep2Dimensions
                            //   boq={boq}
                            boqId={boqId!} // Pass boqId instead of boq
                            onBack={() => setCurrentStep(1)}
                            onNextStep={() => setCurrentStep(3)}
                        />
                    ) : (
                        <div className="text-center text-danger p-10">Failed to load BOQ details.</div>
                    )
                )}

                {currentStep === 3 && boqId && (
                    <BoqStep3Viewer
                        boqId={boqId}
                        onBack={() => setCurrentStep(2)}
                        onApproveStep={() => setCurrentStep(4)}
                    />
                )}

                {currentStep === 4 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-xl">
                        <Check className="w-12 h-12 text-success mb-4" />
                        <h2 className="text-xl font-bold text-heading">Approval Step</h2>
                        <p className="text-muted mt-2 mb-6">This section will handle BOQ finalization and locking.</p>
                        <button onClick={() => setCurrentStep(3)} className="text-sm text-primary hover:underline">
                            Go back to Formula Viewer
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default BoqSingle;