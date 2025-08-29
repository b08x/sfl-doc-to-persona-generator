import React, { useState, useCallback } from 'react';
import { Persona, DialogueTurn, PersonaConfiguration } from '../types';
import { generateDialogue, refineDialogueTurn, generateNextDialogueTurn } from '../services/geminiService';
import { SelectInput } from './shared/SelectInput';
import { PersonaOutput } from './PersonaOutput';
import { PersonaBuilder } from './PersonaBuilder';
import { PromptEditIcon } from './icons/PromptEditIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { FinalizeIcon } from './icons/FinalizeIcon';
import { EditIcon } from './icons/EditIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';


interface DialogueStudioProps {
    initialPersonas: [Persona, Persona];
    onBack: () => void;
    onPersonaUpdate: (personaId: string, newConfig: PersonaConfiguration) => void;
    model: string;
    thinkingBudget?: number;
}

const ScriptEditor: React.FC<{
    script: DialogueTurn[];
    viewMode: 'editor' | 'final';
    setViewMode: (mode: 'editor' | 'final') => void;
    editingTurnId: string | null;
    setEditingTurnId: (id: string | null) => void;
    refinePrompt: string;
    setRefinePrompt: (prompt: string) => void;
    onRefine: () => void;
    isRefining: string | null;
    
    // Props for adding a new line
    isAddingLineMode: boolean;
    setIsAddingLineMode: (mode: boolean) => void;
    addLinePrompt: string;
    setAddLinePrompt: (prompt: string) => void;
    onAddLine: (prompt: string) => void;
    isGeneratingNextLine: boolean;
}> = ({
    script, viewMode, setViewMode, editingTurnId, setEditingTurnId,
    refinePrompt, setRefinePrompt, onRefine, isRefining,
    isAddingLineMode, setIsAddingLineMode, addLinePrompt, setAddLinePrompt, onAddLine, isGeneratingNextLine
}) => {
    
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const formattedScript = script.map(turn => `${turn.speaker} (${turn.personaName}): ${turn.text}`).join('\n\n');
        navigator.clipboard.writeText(formattedScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (viewMode === 'final') {
        return (
             <div className="mt-8">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h3 className="text-xl font-semibold text-[#e2a32d]">Final Script</h3>
                    <div className="flex gap-2">
                        <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#5c6f7e] hover:bg-[#95aac0] text-white rounded-md transition-colors">
                            <ClipboardIcon className="w-4 h-4"/>
                            {copied ? 'Copied!' : 'Copy Script'}
                        </button>
                        <button onClick={() => setViewMode('editor')} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#c36e26] hover:bg-[#e2a32d] text-white rounded-md transition-colors">
                            <EditIcon className="w-4 h-4"/>
                            Back to Editor
                        </button>
                    </div>
                </div>
                <div className="bg-[#212934] rounded-lg p-4 whitespace-pre-wrap text-gray-200 font-mono text-sm max-h-[500px] overflow-y-auto custom-scrollbar">
                    {script.map(turn => `${turn.speaker} (${turn.personaName}): ${turn.text}`).join('\n\n')}
                </div>
            </div>
        )
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold text-[#e2a32d] mb-4">Refine Your Script</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {script.map(turn => (
                    <div key={turn.id} className="bg-[#212934] rounded-lg p-3">
                        <div className="flex justify-between items-start">
                             <p className="flex-1">
                                <span className={`font-bold ${turn.speaker === 'Speaker A' ? 'text-[#e2a32d]' : 'text-[#c36e26]'}`}>
                                    {turn.personaName} ({turn.speaker}):
                                </span>
                                <span className="ml-2 text-gray-200">{turn.text}</span>
                            </p>
                            <button 
                                onClick={() => editingTurnId === turn.id ? setEditingTurnId(null) : setEditingTurnId(turn.id)}
                                title="Edit with prompt"
                                className="ml-2 p-1 text-[#95aac0] hover:text-white transition-colors"
                            >
                                <PromptEditIcon className="w-5 h-5"/>
                            </button>
                        </div>
                         {editingTurnId === turn.id && (
                            <div className="mt-3 space-y-2">
                                <textarea
                                    value={refinePrompt}
                                    onChange={(e) => setRefinePrompt(e.target.value)}
                                    rows={2}
                                    placeholder={`e.g., Make this line more questioning...`}
                                    className="w-full bg-[#333e48] border border-[#5c6f7e] rounded-md p-2 text-sm text-gray-200 focus:ring-1 focus:ring-[#e2a32d] focus:border-[#e2a32d]"
                                />
                                <div className="flex gap-2 justify-end">
                                    <button 
                                        onClick={() => setEditingTurnId(null)}
                                        className="px-3 py-1 text-xs bg-[#5c6f7e] rounded hover:bg-[#95aac0]"
                                    >Cancel</button>
                                    <button 
                                        onClick={onRefine}
                                        disabled={isRefining === turn.id || !refinePrompt.trim()}
                                        className="px-3 py-1 text-xs bg-[#c36e26] text-white rounded hover:bg-[#e2a32d] disabled:bg-[#5c6f7e] flex items-center justify-center w-20"
                                    >
                                        {isRefining === turn.id ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> : 'Refine'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
             {isAddingLineMode && (
                <div className="mt-4 pt-4 border-t border-[#5c6f7e] space-y-2 bg-[#212934] rounded-lg p-3">
                    <label htmlFor="add-line-prompt" className="block text-sm font-medium text-[#95aac0]">
                        Instruction for the next dialogue line:
                    </label>
                    <textarea
                        id="add-line-prompt"
                        value={addLinePrompt}
                        onChange={(e) => setAddLinePrompt(e.target.value)}
                        rows={2}
                        placeholder={`e.g., Have them express doubt about the previous statement...`}
                        className="w-full bg-[#333e48] border border-[#5c6f7e] rounded-md p-2 text-sm text-gray-200 focus:ring-1 focus:ring-[#e2a32d] focus:border-[#e2a32d]"
                    />
                    <div className="flex gap-2 justify-end">
                        <button 
                            onClick={() => { setIsAddingLineMode(false); setAddLinePrompt(''); }}
                            className="px-3 py-1 text-xs bg-[#5c6f7e] rounded hover:bg-[#95aac0]"
                        >Cancel</button>
                        <button 
                            onClick={() => onAddLine(addLinePrompt)}
                            disabled={isGeneratingNextLine || !addLinePrompt.trim()}
                            className="px-3 py-1 text-xs bg-[#c36e26] text-white rounded hover:bg-[#e2a32d] disabled:bg-[#5c6f7e] flex items-center justify-center w-20"
                        >
                            {isGeneratingNextLine ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> : 'Generate'}
                        </button>
                    </div>
                </div>
            )}
             <div className="mt-4 pt-4 border-t border-[#5c6f7e] flex justify-between gap-4">
                <button
                    onClick={() => setIsAddingLineMode(true)}
                    disabled={isAddingLineMode}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-[#5c6f7e] hover:bg-[#95aac0] text-white rounded-md transition-colors disabled:opacity-50"
                >
                    <PlusCircleIcon className="w-5 h-5"/>
                    Add Dialogue Line
                </button>
                <button
                    onClick={() => setViewMode('final')}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-[#c36e26] hover:bg-[#e2a32d] text-white rounded-md transition-colors"
                >
                    <FinalizeIcon className="w-5 h-5"/>
                    View Final Script
                </button>
            </div>
        </div>
    )
}


export const DialogueStudio: React.FC<DialogueStudioProps> = ({ initialPersonas, onBack, onPersonaUpdate, model, thinkingBudget }) => {
    const [personas, setPersonas] = useState(initialPersonas);
    const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
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
    const [isRefining, setIsRefining] = useState<string | null>(null);
    
    // Add-line state
    const [isAddingLineMode, setIsAddingLineMode] = useState<boolean>(false);
    const [addLinePrompt, setAddLinePrompt] = useState<string>('');
    const [isGeneratingNextLine, setIsGeneratingNextLine] = useState<boolean>(false);

    // Update internal state if props change
    React.useEffect(() => {
        setPersonas(initialPersonas);
    }, [initialPersonas]);

    const handleSave = (personaId: string, newConfig: PersonaConfiguration) => {
        // Update local state to reflect changes immediately
        setPersonas(prev => prev.map(p => 
            p.id === personaId 
                ? { ...p, analysis: { ...p.analysis, personaConfiguration: newConfig } } 
                : p
        ) as [Persona, Persona]);

        // Propagate change up to the App component to keep global state in sync
        onPersonaUpdate(personaId, newConfig);
        setEditingPersonaId(null);
    };

    const handleCancel = () => {
        setEditingPersonaId(null);
    };

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
            const dialogue = await generateDialogue(configs, dialogueTopic, showContext, showLength, model, thinkingBudget);
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
    }, [dialogueTopic, personas, showContext, showLength, model, thinkingBudget]);

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
            
            const refinedText = await refineDialogueTurn(turnToRefine.text, personaConfig, refinePrompt, model, thinkingBudget);

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

    const handleGenerateNextTurn = async (userPrompt: string) => {
        if (script.length === 0 || !userPrompt.trim()) return;
        
        setIsGeneratingNextLine(true);
        setError(null);
        
        try {
            const lastTurn = script[script.length - 1];
            const nextSpeaker = lastTurn.speaker === 'Speaker A' ? 'Speaker B' : 'Speaker A';
            const nextPersona = nextSpeaker === 'Speaker A' ? personas[0] : personas[1];
            const nextSpeakerConfig = nextPersona.analysis.personaConfiguration;
            
            const history = script.slice(-4);
            
            const newText = await generateNextDialogueTurn(history, nextSpeaker, nextSpeakerConfig, userPrompt, model, thinkingBudget);
            
            const newTurn: DialogueTurn = {
                id: `turn-${Date.now()}`,
                speaker: nextSpeaker,
                personaName: nextPersona.name,
                text: newText,
            };
            
            setScript(prev => [...prev, newTurn]);
            setIsAddingLineMode(false);
            setAddLinePrompt('');

        } catch (e) {
            if (e instanceof Error) {
                setError(`Failed to add line: ${e.message}`);
            } else {
                setError('An unknown error occurred while adding a new line.');
            }
        } finally {
            setIsGeneratingNextLine(false);
        }
    };
    
    const lengthOptions = [ 'Short (1-3 mins)', 'Medium (5-10 mins)', 'Long (15-20 mins)', 'Extended (30+ mins)' ];
    const isGenerationDisabled = editingPersonaId !== null;

    return (
        <div className="min-h-screen bg-[#212934] text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
             <header className="max-w-7xl mx-auto mb-8 relative">
                 <button onClick={onBack} className="absolute top-0 left-0 flex items-center gap-2 text-[#95aac0] hover:text-[#e2a32d] transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                     </svg>
                     Back to Personas
                 </button>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#e2a32d] text-center">
                    Dialogue Studio
                </h1>
            </header>
            
            <main className="max-w-7xl mx-auto">
                <div className={`bg-[#333e48] rounded-xl shadow-lg p-6 mb-8 transition-opacity duration-300 ${isGenerationDisabled ? 'opacity-60' : ''}`}>
                    <h2 className="text-2xl font-bold text-[#e2a32d] mb-4">Generation Settings</h2>
                    {isGenerationDisabled && <p className="text-xs text-center mb-4 p-2 bg-[#212934] rounded-md text-[#95aac0]">Save or cancel persona edits to enable dialogue generation.</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                         <div>
                            <label htmlFor="dialogue-topic" className="block text-sm font-medium text-[#95aac0] mb-1">Show Topic</label>
                            <input
                                type="text" id="dialogue-topic" value={dialogueTopic} onChange={(e) => setDialogueTopic(e.target.value)}
                                placeholder="e.g., The future of AI in healthcare"
                                className="w-full bg-[#212934] border-2 border-[#5c6f7e] rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[#e2a32d] focus:border-[#e2a32d] transition-colors duration-200 disabled:opacity-50"
                                disabled={isGenerationDisabled}
                            />
                        </div>
                         <div className="lg:col-span-2">
                             <div className="flex items-center gap-1.5 mb-1">
                                <label htmlFor="show-context" className="block text-sm font-medium text-[#95aac0]">Context Material (Optional)</label>
                                <div className="relative group flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#95aac0] cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#212934] border border-[#5c6f7e] text-gray-200 text-xs text-center rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                        Provide key facts, names, or specific points for the dialogue to reference. This helps ground the conversation in a specific context.
                                    </div>
                                </div>
                            </div>
                            <textarea
                                id="show-context" value={showContext} onChange={(e) => setShowContext(e.target.value)} rows={3}
                                placeholder="e.g., Mention the latest breakthrough from OmniCorp and a recent ethical debate..."
                                className="w-full bg-[#212934] border-2 border-[#5c6f7e] rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[#e2a32d] focus:border-[#e2a32d] transition-colors duration-200 disabled:opacity-50"
                                disabled={isGenerationDisabled}
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end mt-4">
                        <div>
                            <SelectInput label="Show Length" value={showLength} onChange={setShowLength} options={lengthOptions} disabled={isGenerationDisabled} />
                        </div>
                        <div className="md:col-start-3">
                             <button
                                onClick={handleGenerateDialogue}
                                disabled={isGenerationDisabled || isGeneratingDialogue || !dialogueTopic.trim()}
                                className="w-full px-6 py-3 bg-[#c36e26] text-white font-semibold rounded-lg shadow-md hover:bg-[#e2a32d] disabled:bg-[#5c6f7e] disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                            >
                                {isGeneratingDialogue ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Generate Dialogue'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                    {personas.map(persona => (
                        <div key={persona.id}>
                            {editingPersonaId === persona.id ? (
                                <PersonaBuilder
                                    personaName={persona.name}
                                    initialConfig={persona.analysis.personaConfiguration}
                                    onSave={(newConfig) => handleSave(persona.id, newConfig)}
                                    onCancel={handleCancel}
                                />
                            ) : (
                                <PersonaOutput
                                    personaName={persona.name}
                                    config={persona.analysis.personaConfiguration}
                                    onEdit={() => setEditingPersonaId(persona.id)}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {error && <div className="mb-8 p-4 bg-red-600/20 border border-red-600 rounded-xl text-center text-red-300">{error}</div>}

                {isGeneratingDialogue && (
                    <div className="flex flex-col items-center justify-center h-48 text-center p-8 bg-[#333e48] rounded-xl shadow-lg">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e2a32d] mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-200">Generating Script...</h2>
                    </div>
                )}
                
                {!isGeneratingDialogue && script.length > 0 && (
                    <div className="bg-[#333e48] rounded-xl shadow-lg p-6">
                        <ScriptEditor
                            script={script}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            editingTurnId={editingTurnId}
                            setEditingTurnId={setEditingTurnId}
                            refinePrompt={refinePrompt}
                            setRefinePrompt={setRefinePrompt}
                            onRefine={handleRefineTurn}
                            isRefining={isRefining}
                            isAddingLineMode={isAddingLineMode}
                            setIsAddingLineMode={setIsAddingLineMode}
                            addLinePrompt={addLinePrompt}
                            setAddLinePrompt={setAddLinePrompt}
                            onAddLine={handleGenerateNextTurn}
                            isGeneratingNextLine={isGeneratingNextLine}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};