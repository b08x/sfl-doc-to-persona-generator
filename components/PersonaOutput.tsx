import React, { useState } from 'react';
import { Persona, PersonaConfiguration } from '../types';
import { IdeationalIcon } from './icons/IdeationalIcon';
import { InterpersonalIcon } from './icons/InterpersonalIcon';
import { TextualIcon } from './icons/TextualIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { EditIcon } from './icons/EditIcon';
import { XCircleIcon } from './icons/XCircleIcon';


interface PersonaOutputProps {
    persona: Persona;
    onEdit: () => void;
    onDelete?: () => void;
}

const SettingItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-[#5c6f7e]/50">
        <dt className="text-[#95aac0]">{label}</dt>
        <dd className="text-gray-200 font-medium text-right text-sm sm:text-base">{value}</dd>
    </div>
);

export const PersonaOutput: React.FC<PersonaOutputProps> = ({ persona, onEdit, onDelete }) => {
    const [copied, setCopied] = useState(false);
    const config = persona.analysis.personaConfiguration;

    const handleCopy = () => {
        const jsonString = JSON.stringify(config, null, 2);
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#333e48] rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4 gap-2 flex-wrap">
                <div>
                    <h2 className="text-2xl font-bold text-gray-200">Configuration: <span className="text-[#e2a32d]">{persona.name}</span></h2>
                    {persona.description && <p className="text-sm text-[#95aac0] mt-1 italic">{persona.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                     <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#c36e26] hover:bg-[#e2a32d] text-white rounded-md transition-colors"
                    >
                        <EditIcon className="w-4 h-4" />
                        Edit Config
                    </button>
                    <button
                        onClick={handleCopy}
                        title="Copy configuration as JSON"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#5c6f7e] hover:bg-[#333e48] rounded-md transition-colors"
                    >
                        <ClipboardIcon className="w-4 h-4" />
                        {copied ? 'Copied!' : 'JSON'}
                    </button>
                    {onDelete && (
                         <button
                            onClick={onDelete}
                            title="Delete Persona"
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                        >
                            <XCircleIcon className="w-4 h-4" />
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {/* Ideational Settings */}
                <div className="bg-[#212934] rounded-lg p-4">
                    <h3 className="flex items-center gap-2 text-xl font-semibold text-[#e2a32d] mb-3">
                        <IdeationalIcon />
                        Ideational Settings
                    </h3>
                    <dl>
                        <SettingItem label="Material Processes" value={`${config.ideational.materialProcesses}%`} />
                        <SettingItem label="Mental Processes" value={`${config.ideational.mentalProcesses}%`} />
                        <SettingItem label="Relational Processes" value={`${config.ideational.relationalProcesses}%`} />
                        <SettingItem label="Verbal Processes" value={`${config.ideational.verbalProcesses}%`} />
                        <SettingItem label="Technicality Level" value={`${config.ideational.technicalityLevel}/10`} />
                        <SettingItem label="Logical Relations" value={config.ideational.logicalRelations} />
                    </dl>
                </div>
                
                {/* Interpersonal Settings */}
                 <div className="bg-[#212934] rounded-lg p-4">
                    <h3 className="flex items-center gap-2 text-xl font-semibold text-[#e2a32d] mb-3">
                        <InterpersonalIcon />
                        Interpersonal Settings
                    </h3>
                    <dl>
                        <SettingItem label="Statements" value={`${config.interpersonal.statements}%`} />
                        <SettingItem label="Questions" value={`${config.interpersonal.questions}%`} />
                        <SettingItem label="Offers/Commands" value={`${config.interpersonal.offersCommands}%`} />
                        <SettingItem label="Probability Modality" value={`${config.interpersonal.probabilityModality}/10`} />
                        <SettingItem label="Usuality Modality" value={`${config.interpersonal.usualityModality}/10`} />
                        <SettingItem label="Questioning Frequency" value={config.interpersonal.questioningFrequency} />
                        <SettingItem label="Appraisal" value={config.interpersonal.appraisal} />
                    </dl>
                </div>
                
                {/* Textual Settings */}
                <div className="bg-[#212934] rounded-lg p-4">
                    <h3 className="flex items-center gap-2 text-xl font-semibold text-[#e2a32d] mb-3">
                        <TextualIcon />
                        Textual Settings
                    </h3>
                    <dl>
                        <SettingItem label="Lexical Density" value={`${config.textual.lexicalDensity}/10`} />
                        <SettingItem label="Grammatical Intricacy" value={`${config.textual.grammaticalIntricacy}/10`} />
                        <SettingItem label="Reference Chains" value={config.textual.referenceChains} />
                        <SettingItem label="Conjunctive Adverbs" value={config.textual.conjunctiveAdverbs} />
                        <SettingItem label="Thematic Progression" value={config.textual.thematicProgression} />
                        <SettingItem label="Question Sequences" value={config.textual.questionSequences} />
                    </dl>
                </div>
            </div>
        </div>
    );
};