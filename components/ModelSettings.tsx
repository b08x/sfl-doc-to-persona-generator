
import React, { useState } from 'react';
import { SelectInput } from './shared/SelectInput';

interface ModelSettingsProps {
    model: string;
    setModel: (model: string) => void;
    thinkingBudget: string;
    setThinkingBudget: (budget: string) => void;
    serviceProvider: string;
    setServiceProvider: (provider: string) => void;
    availableModels: string[];
    isModelsLoading: boolean;
    modelsError: string | null;
}

const providerOptions = ['Gemini']; // Future-proof for more providers

export const ModelSettings: React.FC<ModelSettingsProps> = ({ 
    model, setModel, 
    thinkingBudget, setThinkingBudget, 
    serviceProvider, setServiceProvider,
    availableModels, isModelsLoading, modelsError 
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const supportsThinking = model === 'gemini-2.5-flash';

    return (
        <details className="bg-[#333e48] rounded-xl shadow-lg mb-8" open={isOpen} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
            <summary className="flex justify-between items-center p-4 cursor-pointer text-xl font-bold text-[#e2a32d]">
                Model & Generation Settings
                <span className={`transform transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}>{'>'}</span>
            </summary>
            <div className="p-4 border-t border-[#5c6f7e] grid grid-cols-1 md:grid-cols-3 gap-6">
                <SelectInput 
                    label="Service Provider"
                    value={serviceProvider}
                    onChange={setServiceProvider}
                    options={providerOptions}
                />
                <div>
                    <SelectInput 
                        label="Active Model"
                        value={isModelsLoading ? 'Loading...' : model}
                        onChange={setModel}
                        options={availableModels}
                        disabled={isModelsLoading || !!modelsError || availableModels.length === 0}
                    />
                    {modelsError && <p className="text-xs text-red-400 mt-1">{modelsError}</p>}
                </div>

                {supportsThinking && (
                    <div>
                        <label htmlFor="thinking-budget" className="block text-sm font-medium text-[#95aac0] mb-1">Thinking Budget</label>
                        <input
                            type="number"
                            id="thinking-budget"
                            value={thinkingBudget}
                            onChange={(e) => setThinkingBudget(e.target.value)}
                            placeholder="Empty for default, 0 to disable"
                            min="0"
                            className="w-full bg-[#212934] border-2 border-[#5c6f7e] rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[#e2a32d] focus:border-[#e2a32d] transition-colors duration-200"
                        />
                         <p className="text-xs text-[#95aac0] mt-1">Controls token budget for pre-computation. Only for supported models.</p>
                    </div>
                )}
            </div>
             <style>{`
                details > summary { list-style: none; }
                summary::-webkit-details-marker { display: none; }
             `}</style>
        </details>
    );
};
