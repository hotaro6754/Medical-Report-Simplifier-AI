export type Severity = 'normal' | 'attention' | 'critical';

export interface MedicalParameter {
    name: string;
    value: string;
    unit: string;
    normalRange?: string;
    status: Severity;
    explanation: string;
    actionableAdvice?: string;
    boundingBox?: {
        ymin: number;
        xmin: number;
        ymax: number;
        xmax: number;
    };
}

export type RiskAssessment = 'low' | 'moderate' | 'high';

export interface Citation {
    title: string;
    url: string;
    description: string;
}

export interface MedicalReport {
    id: string;
    userId: string;
    type: string;
    uploadedAt: Date;
    severity: Severity;
    confidence: number;
    parameters: MedicalParameter[];
    summary: string;
    healthScore: number;
    riskAssessment: RiskAssessment;
    dietaryAdvice: string[];
    nextSteps: string[];
    regionalExplanation?: string;
    audioUrl?: string;
    imageMimeType?: string;
    imageBase64?: string;
    citations?: Citation[];
}

export interface Facility {
    id: string;
    name: string;
    type: 'phc' | 'chc' | 'hospital' | 'clinic';
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    distance?: number;
    isGovernment: boolean;
    acceptsPMJAY: boolean;
    phone?: string;
}
