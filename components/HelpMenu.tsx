
import React from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import { IdeationalIcon } from './icons/IdeationalIcon';
import { InterpersonalIcon } from './icons/InterpersonalIcon';
import { TextualIcon } from './icons/TextualIcon';

interface SettingDefinitionProps {
    title: string;
    description: string;
    children?: React.ReactNode;
}

const SettingDefinition: React.FC<SettingDefinitionProps> = ({ title, description, children }) => (
    <div className="py-4 border-b border-[#5c6f7e]/50 last:border-b-0">
        <h4 className="font-semibold text-lg text-gray-200">{title}</h4>
        <p className="mt-1 text-[#95aac0] text-base">{description}</p>
        {children && <div className="mt-3 text-sm space-y-2">{children}</div>}
    </div>
);

const ScaleInfo: React.FC<{ low: React.ReactNode, high: React.ReactNode }> = ({ low, high }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 p-3 bg-[#212934] rounded-lg">
        <div>
            <strong className="font-semibold text-[#e2a32d]">Low Score (e.g., 1-3):</strong>
            <p className="text-gray-300 pl-2">{low}</p>
        </div>
        <div>
            <strong className="font-semibold text-[#e2a32d]">High Score (e.g., 8-10):</strong>
            <p className="text-gray-300 pl-2">{high}</p>
        </div>
    </div>
);

const CodeExample: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <code className="text-sm bg-[#212934] px-1.5 py-0.5 rounded-md text-[#c36e26] font-mono mx-0.5">{children}</code>
);

export const HelpMenu: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-[#333e48] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-[#5c6f7e]">
                    <h2 className="text-2xl font-bold text-[#e2a32d]">SFL Settings Guide</h2>
                    <button onClick={onClose} className="p-1 text-[#95aac0] hover:text-white transition-colors" aria-label="Close help menu">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </header>

                <main className="overflow-y-auto p-6 custom-scrollbar space-y-4">
                    <details open className="bg-[#212934]/50 rounded-lg">
                        <summary className="flex items-center gap-3 text-xl font-bold text-[#e2a32d] p-4 cursor-pointer list-none details-summary">
                            <IdeationalIcon /> Ideational Metafunction
                            <span className="ml-auto text-sm text-[#95aac0] font-normal details-arrow">{'>'}</span>
                        </summary>
                        <div className="p-4 border-t border-[#5c6f7e] space-y-2">
                             <SettingDefinition
                                title="Process Distribution"
                                description="Controls the 'world' the persona talks about by defining the types of actions and states. The distribution (summing to 100%) biases the model's verb choices, shaping the content of the dialogue."
                            >
                                <ul className="list-disc list-inside text-gray-300 space-y-1">
                                    <li><strong className="text-white">Material (%):</strong> Focuses on physical actions and events. High values generate dialogue about doing. E.g., <CodeExample>we constructed</CodeExample>, <CodeExample>the system implements</CodeExample>.</li>
                                    <li><strong className="text-white">Mental (%):</strong> Focuses on cognition, perception, and emotion. High values generate dialogue about thinking and feeling. E.g., <CodeExample>I believe</CodeExample>, <CodeExample>she noticed</CodeExample>.</li>
                                    <li><strong className="text-white">Relational (%):</strong> Focuses on defining, classifying, and describing states of being. High values create explanatory or academic dialogue. E.g., <CodeExample>this is the key</CodeExample>, <CodeExample>it has two parts</CodeExample>.</li>
                                    <li><strong className="text-white">Verbal (%):</strong> Focuses on acts of communication. High values lead to meta-discourse. E.g., <CodeExample>the report says</CodeExample>, <CodeExample>he argued that</CodeExample>.</li>
                                </ul>
                            </SettingDefinition>
                            <SettingDefinition
                                title="Technicality Level"
                                description="Determines the complexity and specificity of the vocabulary. It algorithmically steers the model between common, conversational words and domain-specific, expert jargon."
                            >
                                <ScaleInfo 
                                    low="Uses common, everyday language. Accessible to a general audience. E.g., 'Let's talk about making it better.'"
                                    high="Uses specialized, technical terms and acronyms. Assumes expert knowledge. E.g., 'We must leverage synergistic paradigms to disintermediate legacy frameworks.'"
                                />
                            </SettingDefinition>
                             <SettingDefinition
                                title="Logical Relations"
                                description="Defines the persona's preferred method for connecting ideas and building arguments. This setting influences the selection of conjunctions and phrases that link clauses and sentences."
                            >
                                <p className="text-gray-300">Example values like <CodeExample>Elaboration + Enhancement</CodeExample> will cause the model to favor phrases like 'in other words', 'for example' (Elaboration) as well as connectors like 'and', 'but', 'so' (Enhancement) to structure arguments.</p>
                            </SettingDefinition>
                        </div>
                    </details>

                    <details className="bg-[#212934]/50 rounded-lg">
                        <summary className="flex items-center gap-3 text-xl font-bold text-[#e2a32d] p-4 cursor-pointer list-none details-summary">
                            <InterpersonalIcon /> Interpersonal Metafunction
                             <span className="ml-auto text-sm text-[#95aac0] font-normal details-arrow">{'>'}</span>
                        </summary>
                        <div className="p-4 border-t border-[#5c6f7e] space-y-2">
                            <SettingDefinition
                                title="Speech Function Distribution"
                                description="Dictates the persona's typical interactive role in a conversation (giving information, demanding it, or directing action). The distribution (summing to 100%) guides the model in formulating sentence types."
                            >
                                <ul className="list-disc list-inside text-gray-300 space-y-1">
                                    <li><strong className="text-white">Statements (%):</strong> Giving information. High values create a declarative, informative persona.</li>
                                    <li><strong className="text-white">Questions (%):</strong> Seeking information or confirmation. High values create an inquisitive, probing persona.</li>
                                    <li><strong className="text-white">Offers/Commands (%):</strong> Proposing action or directing others. High values create a proactive or directive persona. E.g., <CodeExample>Let's try this</CodeExample>, <CodeExample>Could you review that?</CodeExample>.</li>
                                </ul>
                            </SettingDefinition>
                            <SettingDefinition
                                title="Probability Modality"
                                description="Represents the persona's degree of certainty about their claims. The model interprets this score to select modal verbs and adverbs that convey confidence."
                            >
                                <ScaleInfo 
                                    low={<>Expresses high uncertainty. Uses cautious language like <CodeExample>might</CodeExample>, <CodeExample>could be</CodeExample>, <CodeExample>perhaps</CodeExample>.</>}
                                    high={<>Expresses high certainty. Uses confident language like <CodeExample>will definitely</CodeExample>, <CodeExample>it is certain that</CodeExample>, <CodeExample>must</CodeExample>.</>}
                                />
                            </SettingDefinition>
                            <SettingDefinition
                                title="Usuality Modality"
                                description="Represents the persona's perception of frequency or typicality. This score influences the use of adverbs of frequency."
                            >
                                <ScaleInfo 
                                    low={<>Focuses on exceptions and rare occurrences. Uses words like <CodeExample>rarely</CodeExample>, <CodeExample>sometimes</CodeExample>, <CodeExample>seldom</CodeExample>.</>}
                                    high={<>Focuses on norms and regular events. Uses words like <CodeExample>always</CodeExample>, <CodeExample>usually</CodeExample>, <CodeExample>typically</CodeExample>.</>}
                                />
                            </SettingDefinition>
                             <SettingDefinition
                                title="Questioning Frequency"
                                description="A categorical setting that complements the 'Questions %'. It influences turn-taking behavior and the likelihood of asking questions, regardless of the overall speech function mix."
                            />
                            <SettingDefinition
                                title="Appraisal"
                                description="Controls the persona's attitude, emotional tone, and use of evaluative language. This is a descriptive input that the model uses to 'flavor' its word choices."
                            >
                                <p className="text-gray-300">An appraisal of <CodeExample>Contemplative + Appreciative</CodeExample> will lead to language that is both thoughtful and positive (e.g., 'That's a <span className="italic">brilliant</span> way to think about it'), whereas <CodeExample>Objective and Detached</CodeExample> will produce more neutral phrasing (e.g., 'That is a <span className="italic">plausible</span> approach').</p>
                            </SettingDefinition>
                        </div>
                    </details>

                    <details className="bg-[#212934]/50 rounded-lg">
                        <summary className="flex items-center gap-3 text-xl font-bold text-[#e2a32d] p-4 cursor-pointer list-none details-summary">
                            <TextualIcon /> Textual Metafunction
                            <span className="ml-auto text-sm text-[#95aac0] font-normal details-arrow">{'>'}</span>
                        </summary>
                        <div className="p-4 border-t border-[#5c6f7e] space-y-2">
                            <SettingDefinition
                                title="Lexical Density"
                                description="Measures the concentration of information by controlling the ratio of content words (nouns, main verbs) to function words (prepositions, articles). It dictates whether the persona's language is more typical of writing or speaking."
                            >
                                 <ScaleInfo 
                                    low="More 'spoken-like'. Uses more function words to build complex grammar, resulting in lower information density per sentence. E.g., 'The thing that we need to do is to figure out what the next step is.'"
                                    high="More 'written-like'. Language is dense with content words, packing more information into fewer words, often using nominalization. E.g., 'The next step requires determination of subsequent actions.'"
                                />
                            </SettingDefinition>
                             <SettingDefinition
                                title="Grammatical Intricacy"
                                description="Controls the complexity of sentence structures, often in an inverse relationship with Lexical Density. High intricacy is characteristic of spoken language, using many clauses to link ideas in real-time."
                            >
                                <ScaleInfo 
                                    low="Simpler sentence structures with fewer clauses. More common in formal writing."
                                    high="Complex sentences with multiple dependent and subordinate clauses. More common in spontaneous speech."
                                />
                            </SettingDefinition>
                             <SettingDefinition
                                title="Thematic Progression"
                                description="Governs how information is structured and developed across sentences. It controls the flow from the 'Theme' (the starting point/topic) to the 'Rheme' (the new information about the topic)."
                            >
                                <p className="text-gray-300">A setting like <CodeExample>Split Rheme</CodeExample> allows the model to introduce multiple new ideas in one sentence's Rheme, then use each of those ideas as the Theme for subsequent sentences, creating a branching, exploratory dialogue style.</p>
                            </SettingDefinition>
                            <SettingDefinition
                                title="Reference Chains & Conjunctive Adverbs"
                                description="These settings control cohesion. 'Reference Chains' enable the use of pronouns (it, they, this) to track concepts across turns. 'Conjunctive Adverbs' enable words like 'however' or 'therefore' to explicitly signpost logical links, creating a more structured and formal discourse."
                            />
                            <SettingDefinition
                                title="Question Sequences"
                                description="Enables the persona to engage in logical, multi-turn question-answer sequences. When enabled, the model is more likely to ask relevant follow-up questions, making the dialogue more interactive and less disjointed."
                            />
                        </div>
                    </details>
                </main>
            </div>
             <style>{`
                .details-summary > .details-arrow { 
                    transition: transform 0.2s; 
                }
                details[open] > .details-summary > .details-arrow { 
                    transform: rotate(90deg); 
                }
             `}</style>
        </div>
    );
};
