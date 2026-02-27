export type Severity = 'normal' | 'attention' | 'critical';

export interface MedicalParameter {
  name: string;
  value: string;
  unit: string;
  normalRange?: string;
  status: Severity;
  explanation: string;
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
  hindiExplanation?: string;
  audioUrl?: string;
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
