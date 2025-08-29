
import React, { useState, useMemo } from 'react';
import { IdeationalSettings } from '../../types';
import { IdeationalIcon } from '../icons/IdeationalIcon';
import { SliderInput } from '../shared/SliderInput';
import { TextInput } from '../shared/TextInput';

interface Props {
    settings: IdeationalSettings;
    onChange: (newSettings: IdeationalSettings) => void;
}

export const IdeationalSettingsEditor: React.FC<Props> = ({ settings, onChange }) => {
    const [isOpen, setIsOpen] = useState(true);

    const processTotal = useMemo(() => {
        return Math.round(
            settings.materialProcesses +
            settings.mentalProcesses +
            settings.relationalProcesses +
            settings.verbalProcesses
        );
    }, [settings]);

    const handleSliderChange = (field: keyof IdeationalSettings, value: number) => {
        onChange({ ...settings, [field]: value });
    };

    const handleTextChange = (field: keyof IdeationalSettings, value: string) => {
        onChange({ ...settings, [field]: value });
    };

    return (
        <details className="bg-[#212934] rounded-lg" open={isOpen} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
            <summary className="flex items-center gap-2 text-xl font-semibold text-[#e2a32d] p-4 cursor-pointer">
                <IdeationalIcon />
                Ideational Settings
                <span className={`ml-auto transform transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}>{'>'}</span>
            </summary>
            <div className="p-4 border-t border-[#5c6f7e]/50 space-y-4">
                <div className="p-3 bg-[#333e48] rounded-md">
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold text-[#95aac0]">Process Distribution</label>
                        <span className={`font-bold text-lg ${processTotal === 100 ? 'text-green-400' : 'text-red-400'}`}>
                            {processTotal}%
                        </span>
                    </div>
                    {processTotal !== 100 && (
                        <p className="text-xs text-red-400 mb-2 -mt-1 text-center">Total must be 100% to save.</p>
                    )}
                    <SliderInput
                        label="Material"
                        value={settings.materialProcesses}
                        onChange={(val) => handleSliderChange('materialProcesses', val)}
                        max={100}
                    />
                    <SliderInput
                        label="Mental"
                        value={settings.mentalProcesses}
                        onChange={(val) => handleSliderChange('mentalProcesses', val)}
                        max={100}
                    />
                    <SliderInput
                        label="Relational"
                        value={settings.relationalProcesses}
                        onChange={(val) => handleSliderChange('relationalProcesses', val)}
                        max={100}
                    />
                    <SliderInput
                        label="Verbal"
                        value={settings.verbalProcesses}
                        onChange={(val) => handleSliderChange('verbalProcesses', val)}
                        max={100}
                    />
                </div>
                 <SliderInput
                    label="Technicality Level"
                    value={settings.technicalityLevel}
                    onChange={(val) => handleSliderChange('technicalityLevel', val)}
                    min={1}
                    max={10}
                />
                <TextInput
                    label="Logical Relations"
                    value={settings.logicalRelations}
                    onChange={(val) => handleTextChange('logicalRelations', val)}
                />
            </div>
        </details>
    );
};