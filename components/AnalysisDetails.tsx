
import React from 'react';
import { SFLAnalysis, PersonaMapping } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalysisDetailsProps {
    analysis: SFLAnalysis;
    mapping: PersonaMapping;
}

const COLORS = ['#e2a32d', '#c36e26', '#95aac0', '#5c6f7e'];

export const AnalysisDetails: React.FC<AnalysisDetailsProps> = ({ analysis, mapping }) => {
    const processData = [
        { name: 'Material', value: analysis.processDistribution.material },
        { name: 'Mental', value: analysis.processDistribution.mental },
        { name: 'Relational', value: analysis.processDistribution.relational },
        { name: 'Verbal', value: analysis.processDistribution.verbal },
    ].filter(item => item.value > 0);

    return (
        <div className="bg-[#333e48] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-[#e2a32d] mb-4">SFL Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#212934] rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-[#e2a32d] mb-2">Process Distribution</h3>
                    <div style={{ width: '100%', height: 250 }}>
                         <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={processData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {processData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#333e48',
                                        borderColor: '#5c6f7e',
                                        color: '#e5e7eb'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#212934] rounded-lg p-4 flex flex-col justify-center">
                    <h3 className="font-semibold text-lg text-[#e2a32d] mb-3">Persona Profile</h3>
                    <div className="space-y-2">
                        <p><strong className="text-[#95aac0]">Style:</strong> {mapping.style}</p>
                        <p><strong className="text-[#95aac0]">Confidence:</strong> {mapping.confidence}</p>
                        <p><strong className="text-[#95aac0]">Stance:</strong> {mapping.stance}</p>
                        <p><strong className="text-[#95aac0]">Organization:</strong> {mapping.organization}</p>
                    </div>
                </div>

                <div className="bg-[#212934] rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-[#e2a32d] mb-2">Technicality</h3>
                    <p className="text-gray-200"><strong className="text-[#95aac0]">Score:</strong> {analysis.technicality.score}/10</p>
                    <p className="text-[#95aac0] italic mt-1">{analysis.technicality.description}</p>
                </div>
                
                <div className="bg-[#212934] rounded-lg p-4">
                     <h3 className="font-semibold text-lg text-[#e2a32d] mb-2">Modality Profile</h3>
                    <p className="text-gray-200">{analysis.modalityProfile}</p>
                </div>

                 <div className="bg-[#212934] rounded-lg p-4">
                     <h3 className="font-semibold text-lg text-[#e2a32d] mb-2">Appraisal Summary</h3>
                    <p className="text-gray-200">{analysis.appraisalSummary}</p>
                </div>

                 <div className="bg-[#212934] rounded-lg p-4">
                     <h3 className="font-semibold text-lg text-[#e2a32d] mb-2">Cohesion Summary</h3>
                    <p className="text-gray-200">{analysis.cohesionSummary}</p>
                </div>

            </div>
        </div>
    );
};