
import React from 'react';

interface SelectInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    disabled?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options, disabled = false }) => {
    return (
        <div className="py-2">
            <label className="block text-sm font-medium text-[#95aac0] mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full bg-[#333e48] border-2 border-[#5c6f7e] rounded-lg p-2 text-gray-200 focus:ring-1 focus:ring-[#e2a32d] focus:border-[#e2a32d] transition-colors duration-200 disabled:bg-[#212934] disabled:cursor-not-allowed"
            >
                {options.map(option => (
                    <option key={option} value={option} className="bg-[#333e48] text-gray-200">{option}</option>
                ))}
            </select>
        </div>
    );
};