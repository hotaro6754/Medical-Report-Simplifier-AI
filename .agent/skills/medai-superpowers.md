# Swasthya AI: Agentic Superpowers ⚡

This document outlines the core agentic capabilities of Swasthya AI, serving as a guide for future development and scaling.

## 1. Clinical Intake & Triage Vision Agent
- **Logic:** `src/medai/ai/extraction-agent.ts`
- **Capabilities:**
    - Document Classification: LAB_REPORT, CLINICAL_PRESCRIPTION, etc.
    - OCR-based Data Extraction.
    - Triage logic for identifying critical medical values.

## 2. Advanced Clinical & Pharmacological Diagnostics Copilot
- **Logic:** `src/medai/ai/analysis-agent.ts`
- **Capabilities:**
    - Pathology breakdown (ICD-10, cellular pathophysiology).
    - Pharmacological mapping (Drug classes, mechanisms of action).
    - Literature correlation (Simulated PubMed/Bio_ClinicalBERT retrieval).

## 3. Multilingual Audio & Translation Layer
- **Logic:** `src/medai/ai/sarvam-actions.ts`, `src/medai/components/LanguageContext.tsx`
- **Capabilities:**
    - 7 Target Languages: English, Hindi, Telugu, Kannada, Malayalam, Tamil, Marathi.
    - Sarvam AI STT & TTS integration.
