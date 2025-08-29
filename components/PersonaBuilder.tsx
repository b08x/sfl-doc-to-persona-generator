
import React, { useState, useCallback, useMemo } from 'react';
import { PersonaConfiguration } from '../types';
import { IdeationalSettingsEditor } from './editors/IdeationalSettingsEditor';
import { InterpersonalSettingsEditor } from './editors/InterpersonalSettingsEditor';
import { TextualSettingsEditor } from './editors/TextualSettingsEditor';
import { SaveIcon } from './icons/SaveIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface PersonaBuilderProps {
    personaName: string;
    initialConfig: PersonaConfiguration;
    onSave: (config: PersonaConfiguration) => void;
    onCancel: () => void;
}

export const PersonaBuilder: React.FC<PersonaBuilderProps> = ({ personaName, initialConfig, onSave, onCancel }) => {
    const [config, setConfig] = useState<PersonaConfiguration>(initialConfig);

    const handleIdeationalChange = useCallback((ideational) => {
        setConfig(prev => ({ ...prev, ideational }));
    }, []);

    const handleInterpersonalChange = useCallback((interpersonal) => {
        setConfig(prev => ({ ...prev, interpersonal }));
    }, []);

    const handleTextualChange = useCallback((textual) => {
        setConfig(prev => ({ ...prev, textual }));
    }, []);

    const isSaveDisabled = useMemo(() => {
        const { materialProcesses, mentalProcesses, relationalProcesses, verbalProcesses } = config.ideational;
        const processTotal = Math.round(materialProcesses + mentalProcesses + relationalProcesses + verbalProcesses);

        const { statements, questions, offersCommands } = config.interpersonal;
        const speechTotal = Math.round(statements + questions + offersCommands);

        return processTotal !== 100 || speechTotal !== 100;
    }, [config.ideational, config.interpersonal]);

    return (
        <div className="bg-[#333e48] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-200 mb-4">Editing: <span className="text-[#e2a32d]">{personaName}</span></h2>
            <div className="space-y-4">
                <IdeationalSettingsEditor 
                    settings={config.ideational}
                    onChange={handleIdeationalChange}
                />
                <InterpersonalSettingsEditor
                    settings={config.interpersonal}
                    onChange={handleInterpersonalChange}
                />
                <TextualSettingsEditor
                    settings={config.textual}
                    onChange={handleTextualChange}
                />
            </div>
            <div className="flex justify-end items-center mt-6 pt-4 border-t border-[#5c6f7e] gap-4">
                <button 
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-[#5c6f7e] hover:bg-[#95aac0] text-white rounded-md transition-colors"
                >
                    <XCircleIcon className="w-5 h-5" />
                    Cancel
                </button>
                <button
                    onClick={() => onSave(config)}
                    disabled={isSaveDisabled}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-[#c36e26] hover:bg-[#e2a32d] text-white rounded-md transition-colors disabled:bg-[#5c6f7e] disabled:cursor-not-allowed"
                >
                    <SaveIcon className="w-5 h-5" />
                    Save Changes
                </button>
            </div>
        </div>
    );
};