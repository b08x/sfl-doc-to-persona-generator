
import React, { useState } from 'react';
import { TextualSettings } from '../../types';
import { TextualIcon } from '../icons/TextualIcon';
import { SliderInput } from '../shared/SliderInput';
import { TextInput } from '../shared/TextInput';

interface Props {
    settings: TextualSettings;
    onChange: (newSettings: TextualSettings) => void;
}

export const TextualSettingsEditor: React.FC<Props> = ({ settings, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (field: keyof TextualSettings, value: number | string) => {
        onChange({ ...settings, [field]: value });
    };

    return (
        <details className="bg-[#212934] rounded-lg" open={isOpen} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
            <summary className="flex items-center gap-2 text-xl font-semibold text-[#e2a32d] p-4 cursor-pointer">
                <TextualIcon />
                Textual Settings
                <span className={`ml-auto transform transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}>{'>'}</span>
            </summary>
            <div className="p-4 border-t border-[#5c6f7e]/50 space-y-4">
                <SliderInput
                    label="Lexical Density"
                    value={settings.lexicalDensity}
                    onChange={(val) => handleChange('lexicalDensity', val)}
                    min={1}
                    max={10}
                />
                <SliderInput
                    label="Grammatical Intricacy"
                    value={settings.grammaticalIntricacy}
                    onChange={(val) => handleChange('grammaticalIntricacy', val)}
                    min={1}
                    max={10}
                />
                <TextInput
                    label="Reference Chains"
                    value={settings.referenceChains}
                    onChange={(val) => handleChange('referenceChains', val)}
                />
                <TextInput
                    label="Conjunctive Adverbs"
                    value={settings.conjunctiveAdverbs}
                    onChange={(val) => handleChange('conjunctiveAdverbs', val)}
                />
                 <TextInput
                    label="Thematic Progression"
                    value={settings.thematicProgression}
                    onChange={(val) => handleChange('thematicProgression', val)}
                />
                <TextInput
                    label="Question Sequences"
                    value={settings.questionSequences}
                    onChange={(val) => handleChange('questionSequences', val)}
                />
            </div>
        </details>
    );
};