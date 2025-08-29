
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { FullAnalysisResult, PersonaConfiguration, DialogueTurn } from '../types';

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        sflAnalysis: {
            type: Type.OBJECT,
            properties: {
                processDistribution: {
                    type: Type.OBJECT,
                    properties: {
                        material: { type: Type.NUMBER, description: "Percentage of material processes." },
                        mental: { type: Type.NUMBER, description: "Percentage of mental processes." },
                        relational: { type: Type.NUMBER, description: "Percentage of relational processes." },
                        verbal: { type: Type.NUMBER, description: "Percentage of verbal processes." },
                    },
                    required: ['material', 'mental', 'relational', 'verbal']
                },
                technicality: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "Technicality score from 1-10." },
                        description: { type: Type.STRING, description: "Brief description of the technicality score." },
                    },
                    required: ['score', 'description']
                },
                modalityProfile: { type: Type.STRING, description: "Summary of the document's modality profile." },
                appraisalSummary: { type: Type.STRING, description: "Summary of the use of evaluative language." },
                cohesionSummary: { type: Type.STRING, description: "Summary of the primary cohesive devices used." },
            },
            required: ['processDistribution', 'technicality', 'modalityProfile', 'appraisalSummary', 'cohesionSummary']
        },
        personaMapping: {
            type: Type.OBJECT,
            properties: {
                style: { type: Type.STRING, description: "The persona's communication style." },
                confidence: { type: Type.STRING, description: "The persona's confidence level." },
                stance: { type: Type.STRING, description: "The persona's stance." },
                organization: { type: Type.STRING, description: "The persona's organizational approach to communication." },
            },
            required: ['style', 'confidence', 'stance', 'organization']
        },
        personaConfiguration: {
            type: Type.OBJECT,
            properties: {
                ideational: {
                    type: Type.OBJECT,
                    properties: {
                        materialProcesses: { type: Type.NUMBER },
                        mentalProcesses: { type: Type.NUMBER },
                        relationalProcesses: { type: Type.NUMBER },
                        verbalProcesses: { type: Type.NUMBER },
                        technicalityLevel: { type: Type.NUMBER },
                        logicalRelations: { type: Type.STRING },
                    },
                    required: ['materialProcesses', 'mentalProcesses', 'relationalProcesses', 'verbalProcesses', 'technicalityLevel', 'logicalRelations']
                },
                interpersonal: {
                    type: Type.OBJECT,
                    properties: {
                        statements: { type: Type.NUMBER },
                        questions: { type: Type.NUMBER },
                        offersCommands: { type: Type.NUMBER },
                        probabilityModality: { type: Type.NUMBER },
                        usualityModality: { type: Type.NUMBER },
                        questioningFrequency: { type: Type.STRING },
                        appraisal: { type: Type.STRING },
                    },
                    required: ['statements', 'questions', 'offersCommands', 'probabilityModality', 'usualityModality', 'questioningFrequency', 'appraisal']
                },
                textual: {
                    type: Type.OBJECT,
                    properties: {
                        lexicalDensity: { type: Type.NUMBER },
                        grammaticalIntricacy: { type: Type.NUMBER },
                        referenceChains: { type: Type.STRING },
                        conjunctiveAdverbs: { type: Type.STRING },
                        thematicProgression: { type: Type.STRING },
                        questionSequences: { type: Type.STRING },
                    },
                    required: ['lexicalDensity', 'grammaticalIntricacy', 'referenceChains', 'conjunctiveAdverbs', 'thematicProgression', 'questionSequences']
                },
            },
            required: ['ideational', 'interpersonal', 'textual']
        },
    },
    required: ['sflAnalysis', 'personaMapping', 'personaConfiguration']
};


const constructPrompt = (text: string): string => {
  return `
    Analyze the following source document from the perspective of Systemic Functional Linguistics (SFL).
    Based on your analysis, generate a single, valid JSON object that conforms to the provided schema.
    Your task is to populate all fields of the JSON schema with values derived from the document's linguistic features.

    **Source Document:**
    """
    ${text}
    """

    **Instructions for JSON Generation:**
    1.  **sflAnalysis**:
        *   \`processDistribution\`: Calculate the percentage of Material, Mental, Relational, and Verbal processes. The sum must be 100.
        *   \`technicality\`: Score from 1-10 and provide a brief justification.
        *   \`modalityProfile\`, \`appraisalSummary\`, \`cohesionSummary\`: Provide concise summaries based on the document's language.
    2.  **personaMapping**:
        *   Synthesize a communication \`style\`, \`confidence\` level, \`stance\`, and \`organization\` approach from the SFL analysis. For example, a document high in relational processes might suggest a 'Definitional' style.
    3.  **personaConfiguration**:
        *   Translate the SFL analysis into specific numerical and string values for each field under \`ideational\`, \`interpersonal\`, and \`textual\` settings. This is a direct translation of the linguistic features into a configuration profile.
        *   Ensure all percentages sum to 100 where required (e.g., process distribution, speech functions).

    The output must be ONLY the JSON object, without any surrounding text or markdown.
    `;
};

export const analyzeDocument = async (text: string, model: string, thinkingBudget?: number): Promise<FullAnalysisResult> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = constructPrompt(text);
    
    const config: { [key: string]: any } = {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
    };

    if (model === 'gemini-2.5-flash' && typeof thinkingBudget === 'number') {
        config.thinkingConfig = { thinkingBudget };
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config,
        });
        
        if (!response.text) {
             if (response.promptFeedback?.blockReason) {
                throw new Error(`The request was blocked by content safety filters. Reason: ${response.promptFeedback.blockReason}. Please modify the document and try again.`);
            }
            throw new Error("The API returned an empty response. This is often caused by the model failing to generate a valid JSON that conforms to the schema. Please try with a different or simplified document.");
        }

        const jsonStr = response.text.trim();
        const parsedData: FullAnalysisResult = JSON.parse(jsonStr);
        return parsedData;

    } catch (error) {
        console.error("Error analyzing document:", error);
        if (error instanceof Error) {
           throw new Error(`Failed to analyze document with Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred during analysis.");
    }
};

const constructDialoguePrompt = (
    configs: [PersonaConfiguration, PersonaConfiguration], 
    topic: string,
    context: string,
    length: string
): string => {
  const [configA, configB] = configs;

  return `
You are an expert dialogue writer. Your task is to generate an engaging podcast-style dialogue between two speakers (Speaker A and Speaker B), each with a distinct Systemic Functional Linguistics (SFL) persona configuration.

**Core Instructions:**
1.  **Topic:** The dialogue MUST be about: "${topic}".
2.  **Context:** The dialogue should incorporate and reference the following contextual material: "${context || 'No specific context provided.'}".
3.  **Length:** The dialogue should be of a "${length}" length.
4.  **Adherence:** Strictly adhere to the linguistic specifications for EACH speaker provided below.

---

**SPEAKER A PERSONA PROFILE:**

**1. IDEATIONAL (What Speaker A talks about):**
*   **Process Mix:** Material: ${configA.ideational.materialProcesses}%, Mental: ${configA.ideational.mentalProcesses}%, Relational: ${configA.ideational.relationalProcesses}%, Verbal: ${configA.ideational.verbalProcesses}%.
*   **Technicality Level:** ${configA.ideational.technicalityLevel}/10.
*   **Logical Relations:** Prefers ${configA.ideational.logicalRelations}.

**2. INTERPERSONAL (How Speaker A interacts):**
*   **Speech Functions (Overall Turn Mix):** ${configA.interpersonal.statements}% Statements, ${configA.interpersonal.questions}% Questions, ${configA.interpersonal.offersCommands}% Offers/Commands.
*   **Modality Profile:**
    *   Probability/Certainty Score: ${configA.interpersonal.probabilityModality}/10.
    *   Usuality Score: ${configA.interpersonal.usualityModality}/10.
*   **Appraisal:** Adopts a tone that is ${configA.interpersonal.appraisal}.

**3. TEXTUAL (How Speaker A organizes text):**
*   **Linguistic Style:** Lexical density is ${configA.textual.lexicalDensity}/10; Grammatical intricacy is ${configA.textual.grammaticalIntricacy}/10.
*   **Cohesion:** Uses ${configA.textual.referenceChains} and ${configA.textual.conjunctiveAdverbs}.
*   **Thematic Progression:** Follows a pattern of ${configA.textual.thematicProgression}.

---

**SPEAKER B PERSONA PROFILE:**

**1. IDEATIONAL (What Speaker B talks about):**
*   **Process Mix:** Material: ${configB.ideational.materialProcesses}%, Mental: ${configB.ideational.mentalProcesses}%, Relational: ${configB.ideational.relationalProcesses}%, Verbal: ${configB.ideational.verbalProcesses}%.
*   **Technicality Level:** ${configB.ideational.technicalityLevel}/10.
*   **Logical Relations:** Prefers ${configB.ideational.logicalRelations}.

**2. INTERPERSONAL (How Speaker B interacts):**
*   **Speech Functions (Overall Turn Mix):** ${configB.interpersonal.statements}% Statements, ${configB.interpersonal.questions}% Questions, ${configB.interpersonal.offersCommands}% Offers/Commands.
*   **Modality Profile:**
    *   Probability/Certainty Score: ${configB.interpersonal.probabilityModality}/10.
    *   Usuality Score: ${configB.interpersonal.usualityModality}/10.
*   **Appraisal:** Adopts a tone that is ${configB.interpersonal.appraisal}.

**3. TEXTUAL (How Speaker B organizes text):**
*   **Linguistic Style:** Lexical density is ${configB.textual.lexicalDensity}/10; Grammatical intricacy is ${configB.textual.grammaticalIntricacy}/10.
*   **Cohesion:** Uses ${configB.textual.referenceChains} and ${configB.textual.conjunctiveAdverbs}.
*   **Thematic Progression:** Follows a pattern of ${configB.textual.thematicProgression}.

---

**OUTPUT INSTRUCTIONS:**
*   Generate a dialogue starting with Speaker A.
*   Format the output with "Speaker A:" and "Speaker B:" prefixes for each turn.
*   Ensure each speaker's dialogue strictly adheres to their specified linguistic profile.
*   Do NOT include any other text, explanations, or analysis. Only the dialogue itself.
  `;
};

export const generateDialogue = async (
    configs: [PersonaConfiguration, PersonaConfiguration],
    topic: string,
    context: string,
    length: string,
    model: string,
    thinkingBudget?: number
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = constructDialoguePrompt(configs, topic, context, length);

    const config: { [key: string]: any } = {
        temperature: 0.75, // More creative for dialogue
    };

    if (model === 'gemini-2.5-flash' && typeof thinkingBudget === 'number') {
        config.thinkingConfig = { thinkingBudget };
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config,
        });
        
        if (!response || !response.text) {
            throw new Error("The API returned an empty dialogue. This may be due to content safety filters or other issues.");
        }
        
        return response.text;

    } catch (error) {
        console.error("Error generating dialogue:", error);
        if (error instanceof Error) {
           throw new Error(`Failed to generate dialogue with Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred during dialogue generation.");
    }
};


const constructRefinePrompt = (originalText: string, config: PersonaConfiguration, userPrompt: string): string => {
    return `
You are an AI assistant helping a user refine a single line of dialogue.

**Your Persona:**
You must adopt the following SFL persona configuration for your response.
*   **Ideational Profile:** Process Mix (Mat: ${config.ideational.materialProcesses}%, Men: ${config.ideational.mentalProcesses}%, Rel: ${config.ideational.relationalProcesses}%, Ver: ${config.ideational.verbalProcesses}%); Technicality: ${config.ideational.technicalityLevel}/10.
*   **Interpersonal Profile:** Speech Mix (Stmt: ${config.interpersonal.statements}%, Qst: ${config.interpersonal.questions}%, Off/Cmd: ${config.interpersonal.offersCommands}%); Modality (Prob: ${config.interpersonal.probabilityModality}/10, Usu: ${config.interpersonal.usualityModality}/10); Appraisal: ${config.interpersonal.appraisal}.
*   **Textual Profile:** Lexical Density: ${config.textual.lexicalDensity}/10; Grammatical Intricacy: ${config.textual.grammaticalIntricacy}/10.

**Task:**
Rewrite the following line of dialogue based *only* on the user's instruction.

**Original Dialogue Line:**
"${originalText}"

**User's Instruction:**
"${userPrompt}"

**Output Rules:**
1.  Return **only the rewritten dialogue line**.
2.  Do **not** add any prefixes like "Speaker A:" or explanations.
3.  Ensure the rewritten line maintains the core persona defined above.
`;
}


export const refineDialogueTurn = async (originalText: string, personaConfig: PersonaConfiguration, userPrompt: string, model: string, thinkingBudget?: number): Promise<string> => {
     if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = constructRefinePrompt(originalText, personaConfig, userPrompt);
    
    const config: { [key: string]: any } = {
        temperature: 0.6
    };

    if (model === 'gemini-2.5-flash' && typeof thinkingBudget === 'number') {
        config.thinkingConfig = { thinkingBudget };
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config
        });
        if (!response || !response.text) {
            throw new Error("The API returned an empty refinement. Please try a different prompt.");
        }
        return response.text.trim();
    } catch (error) {
        console.error("Error refining dialogue turn:", error);
        if (error instanceof Error) {
           throw new Error(`Refinement failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during refinement.");
    }
};

const constructNextLinePrompt = (history: DialogueTurn[], nextSpeaker: 'Speaker A' | 'Speaker B', config: PersonaConfiguration, userPrompt: string): string => {
    const historyText = history.map(turn => `${turn.speaker}: ${turn.text}`).join('\n');

    return `
You are an AI assistant generating the next line in a dialogue.

**Your Persona (for the new line):**
You are ${nextSpeaker}. You must adopt the following SFL persona configuration.
*   **Ideational Profile:** Process Mix (Mat: ${config.ideational.materialProcesses}%, Men: ${config.ideational.mentalProcesses}%, Rel: ${config.ideational.relationalProcesses}%, Ver: ${config.ideational.verbalProcesses}%); Technicality: ${config.ideational.technicalityLevel}/10.
*   **Interpersonal Profile:** Speech Mix (Stmt: ${config.interpersonal.statements}%, Qst: ${config.interpersonal.questions}%, Off/Cmd: ${config.interpersonal.offersCommands}%); Modality (Prob: ${config.interpersonal.probabilityModality}/10, Usu: ${config.interpersonal.usualityModality}/10); Appraisal: ${config.interpersonal.appraisal}.
*   **Textual Profile:** Lexical Density: ${config.textual.lexicalDensity}/10; Grammatical Intricacy: ${config.textual.grammaticalIntricacy}/10.

**Task:**
Based on the dialogue history below and the following user instruction, generate a single, logical next line for your character (${nextSpeaker}).

**Dialogue History:**
${historyText}

**User Instruction:**
"${userPrompt}"

**Output Rules:**
1.  Return **only the new dialogue line**.
2.  Do **not** add any prefixes like "Speaker A:" or explanations.
3.  Ensure the new line is a natural continuation of the conversation and strictly adheres to your persona and the user instruction.
`;
}

export const generateNextDialogueTurn = async (history: DialogueTurn[], nextSpeaker: 'Speaker A' | 'Speaker B', personaConfig: PersonaConfiguration, userPrompt: string, model: string, thinkingBudget?: number): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = constructNextLinePrompt(history, nextSpeaker, personaConfig, userPrompt);

    const config: { [key: string]: any } = {
        temperature: 0.7
    };

    if (model === 'gemini-2.5-flash' && typeof thinkingBudget === 'number') {
        config.thinkingConfig = { thinkingBudget };
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config
        });
        if (!response || !response.text) {
            throw new Error("The API failed to generate the next line.");
        }
        return response.text.trim();
    } catch (error) {
        console.error("Error generating next dialogue turn:", error);
        if (error instanceof Error) {
           throw new Error(`Generation failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the next line.");
    }
}

export const getAvailableModels = async (): Promise<string[]> => {
    // In a real scenario, this would make an API call to list available models.
    // For this demonstration, we'll simulate a network delay and return a
    // list of plausible model names to show the dynamic fetching works.
    console.log("Fetching available Gemini models...");
    return new Promise(resolve => {
        setTimeout(() => {
            // The app is configured to default to 'gemini-2.5-flash' for generation
            // tasks, but we list others here to demonstrate the UI's dynamic capability.
            resolve([
                'gemini-2.5-flash',
                'gemini-2.0-flash',
                'gemini-1.5-pro-latest',
                'gemini-1.5-flash-latest'
            ]);
        }, 500); // Simulate network latency
    });
};
