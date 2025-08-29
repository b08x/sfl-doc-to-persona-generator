import React, { useState, useCallback, useEffect } from 'react';
import { DocumentInput } from './components/DocumentInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { analyzeDocument, getAvailableModels } from './services/geminiService';
import { PersonaConfiguration, Persona } from './types';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { HelpIcon } from './components/icons/HelpIcon';
import { HelpMenu } from './components/HelpMenu';
import { ModelSettings } from './components/ModelSettings';
import { PersonaComparison } from './components/PersonaComparison';
import { DialogueStudio } from './components/DialogueStudio';

const App: React.FC = () => {
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showWelcome, setShowWelcome] = useState<boolean>(true);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // View management
    const [currentView, setCurrentView] = useState<'main' | 'dialogueStudio'>('main');
    const [dialoguePersonas, setDialoguePersonas] = useState<[Persona, Persona] | null>(null);

    // Model settings state
    const [serviceProvider, setServiceProvider] = useState<string>('Gemini');
    const [availableModels, setAvailableModels] = useState<{ [provider: string]: string[] }>({});
    const [isModelsLoading, setIsModelsLoading] = useState<boolean>(false);
    const [modelsError, setModelsError] = useState<string | null>(null);
    const [model, setModel] = useState<string>('gemini-2.5-flash');
    const [thinkingBudget, setThinkingBudget] = useState<string>(''); // Keep as string for input control

    // Persona builder state
    const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
    const [editingPersonaDetailsId, setEditingPersonaDetailsId] = useState<string | null>(null);

    // Persona selection state (for comparison or dialogue)
    const [selection, setSelection] = useState<string[]>([]);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);


     const parseThinkingBudget = useCallback((budget: string): number | undefined => {
        if (budget.trim() === '') return undefined;
        const num = parseInt(budget, 10);
        return isNaN(num) || num < 0 ? undefined : num;
    }, []);

    useEffect(() => {
        const fetchModels = async () => {
            if (!serviceProvider) return; 
            if (availableModels[serviceProvider]) { 
                if (!availableModels[serviceProvider].includes(model)) {
                    setModel(availableModels[serviceProvider][0] || '');
                }
                return;
            }

            setIsModelsLoading(true);
            setModelsError(null);

            try {
                let models: string[] = [];
                if (serviceProvider === 'Gemini') {
                    models = await getAvailableModels();
                }
                
                setAvailableModels(prev => ({ ...prev, [serviceProvider]: models }));
                
                if (!models.includes(model)) {
                    setModel(models[0] || '');
                }

            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred';
                setModelsError(`Failed to load models for ${serviceProvider}: ${message}`);
                setModel('');
            } finally {
                setIsModelsLoading(false);
            }
        };

        fetchModels();
    }, [serviceProvider, model, availableModels]);

    const handleAnalyze = useCallback(async (text: string) => {
        if (!text.trim()) {
            setError('The document appears to be empty.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setShowWelcome(false);
        setEditingPersonaId(null);
        setEditingPersonaDetailsId(null);
        setSelection([]);

        try {
            const result = await analyzeDocument(text, model, parseThinkingBudget(thinkingBudget));
            const newPersona: Persona = {
                id: `persona-${Date.now()}`,
                name: `Persona ${personas.length + 1}`,
                description: '',
                analysis: result,
            };
            setPersonas(prev => [...prev, newPersona]);
        } catch (e) {
            if (e instanceof Error) {
                setError(`Analysis failed: ${e.message}`);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [personas.length, model, thinkingBudget, parseThinkingBudget]);

    const handleEdit = (personaId: string) => {
        setEditingPersonaId(personaId);
        setEditingPersonaDetailsId(null); // Close details editor if open
    };
    
    const handleCancel = () => {
        setEditingPersonaId(null);
    };
    
    const handleCancelDetails = () => {
        setEditingPersonaDetailsId(null);
    };
    
    const handleEditDetails = (personaId: string) => {
        setEditingPersonaDetailsId(personaId);
        setEditingPersonaId(null); // Close config editor if open
    };

    const handleSave = (personaId: string, newConfig: PersonaConfiguration) => {
        setPersonas(prev => prev.map(p => {
            if (p.id === personaId) {
                return {
                    ...p,
                    analysis: {
                        ...p.analysis,
                        personaConfiguration: newConfig
                    }
                };
            }
            return p;
        }));
        setEditingPersonaId(null);
    };

    const handleSaveDetails = (personaId: string, updates: { name: string; description: string }) => {
        setPersonas(prev => prev.map(p => (p.id === personaId ? { ...p, ...updates } : p)));
        setEditingPersonaDetailsId(null);
    };

    const handleDelete = (personaId: string) => {
        if (window.confirm("Are you sure you want to delete this persona?")) {
            setPersonas(prev => prev.filter(p => p.id !== personaId));
            setSelection(prev => prev.filter(id => id !== personaId));
        }
    };
    
     const handleReorder = (dragId: string, dropId: string) => {
        const dragIndex = personas.findIndex(p => p.id === dragId);
        const dropIndex = personas.findIndex(p => p.id === dropId);
        if (dragIndex === -1 || dropIndex === -1) return;
        
        setPersonas(prev => {
            const newPersonas = [...prev];
            const [draggedItem] = newPersonas.splice(dragIndex, 1);
            newPersonas.splice(dropIndex, 0, draggedItem);
            return newPersonas;
        });
    };

    const handleToggleSelection = (personaId: string) => {
        setSelection(prev => {
            if (prev.includes(personaId)) {
                return prev.filter(id => id !== personaId);
            }
            if (prev.length < 2) {
                return [...prev, personaId];
            }
            return prev;
        });
    };
    
    const handleLaunchStudio = () => {
        if (selection.length !== 2) return;
        const selectedPersonas = personas.filter(p => selection.includes(p.id)) as [Persona, Persona];
        if (selectedPersonas.length === 2) {
            setDialoguePersonas(selectedPersonas);
            setCurrentView('dialogueStudio');
        } else {
            setError("Could not find the selected personas.");
        }
    };

    const selectedForComparison = personas.filter(p => selection.includes(p.id));

    if (currentView === 'dialogueStudio' && dialoguePersonas) {
        return (
            <DialogueStudio
                initialPersonas={dialoguePersonas}
                onBack={() => {
                    setCurrentView('main');
                    setDialoguePersonas(null);
                }}
                onPersonaUpdate={handleSave} // Re-use the main save logic
                model={model}
                thinkingBudget={parseThinkingBudget(thinkingBudget)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#212934] text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8 relative">
                    <h1 className="text-3xl sm:text-4xl font-bold text-[#e2a32d] flex items-center justify-center gap-3">
                        <SparklesIcon />
                        SFL Document-to-Persona Generator
                    </h1>
                    <p className="mt-2 text-lg text-[#95aac0]">
                        Upload documents, build personas, and generate & refine dialogue.
                    </p>
                    <button
                        onClick={() => setIsHelpOpen(true)}
                        className="absolute top-0 right-0 p-2 text-[#95aac0] hover:text-[#e2a32d] transition-colors"
                        aria-label="Open settings guide"
                        title="Open SFL Settings Guide"
                    >
                        <HelpIcon />
                    </button>
                </header>
                
                 <ModelSettings
                    model={model}
                    setModel={setModel}
                    thinkingBudget={thinkingBudget}
                    setThinkingBudget={setThinkingBudget}
                    serviceProvider={serviceProvider}
                    setServiceProvider={setServiceProvider}
                    availableModels={availableModels[serviceProvider] || []}
                    isModelsLoading={isModelsLoading}
                    modelsError={modelsError}
                />

                <main className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
                    <DocumentInput
                        key={personas.length} 
                        onAnalyze={handleAnalyze}
                        isLoading={isLoading}
                    />
                    <ResultsDisplay
                        personas={personas}
                        isLoading={isLoading}
                        error={error}
                        showWelcome={showWelcome}

                        selection={selection}
                        onToggleSelection={handleToggleSelection}
                        onLaunchStudio={handleLaunchStudio}
                        setIsComparisonModalOpen={setIsComparisonModalOpen}

                        editingPersonaId={editingPersonaId}
                        onEdit={handleEdit}
                        onCancel={handleCancel}
                        onSave={handleSave}
                        onDelete={handleDelete}
                        onReorder={handleReorder}
                        
                        editingPersonaDetailsId={editingPersonaDetailsId}
                        onEditDetails={handleEditDetails}
                        onSaveDetails={handleSaveDetails}
                        onCancelDetails={handleCancelDetails}
                    />
                </main>
            </div>
            <HelpMenu isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
            {isComparisonModalOpen && selectedForComparison.length === 2 && (
                <PersonaComparison
                    personaA={selectedForComparison[0]}
                    personaB={selectedForComparison[1]}
                    onClose={() => setIsComparisonModalOpen(false)}
                />
            )}
        </div>
    );
};

export default App;