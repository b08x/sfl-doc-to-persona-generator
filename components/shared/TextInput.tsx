
import React from 'react';

interface TextInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder }) => {
    return (
        <div className="py-2">
            <label className="block text-sm font-medium text-[#95aac0] mb-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
                className="w-full bg-[#333e48] border-2 border-[#5c6f7e] rounded-lg p-2 text-gray-200 focus:ring-1 focus:ring-[#e2a32d] focus:border-[#e2a32d] transition-colors duration-200"
            />
        </div>
    );
};