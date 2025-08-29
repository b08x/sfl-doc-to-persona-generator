
import React from 'react';
import { Persona } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PersonaComparisonProps {
    personaA: Persona;
    personaB: Persona;
    onClose: () => void;
}

const COLORS = ['#e2a32d', '#c36e26', '#95aac0', '#5c6f7e'];

const DetailRow: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div className="py-2.5 border-b border-[#5c6f7e]/50 last:border-b-0">
        <p className="text-sm font-semibold text-[#95aac0]">{label}</p>
        <p className="text-gray-200 mt-1">{value}</p>
    </div>
);

const ComparisonColumn: React.FC<{ persona: Persona }> = ({ persona }) => {
    const { sflAnalysis, personaMapping } = persona.analysis;
    const processData = [
        { name: 'Mat', value: sflAnalysis.processDistribution.material },
        { name: 'Men', value: sflAnalysis.processDistribution.mental },
        { name: 'Rel', value: sflAnalysis.processDistribution.relational },
        { name: 'Ver', value: sflAnalysis.processDistribution.verbal },
    ].filter(item => item.value > 0);

    return (
        <div className="flex flex-col">
            <h3 className="text-2xl font-bold text-[#e2a32d] mb-4 text-center">{persona.name}</h3>
            
            <div className="bg-[#212934] rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-lg text-gray-200 mb-2 border-b border-[#5c6f7e] pb-2">SFL Analysis</h4>
                <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={processData} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {processData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#333e48', borderColor: '#5c6f7e' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <DetailRow label="Technicality" value={<><strong className="text-gray-100">{sflAnalysis.technicality.score}/10</strong> &ndash; <em className="text-gray-400">{sflAnalysis.technicality.description}</em></>} />
                <DetailRow label="Modality Profile" value={sflAnalysis.modalityProfile} />
                <DetailRow label="Appraisal Summary" value={sflAnalysis.appraisalSummary} />
                <DetailRow label="Cohesion Summary" value={sflAnalysis.cohesionSummary} />
            </div>

            <div className="bg-[#212934] rounded-lg p-4">
                 <h4 className="font-semibold text-lg text-gray-200 mb-2 border-b border-[#5c6f7e] pb-2">Persona Profile</h4>
                <DetailRow label="Style" value={personaMapping.style} />
                <DetailRow label="Confidence" value={personaMapping.confidence} />
                <DetailRow label="Stance" value={personaMapping.stance} />
                <DetailRow label="Organization" value={personaMapping.organization} />
            </div>
        </div>
    );
};

export const PersonaComparison: React.FC<PersonaComparisonProps> = ({ personaA, personaB, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-[#333e48] w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-[#5c6f7e]">
                    <h2 className="text-2xl font-bold text-gray-200">Persona Comparison</h2>
                    <button onClick={onClose} className="p-1 text-[#95aac0] hover:text-white transition-colors" aria-label="Close comparison">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </header>
                <main className="overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ComparisonColumn persona={personaA} />
                        <ComparisonColumn persona={personaB} />
                    </div>
                </main>
            </div>
        </div>
    );
};
