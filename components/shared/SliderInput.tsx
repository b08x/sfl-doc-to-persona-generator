
import React from 'react';

interface SliderInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

export const SliderInput: React.FC<SliderInputProps> = ({
    label,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1
}) => {
    return (
        <div className="py-2">
            <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-[#95aac0]">{label}</label>
                <span className="text-sm font-semibold text-gray-200 bg-[#212934] px-2 py-0.5 rounded-md">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-[#5c6f7e] rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <style>{`
                .slider-thumb::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #c36e26;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: background .2s;
                }
                .slider-thumb:hover::-webkit-slider-thumb {
                    background: #e2a32d;
                }
                .slider-thumb::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #c36e26;
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                    transition: background .2s;
                }
                .slider-thumb:hover::-moz-range-thumb {
                    background: #e2a32d;
                }
            `}</style>
        </div>
    );
};