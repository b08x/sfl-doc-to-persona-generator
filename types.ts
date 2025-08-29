

export interface ProcessDistribution {
  material: number;
  mental: number;
  relational: number;
  verbal: number;
}

export interface Technicality {
    score: number;
    description: string;
}

export interface SFLAnalysis {
  processDistribution: ProcessDistribution;
  technicality: Technicality;
  modalityProfile: string;
  appraisalSummary: string;
  cohesionSummary: string;
}

export interface PersonaMapping {
  style: string;
  confidence: string;
  stance: string;
  organization: string;
}

export interface IdeationalSettings {
  materialProcesses: number;
  mentalProcesses: number;
  relationalProcesses: number;
  verbalProcesses: number;
  technicalityLevel: number;
  logicalRelations: string;
}

export interface InterpersonalSettings {
  statements: number;
  questions: number;
  offersCommands: number;
  probabilityModality: number;
  usualityModality: number;
  questioningFrequency: string;
  appraisal: string;
}

export interface TextualSettings {
  lexicalDensity: number;
  grammaticalIntricacy: number;
  referenceChains: string;
  conjunctiveAdverbs: string;
  thematicProgression: string;
  questionSequences: string;
}


export interface PersonaConfiguration {
  ideational: IdeationalSettings;
  interpersonal: InterpersonalSettings;
  textual: TextualSettings;
}

export interface FullAnalysisResult {
    sflAnalysis: SFLAnalysis;
    personaMapping: PersonaMapping;
    personaConfiguration: PersonaConfiguration;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  analysis: FullAnalysisResult;
}

export interface DialogueTurn {
    id: string;
    speaker: 'Speaker A' | 'Speaker B';
    personaName: string;
    text: string;
}