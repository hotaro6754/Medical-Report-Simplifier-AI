import { MedicalReport } from '../types/medical';

export const mockReportData: MedicalReport = {
    id: "demo-report-001",
    userId: "demo-user",
    type: "Comprehensive Metabolic & Lipid Panel",
    uploadedAt: new Date(),
    severity: "attention",
    confidence: 0.96,
    healthScore: 68,
    riskAssessment: "moderate",
    summary: "The analysis of your comprehensive metabolic and lipid panel indicates predominantly normal organ function, but flags emerging cardiovascular and metabolic risks. Your liver and kidney markers are within healthy ranges. However, elevated HbA1c suggests pre-diabetes, and an imbalanced lipid profile (high LDL, low HDL) indicates a moderate risk of atherosclerotic cardiovascular disease. Prompt lifestyle modifications in diet and exercise are highly recommended to reverse these trends.",
    hindiExplanation: "आपकी रक्त परीक्षण रिपोर्ट (Comprehensive Metabolic & Lipid Panel) का विश्लेषण हमने कर लिया है। आपके लिवर (यकृत) और किडनी (गुर्दे) बिल्कुल स्वस्थ काम कर रहे हैं, जो एक बहुत अच्छी खबर है। \n\nहालांकि, कुछ संकेतकों पर ध्यान देने की जरूरत है। आपका HbA1c (पिछले 3 महीने का औसत ब्लड शुगर) थोड़ा बढ़ा हुआ है, जो 'प्री-डायबिटीज' (मधुमेह से पहले की स्थिति) का संकेत देता है। इसके अलावा, आपका 'खराब कोलेस्ट्रॉल' (LDL) अधिक है और 'अच्छा कोलेस्ट्रॉल' (HDL) कम है। इस स्थिति से भविष्य में हृदय (दिल) से जुड़ी बीमारियों का खतरा बढ़ सकता है। \n\nघबराने की कोई बात नहीं है। नियमित व्यायाम और खान-पान में थोड़े से बदलाव करके आप इन स्तरों को वापस सामान्य कर सकते हैं।",
    dietaryAdvice: [
        "Increase intake of soluble fiber (oats, beans, lentils, apples) to help lower LDL cholesterol.",
        "Replace saturated fats with heart-healthy unsaturated fats (olive oil, avocados, nuts).",
        "Minimize refined carbohydrates and sugary beverages to help manage blood sugar (HbA1c) levels.",
        "Incorporate Omega-3 rich foods like chia seeds, flaxseeds, or fatty fish at least twice a week."
    ],
    nextSteps: [
        "Schedule a follow-up consultation with a primary care physician to discuss your lipid profile and pre-diabetes status.",
        "Begin a moderate aerobic exercise routine (e.g., brisk walking) for at least 150 minutes per week.",
        "Consider consulting a registered dietitian to create a sustainable, heart-healthy meal plan.",
        "Repeat this metabolic and lipid panel in 3 to 6 months to track progress."
    ],
    parameters: [
        {
            name: "Fasting Blood Glucose",
            value: "108",
            unit: "mg/dL",
            normalRange: "70 - 99 mg/dL",
            status: "attention",
            explanation: "Measures the amount of sugar (glucose) in your blood after fasting. Your level is slightly elevated (Impaired Fasting Glucose), indicating pre-diabetes.",
            actionableAdvice: "Avoid sugary breakfast foods. Ensure you are getting at least 7-8 hours of sleep, as poor sleep can increase morning blood sugar."
        },
        {
            name: "Hemoglobin A1c (HbA1c)",
            value: "6.2",
            unit: "%",
            normalRange: "4.0 - 5.6 %",
            status: "attention",
            explanation: "Reflects your average blood sugar levels over the past 2-3 months. A level of 6.2% confirms a pre-diabetic state.",
            actionableAdvice: "Focus on portion control and pair carbohydrates with proteins or healthy fats to prevent rapid sugar spikes."
        },
        {
            name: "Total Cholesterol",
            value: "235",
            unit: "mg/dL",
            normalRange: "< 200 mg/dL",
            status: "attention",
            explanation: "The total amount of cholesterol in your blood. Elevated levels contribute to plaque buildup in arteries.",
            actionableAdvice: "Reduce consumption of full-fat dairy and processed red meats."
        },
        {
            name: "LDL Cholesterol (Bad)",
            value: "155",
            unit: "mg/dL",
            normalRange: "< 100 mg/dL",
            status: "critical",
            explanation: "Often called 'bad' cholesterol because it deposits in the walls of your arteries. Your levels are significantly high.",
            actionableAdvice: "Strictly limit foods high in trans fats (often found in commercial baked goods and fried foods)."
        },
        {
            name: "HDL Cholesterol (Good)",
            value: "38",
            unit: "mg/dL",
            normalRange: "> 40 mg/dL (Men) / > 50 mg/dL (Women)",
            status: "attention",
            explanation: "Known as 'good' cholesterol because it helps remove other forms of cholesterol from your bloodstream. Your level is too low.",
            actionableAdvice: "Regular cardiovascular exercise (like jogging or swimming) is one of the most effective ways to raise HDL naturally."
        },
        {
            name: "Triglycerides",
            value: "180",
            unit: "mg/dL",
            normalRange: "< 150 mg/dL",
            status: "attention",
            explanation: "A type of fat found in your blood, often elevated by excess calories, alcohol, or sugar.",
            actionableAdvice: "Cut back on alcohol and refined white carbohydrates (white bread, pasta, white rice)."
        },
        {
            name: "Serum Creatinine",
            value: "0.9",
            unit: "mg/dL",
            normalRange: "0.6 - 1.2 mg/dL",
            status: "normal",
            explanation: "A waste product from muscle metabolism filtered by the kidneys. Your normal level indicates healthy kidney function.",
        },
        {
            name: "ALT (SGPT)",
            value: "28",
            unit: "U/L",
            normalRange: "7 - 56 U/L",
            status: "normal",
            explanation: "An enzyme found primarily in the liver. Normal levels suggest your liver is functioning well without acute inflammation.",
        }
    ],
    citations: [
        {
            title: "Diagnosis and Classification of Diabetes Mellitus",
            url: "https://diabetesjournals.org/care/article/33/Supplement_1/S62/37841/Diagnosis-and-Classification-of-Diabetes-Mellitus",
            description: "American Diabetes Association guidelines establishing HbA1c 5.7–6.4% as the diagnostic criteria for pre-diabetes."
        },
        {
            title: "AHA/ACC Guideline on the Management of Blood Cholesterol",
            url: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000625",
            description: "Key guidelines outlining the cardiovascular risks associated with LDL > 130 mg/dL and the importance of lifestyle therapeutic interventions."
        },
        {
            title: "The role of dietary fiber in the prevention of cardiovascular disease",
            url: "https://pubmed.ncbi.nlm.nih.gov/29276461/",
            description: "Clinical evidence demonstrating that increased soluble fiber intake directly correlates with reductions in LDL serum cholesterol."
        }
    ]
};
