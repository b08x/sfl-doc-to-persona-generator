
import React, { useState, useMemo } from 'react';
import { InterpersonalSettings } from '../../types';
import { InterpersonalIcon } from '../icons/InterpersonalIcon';
import { SliderInput } from '../shared/SliderInput';
import { TextInput } from '../shared/TextInput';
import { SelectInput } from '../shared/SelectInput';

interface Props {
    settings: InterpersonalSettings;
    onChange: (newSettings: InterpersonalSettings) => void;
}

export const InterpersonalSettingsEditor: React.FC<Props> = ({ settings, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const speechTotal = useMemo(() => {
        return Math.round(
            settings.statements +
            settings.questions +
            settings.offersCommands
        );
    }, [settings]);


    const handleChange = (field: keyof InterpersonalSettings, value: number | string) => {
        onChange({ ...settings, [field]: value });
    };

    return (
        <details className="bg-[#212934] rounded-lg" open={isOpen} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
            <summary className="flex items-center gap-2 text-xl font-semibold text-[#e2a32d] p-4 cursor-pointer">
                <InterpersonalIcon />
                Interpersonal Settings
                <span className={`ml-auto transform transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}>{'>'}</span>
            </summary>
            <div className="p-4 border-t border-[#5c6f7e]/50 space-y-4">
                 <div className="p-3 bg-[#333e48] rounded-md">
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold text-[#95aac0]">Speech Functions</label>
                        <span className={`font-bold text-lg ${speechTotal === 100 ? 'text-green-400' : 'text-red-400'}`}>
                            {speechTotal}%
                        </span>
                    </div>
                     {speechTotal !== 100 && (
                        <p className="text-xs text-red-400 mb-2 -mt-1 text-center">Total must be 100% to save.</p>
                    )}
                     <SliderInput
                        label="Statements"
                        value={settings.statements}
                        onChange={(val) => handleChange('statements', val)}
                    />
                    <SliderInput
                        label="Questions"
                        value={settings.questions}
                        onChange={(val) => handleChange('questions', val)}
                    />
                    <SliderInput
                        label="Offers/Commands"
                        value={settings.offersCommands}
                        onChange={(val) => handleChange('offersCommands', val)}
                    />
                </div>
                <SliderInput
                    label="Probability Modality"
                    value={settings.probabilityModality}
                    onChange={(val) => handleChange('probabilityModality', val)}
                    min={1}
                    max={10}
                />
                <SliderInput
                    label="Usuality Modality"
                    value={settings.usualityModality}
                    onChange={(val) => handleChange('usualityModality', val)}
                    min={1}
                    max={10}
                />
                <SelectInput
                    label="Questioning Frequency"
                    value={settings.questioningFrequency}
                    onChange={(val) => handleChange('questioningFrequency', val)}
                    options={['Low', 'Medium', 'High']}
                />
                <TextInput
                    label="Appraisal"
                    value={settings.appraisal}
                    onChange={(val) => handleChange('appraisal', val)}
                />
            </div>
        </details>
    );
};