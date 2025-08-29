
import React, { useState, useCallback, useEffect } from 'react';
import { DocumentInput } from './components/DocumentInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { analyzeDocument, generateDialogue, refineDialogueTurn, generateNextDialogueTurn, getAvailableModels } from './services/geminiService';
import { FullAnalysisResult, PersonaConfiguration, Persona, DialogueTurn } from './types';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { HelpIcon } from './components/icons/HelpIcon';
import { HelpMenu } from './components/HelpMenu';
import { ModelSettings } from './components/ModelSettings';
import { PersonaComparison } from './components/PersonaComparison';

const App: React.FC = () => {
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showWelcome, setShowWelcome] = useState<boolean>(true);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Model settings state
    const [serviceProvider, setServiceProvider] = useState<string>('Gemini');
    const [availableModels, setAvailableModels] = useState<{ [provider: string]: string[] }>({});
    const [isModelsLoading, setIsModelsLoading] = useState<boolean>(false);
    const [modelsError, setModelsError] = useState<string | null>(null);
    const [model, setModel] = useState<string>('gemini-2.5-flash');
    const [thinkingBudget, setThinkingBudget] = useState<string>(''); // Keep as string for input control

    // Dialogue generation state
    const [dialogueTopic, setDialogueTopic] = useState<string>('');
    const [showContext, setShowContext] = useState<string>('');
    const [showLength, setShowLength] = useState<string>('Short (1-3 mins)');
    const [isGeneratingDialogue, setIsGeneratingDialogue] = useState<boolean>(false);

    // Script refinement state
    const [script, setScript] = useState<DialogueTurn[]>([]);
    const [viewMode, setViewMode] = useState<'editor' | 'final'>('editor');
    const [editingTurnId, setEditingTurnId] = useState<string | null>(null);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isRefining, setIsRefining] = useState<string | null>(null); // holds turnId being refined
    const [isAddingLine, setIsAddingLine] = useState<boolean>(false);

    // Persona builder state
    const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
    const [draftConfig, setDraftConfig] = useState<PersonaConfiguration | null>(null);

    // Persona comparison state
    const [comparisonSelection, setComparisonSelection] = useState<string[]>([]);
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
    }, [serviceProvider]);

    const handleAnalyze = useCallback(async (text: string) => {
        if (!text.trim()) {
            setError('The document appears to be empty.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setShowWelcome(false);
        setScript([]);
        setEditingPersonaId(null);
        setComparisonSelection([]);

        try {
            const result = await analyzeDocument(text, model, parseThinkingBudget(thinkingBudget));
            const newPersona: Persona = {
                id: `persona-${Date.now()}`,
                name: `Persona ${personas.length + 1}`,
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

    const parseDialogueToScript = (dialogue: string, personaA: Persona, personaB: Persona): DialogueTurn[] => {
        const turns: DialogueTurn[] = [];
        const lines = dialogue.split('\n').filter(line => line.trim() !== '');
        
        lines.forEach((line, index) => {
            const matchA = line.match(/^Speaker A:\s*(.*)/);
            const matchB = line.match(/^Speaker B:\s*(.*)/);

            if (matchA) {
                turns.push({ id: `turn-${Date.now()}-${index}`, speaker: 'Speaker A', personaName: personaA.name, text: matchA[1].trim() });
            } else if (matchB) {
                turns.push({ id: `turn-${Date.now()}-${index}`, speaker: 'Speaker B', personaName: personaB.name, text: matchB[1].trim() });
            }
        });
        return turns;
    };


    const handleGenerateDialogue = useCallback(async () => {
        if (personas.length < 2) return;
         if (!dialogueTopic.trim()) {
            setError("Please enter a dialogue topic.");
            return;
        }
        setIsGeneratingDialogue(true);
        setScript([]);
        setError(null);
        setViewMode('editor');

        try {
            const configs: [PersonaConfiguration, PersonaConfiguration] = [
                personas[0].analysis.personaConfiguration,
                personas[1].analysis.personaConfiguration
            ];
            const dialogue = await generateDialogue(configs, dialogueTopic, showContext, showLength, model, parseThinkingBudget(thinkingBudget));
            const structuredScript = parseDialogueToScript(dialogue, personas[0], personas[1]);
            setScript(structuredScript);
        } catch (e) {
             if (e instanceof Error) {
                setError(`Dialogue generation failed: ${e.message}`);
            } else {
                setError('An unknown error occurred during dialogue generation.');
            }
        } finally {
            setIsGeneratingDialogue(false);
        }
    }, [dialogueTopic, personas, showContext, showLength, model, thinkingBudget, parseThinkingBudget]);
    
    const handleRefineTurn = async () => {
        if (!editingTurnId || !refinePrompt.trim()) return;
        
        const turnToRefine = script.find(t => t.id === editingTurnId);
        if (!turnToRefine) return;
        
        setIsRefining(editingTurnId);
        setError(null);

        try {
            const personaConfig = turnToRefine.speaker === 'Speaker A' 
                ? personas[0].analysis.personaConfiguration 
                : personas[1].analysis.personaConfiguration;
            
            const refinedText = await refineDialogueTurn(turnToRefine.text, personaConfig, refinePrompt, model, parseThinkingBudget(thinkingBudget));

            setScript(prevScript => prevScript.map(turn => 
                turn.id === editingTurnId ? { ...turn, text: refinedText } : turn
            ));
            
            setEditingTurnId(null);
            setRefinePrompt('');

        } catch (e) {
            if (e instanceof Error) {
                setError(`Refinement failed: ${e.message}`);
            } else {
                setError('An unknown error occurred during refinement.');
            }
        } finally {
            setIsRefining(null);
        }
    };
    
    const handleGenerateNextTurn = async () => {
        if (script.length === 0) return;
        
        setIsAddingLine(true);
        setError(null);
        
        try {
            const lastTurn = script[script.length - 1];
            const nextSpeaker = lastTurn.speaker === 'Speaker A' ? 'Speaker B' : 'Speaker A';
            const nextPersona = nextSpeaker === 'Speaker A' ? personas[0] : personas[1];
            const nextSpeakerConfig = nextPersona.analysis.personaConfiguration;
            
            const history = script.slice(-4); // Use last 4 turns for context
            
            const newText = await generateNextDialogueTurn(history, nextSpeaker, nextSpeakerConfig, model, parseThinkingBudget(thinkingBudget));
            
            const newTurn: DialogueTurn = {
                id: `turn-${Date.now()}`,
                speaker: nextSpeaker,
                personaName: nextPersona.name,
                text: newText,
            };
            
            setScript(prev => [...prev, newTurn]);

        } catch (e) {
            if (e instanceof Error) {
                setError(`Failed to add line: ${e.message}`);
            } else {
                setError('An unknown error occurred while adding a new line.');
            }
        } finally {
            setIsAddingLine(false);
        }
    };


    const handleEdit = (personaId: string) => {
        const personaToEdit = personas.find(p => p.id === personaId);
        if (personaToEdit) {
            setDraftConfig(JSON.parse(JSON.stringify(personaToEdit.analysis.personaConfiguration)));
            setEditingPersonaId(personaId);
        }
    };
    
    const handleCancel = () => {
        setEditingPersonaId(null);
        setDraftConfig(null);
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
        setDraftConfig(null);
    };

    const handleDelete = (personaId: string) => {
        if (window.confirm("Are you sure you want to delete this persona?")) {
            setPersonas(prev => prev.filter(p => p.id !== personaId));
            setComparisonSelection(prev => prev.filter(id => id !== personaId));
        }
    };

    const handleToggleCompare = (personaId: string) => {
        setComparisonSelection(prev => {
            if (prev.includes(personaId)) {
                return prev.filter(id => id !== personaId);
            }
            if (prev.length < 2) {
                return [...prev, personaId];
            }
            return prev;
        });
    };
    
    const selectedForComparison = personas.filter(p => comparisonSelection.includes(p.id));

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

                        comparisonSelection={comparisonSelection}
                        onToggleCompare={handleToggleCompare}
                        setIsComparisonModalOpen={setIsComparisonModalOpen}

                        dialogueTopic={dialogueTopic}
                        setDialogueTopic={setDialogueTopic}
                        showContext={showContext}
                        setShowContext={setShowContext}
                        showLength={showLength}
                        setShowLength={setShowLength}
                        handleGenerateDialogue={handleGenerateDialogue}
                        isGeneratingDialogue={isGeneratingDialogue}
                        
                        script={script}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        editingTurnId={editingTurnId}
                        setEditingTurnId={setEditingTurnId}
                        refinePrompt={refinePrompt}
                        setRefinePrompt={setRefinePrompt}
                        handleRefineTurn={handleRefineTurn}
                        isRefining={isRefining}
                        handleGenerateNextTurn={handleGenerateNextTurn}
                        isAddingLine={isAddingLine}

                        editingPersonaId={editingPersonaId}
                        onEdit={handleEdit}
                        onCancel={handleCancel}
                        onSave={handleSave}
                        onDelete={handleDelete}
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
