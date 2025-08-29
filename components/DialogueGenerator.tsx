
import React from 'react';
import { Persona, DialogueTurn } from '../types';
import { SelectInput } from './shared/SelectInput';
import { PromptEditIcon } from './icons/PromptEditIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { FinalizeIcon } from './icons/FinalizeIcon';
import { EditIcon } from './icons/EditIcon';


interface ShowFlowEditorProps {
    personas: Persona[];
    dialogueTopic: string;
    setDialogueTopic: (topic: string) => void;
    showContext: string;
    setShowContext: (context: string) => void;
    showLength: string;
    setShowLength: (length: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    // Script Refinement props
    script: DialogueTurn[];
    viewMode: 'editor' | 'final';
    setViewMode: (mode: 'editor' | 'final') => void;
    editingTurnId: string | null;
    setEditingTurnId: (id: string | null) => void;
    refinePrompt: string;
    setRefinePrompt: (prompt: string) => void;
    onRefine: () => void;
    isRefining: string | null;
    onAddLine: () => void;
    isAddingLine: boolean;
    isDisabled?: boolean;
}

const GenerationControls: React.FC<Omit<ShowFlowEditorProps, 'script' | 'viewMode' | 'setViewMode' | 'editingTurnId' | 'setEditingTurnId' | 'refinePrompt' | 'setRefinePrompt' | 'onRefine' | 'isRefining' | 'onAddLine' | 'isAddingLine'>> = ({
    personas,
    dialogueTopic,
    setDialogueTopic,
    showContext,
    setShowContext,
    showLength,
    setShowLength,
    onGenerate,
    isGenerating,
    isDisabled,
}) => {
    const isButtonDisabled = isGenerating || !dialogueTopic.trim() || isDisabled;

    const getDialogueHint = () => {
        if (isDisabled && personas.length >= 2) {
             return "Save or cancel persona edits to enable dialogue generation.";
        }
        if (personas.length < 2) {
            return `Add ${2-personas.length} more persona(s) to generate dialogue.`;
        }
        return `Dialogue will be generated between ${personas[0].name} and ${personas[1].name}.`;
    }
    
    const lengthOptions = [
        'Short (1-3 mins)',
        'Medium (5-10 mins)',
        'Long (15-20 mins)',
        'Extended (30+ mins)',
    ];

    return (
         <div className="space-y-4">
            <div className="text-xs text-center mb-4 p-2 bg-[#212934] rounded-md text-[#95aac0]">
                {getDialogueHint()}
            </div>
            <div>
                <label htmlFor="dialogue-topic" className="block text-sm font-medium text-[#95aac0] mb-1">
                    Show Topic
                </label>
                <input
                    type="text"
                    id="dialogue-topic"
                    value={dialogueTopic}
                    onChange={(e) => setDialogueTopic(e.target.value)}
                    placeholder="e.g., The future of AI in healthcare"
                    className="w-full bg-[#212934] border-2 border-[#5c6f7e] rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[#e2a32d] focus:border-[#e2a32d] transition-colors duration-200 disabled:bg-[#212934]/50 disabled:cursor-not-allowed"
                    disabled={isDisabled}
                />
            </div>
             <div>
                <label htmlFor="show-context" className="block text-sm font-medium text-[#95aac0] mb-1">
                    Context Material (Optional)
                </label>
                <textarea
                    id="show-context"
                    value={showContext}
                    onChange={(e) => setShowContext(e.target.value)}
                    rows={3}
                    placeholder="e.g., Mention the latest breakthrough from OmniCorp and a recent ethical debate..."
                    className="w-full bg-[#212934] border-2 border-[#5c6f7e] rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[#e2a32d] focus:border-[#e2a32d] transition-colors duration-200 disabled:bg-[#212934]/50 disabled:cursor-not-allowed"
                    disabled={isDisabled}
                />
            </div>
            
            <SelectInput
                label="Show Length"
                value={showLength}
                onChange={setShowLength}
                options={lengthOptions}
                disabled={isDisabled}
            />
            
            <button
                onClick={onGenerate}
                disabled={isButtonDisabled}
                className="px-6 py-3 bg-[#c36e26] text-white font-semibold rounded-lg shadow-md hover:bg-[#e2a32d] disabled:bg-[#5c6f7e] disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center w-48"
            >
                {isGenerating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    'Generate Dialogue'
                )}
            </button>
        </div>
    );
}

const ScriptEditor: React.FC<Omit<ShowFlowEditorProps, 'dialogueTopic' | 'setDialogueTopic' | 'showContext' | 'setShowContext' | 'showLength' | 'setShowLength' | 'onGenerate' | 'isGenerating' | 'isDisabled'>> = ({
    script,
    viewMode,
    setViewMode,
    editingTurnId,
    setEditingTurnId,
    refinePrompt,
    setRefinePrompt,
    onRefine,
    isRefining,
    onAddLine,
    isAddingLine
}) => {
    
    if (viewMode === 'final') {
        return (
             <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-[#e2a32d]">Final Script</h3>
                    <button onClick={() => setViewMode('editor')} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#c36e26] hover:bg-[#e2a32d] text-white rounded-md transition-colors">
                        <EditIcon className="w-4 h-4"/>
                        Back to Editor
                    </button>
                </div>
                <div className="bg-[#212934] rounded-lg p-4 whitespace-pre-wrap text-gray-200 font-mono text-sm max-h-[500px] overflow-y-auto custom-scrollbar">
                    {script.map(turn => `${turn.speaker} (${turn.personaName}): ${turn.text}`).join('\n\n')}
                </div>
            </div>
        )
    }

    return (
        <div>
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
             <div className="mt-4 pt-4 border-t border-[#5c6f7e] flex justify-between gap-4">
                <button
                    onClick={onAddLine}
                    disabled={isAddingLine}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-[#5c6f7e] hover:bg-[#95aac0] text-white rounded-md transition-colors disabled:opacity-50"
                >
                    <PlusCircleIcon className="w-5 h-5"/>
                    {isAddingLine ? 'Adding...' : 'Add Dialogue Line'}
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


export const ShowFlowEditor: React.FC<ShowFlowEditorProps> = (props) => {
    const { script, isGenerating, isDisabled } = props;

    return (
        <div className={`bg-[#333e48] rounded-xl shadow-lg p-6 transition-opacity duration-300 ${isDisabled ? 'opacity-60' : 'opacity-100'}`}>
            <h2 className="text-2xl font-bold text-[#e2a32d] mb-4">
                {script.length > 0 ? "Dialogue Studio" : "Define Show Intro & Flow"}
            </h2>
            
            {isGenerating && (
                <div className="flex items-center justify-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e2a32d] mr-3"></div>
                     <span className="text-lg">Generating initial script...</span>
                </div>
            )}
            
            {!isGenerating && script.length === 0 && <GenerationControls {...props} />}
            
            {!isGenerating && script.length > 0 && <ScriptEditor {...props} />}
        </div>
    );
};