import React from 'react';
import { Persona, PersonaConfiguration } from '../types';
import { AnalysisDetails } from './AnalysisDetails';
import { PersonaOutput } from './PersonaOutput';
import { PersonaBuilder } from './PersonaBuilder';
import { SparklesIcon } from './icons/SparklesIcon';

interface ResultsDisplayProps {
    personas: Persona[];
    isLoading: boolean;
    error: string | null;
    showWelcome: boolean;
    // Selection props
    selection: string[];
    onToggleSelection: (personaId: string) => void;
    onLaunchStudio: () => void;
    setIsComparisonModalOpen: (isOpen: boolean) => void;
    // Persona Builder Props
    editingPersonaId: string | null;
    onEdit: (personaId: string) => void;
    onCancel: () => void;
    onSave: (personaId: string, config: PersonaConfiguration) => void;
    onDelete: (personaId: string) => void;
}

const WelcomeState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#333e48] rounded-xl shadow-lg">
        <SparklesIcon className="w-16 h-16 text-[#e2a32d] mb-4" />
        <h2 className="text-2xl font-bold text-gray-200">Ready for Analysis</h2>
        <p className="text-[#95aac0] mt-2 max-w-sm">
            Upload your document on the left and click "Analyze" to generate an SFL persona.
        </p>
    </div>
);

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#333e48] rounded-xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e2a32d] mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-200">Analyzing Document...</h2>
        <p className="text-[#95aac0] mt-2">
            Performing linguistic analysis. This might take a moment.
        </p>
    </div>
);

const ErrorState: React.FC<{ error: string }> = ({ error }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-600/20 border border-red-600 rounded-xl shadow-lg">
         <svg className="w-16 h-16 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h2 className="text-2xl font-bold text-gray-200">Process Failed</h2>
        <p className="text-red-300 mt-2 max-w-md">{error}</p>
    </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = (props) => {
    const { 
        personas, isLoading, error, showWelcome,
        editingPersonaId, onEdit, onCancel, onSave, onDelete,
        selection, onToggleSelection, onLaunchStudio, setIsComparisonModalOpen
    } = props;

    const renderContent = () => {
        if (isLoading && personas.length === 0) return <LoadingState />;
        if (error && personas.length === 0) return <ErrorState error={error} />;
        if (showWelcome) return <WelcomeState />;

        if (personas.length > 0) {
            return (
                 <div className="space-y-8">
                    {personas.length > 1 && (
                        <div className="bg-[#333e48] rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-[#e2a32d] mb-2">Engage with Personas</h2>
                            <p className="text-[#95aac0] mb-4 text-sm">Select two personas to compare them or to generate a dialogue in the studio.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                {personas.map(persona => (
                                    <label key={persona.id} className={`flex items-center space-x-3 bg-[#212934] p-3 rounded-lg cursor-pointer hover:bg-[#2b3542] transition-colors border-2 ${selection.includes(persona.id) ? 'border-[#e2a32d]' : 'border-transparent'}`}>
                                        <input
                                            type="checkbox"
                                            checked={selection.includes(persona.id)}
                                            onChange={() => onToggleSelection(persona.id)}
                                            disabled={!selection.includes(persona.id) && selection.length >= 2}
                                            className="form-checkbox h-5 w-5 rounded bg-[#5c6f7e] border-[#95aac0] text-[#c36e26] focus:ring-[#e2a32d] disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <span className="font-medium text-gray-200">{persona.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => setIsComparisonModalOpen(true)}
                                    disabled={selection.length !== 2}
                                    className="px-5 py-2 bg-[#5c6f7e] text-white font-semibold rounded-lg shadow-md hover:bg-[#95aac0] disabled:bg-[#333e48] disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    Compare Selected ({selection.length}/2)
                                </button>
                                <button
                                    onClick={onLaunchStudio}
                                    disabled={selection.length !== 2}
                                    className="px-5 py-2 bg-[#c36e26] text-white font-semibold rounded-lg shadow-md hover:bg-[#e2a32d] disabled:bg-[#5c6f7e] disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    Dialogue Studio ({selection.length}/2)
                                </button>
                            </div>
                        </div>
                    )}

                    {personas.map(persona => {
                        const isEditingThis = editingPersonaId === persona.id;
                        return (
                            <div key={persona.id} className="bg-[#333e48] rounded-xl">
                                {isEditingThis ? (
                                    <PersonaBuilder
                                        personaName={persona.name}
                                        initialConfig={persona.analysis.personaConfiguration}
                                        onSave={(newConfig) => onSave(persona.id, newConfig)}
                                        onCancel={onCancel}
                                    />
                                ) : (
                                    <details open>
                                        <summary className="text-xl font-bold text-[#e2a32d] p-4 cursor-pointer list-none flex justify-between items-center">
                                            {persona.name}
                                            <span className="text-[#95aac0] text-sm font-normal details-arrow">Toggle Details</span>
                                        </summary>
                                        <div className="p-4 border-t border-[#5c6f7e] space-y-6">
                                            <AnalysisDetails analysis={persona.analysis.sflAnalysis} mapping={persona.analysis.personaMapping} />
                                            <PersonaOutput
                                                personaName={persona.name}
                                                config={persona.analysis.personaConfiguration}
                                                onEdit={() => onEdit(persona.id)}
                                                onDelete={() => onDelete(persona.id)}
                                            />
                                        </div>
                                    </details>
                                )}
                            </div>
                        )
                    })}
                    
                    {error && !isLoading && <div className="mt-8"><ErrorState error={error} /></div>}
                </div>
            );
        }
        
        return <WelcomeState />;
    };

    return (
        <div className="h-full mt-8 lg:mt-0">
            <style>{`.details-arrow { transition: transform 0.2s; } details[open] .details-arrow { transform: rotate(90deg); } .form-checkbox { appearance: none; -webkit-appearance: none; background-color: #5c6f7e; border-radius: 0.25rem; display: inline-block; position: relative; } .form-checkbox:checked { background-color: #c36e26; } .form-checkbox:checked::after { content: '✓'; font-size: 0.9rem; color: white; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }`}</style>
             <div className="h-full max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
                {renderContent()}
            </div>
        </div>
    );
};
