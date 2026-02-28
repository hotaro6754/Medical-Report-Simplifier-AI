'use client';

import React, { createContext, useContext, useState } from 'react';

export type Language =
    | 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml' | 'mr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    sarvamCode: string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        heroBadge: "Healthcare Intelligence for Bharat",
        heroTitle1: "INSIGHT FOR",
        heroTitle2: "EVERY INDIAN.",
        heroSubtitle: "Swasthya AI simplifies complex lab reports into plain regional languages. Empowering Bharat with health literacy.",
        analyzeBtn: "Analyze Report",
        scrollText: "Scroll to read the story",
        dropTitle: "Drop Your Report",
        dropDesc: "Get an instant, simplified explanation of your lab results in your regional language.",
        selectFileBtn: "Select Medical File",
        processingTitle: "Swasthya AI is analyzing...",
        aiSummary: "AI Summary",
        measuredParameters: "Measured Parameters",
        scientificReferences: "Scientific References",
        clearResults: "Clear Results",
        privacyPolicy: "Privacy Policy",
        medicalDisclaimer: "Medical Disclaimer",
        termsOfUse: "Terms of Use",
        trustedBy: "Trusted by 5,000+ users across Bharat",
    },
    hi: {
        heroBadge: "भारत के लिए स्वास्थ्य इंटेलिजेंस",
        heroTitle1: "सटीक जानकारी",
        heroTitle2: "हर भारतीय के लिए।",
        heroSubtitle: "स्वास्थ्य AI जटिल लैब रिपोर्ट को सरल क्षेत्रीय भाषाओं में समझाता है। भारत को स्वास्थ्य साक्षरता के साथ सशक्त बनाना।",
        analyzeBtn: "रिपोर्ट का विश्लेषण करें",
        dropTitle: "अपनी रिपोर्ट यहाँ डालें",
        dropDesc: "अपनी क्षेत्रीय भाषा में अपने लैब परिणामों का तत्काल विवरण प्राप्त करें।",
        selectFileBtn: "फाइल चुनें",
        processingTitle: "स्वास्थ्य AI विश्लेषण कर रहा है...",
    },
    te: {
        heroBadge: "భారత్ కోసం ఆరోగ్య మేధస్సు",
        heroTitle1: "ఖచ్చితమైన సమాచారం",
        heroTitle2: "ప్రతి భారతీయుడి కోసం.",
        heroSubtitle: "స్వాస్థ్య AI క్లిష్టమైన ల్యాబ్ రిపోర్టులను సాధారణ ప్రాంతీయ భాషల్లోకి మారుస్తుంది.",
        analyzeBtn: "విశ్లేషించండి",
        dropTitle: "రిపోర్టును ఇక్కడ వేయండి",
        dropDesc: "మీ ప్రాంతీయ భాషలో తక్షణ వివరణ పొందండి.",
        selectFileBtn: "ఫైల్‌ను ఎంచుకోండి",
        processingTitle: "స్వాస్థ్య AI విశ్లేషిస్తోంది...",
    },
    ta: {
        heroBadge: "பாரதத்திற்கான சுகாதார நுண்ணறிவு",
        heroTitle1: "துல்லியமான தகவல்",
        heroTitle2: "ஒவ்வொரு இந்தியருக்கும்.",
        heroSubtitle: "சுவஸ்தியா AI சிக்கலான ஆய்வக அறிக்கைகளை எளிய வட்டார மொழிகளில் விளக்குகிறது.",
        analyzeBtn: "பகுப்பாய்வு செய்",
        dropTitle: "உங்கள் அறிக்கையை இங்கே பதிவேற்றவும்",
        processingTitle: "சுவஸ்தியா AI பகுப்பாய்வு செய்கிறது...",
    },
    kn: {
        heroBadge: "ಭಾರತಕ್ಕಾಗಿ ಆರೋಗ್ಯ ಬುದ್ಧಿವಂತಿಕೆ",
        heroTitle1: "ನಿಖರ ಮಾಹಿತಿ",
        heroTitle2: "ಪ್ರತಿ ಭಾರತೀಯನಿಗಾಗಿ.",
        heroSubtitle: "ಸ್ವಾಸ್ಥ್ಯ AI ಸಂಕೀರ್ಣ ಲ್ಯಾಬ್ ವರದಿಗಳನ್ನು ಸರಳ ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳಿಗೆ ಸುಗಮಗೊಳಿಸುತ್ತದೆ.",
        analyzeBtn: "ವಿಶ್ಲೇಷಿಸಿ",
        dropTitle: "ನಿಮ್ಮ ವರದಿಯನ್ನು ಇಲ್ಲಿ ಹಾಕಿ",
        processingTitle: "ಸ್ವಾಸ್ಥ್ಯ AI ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
    },
    ml: {
        heroBadge: "ഭാരതത്തിനായി ആരോഗ്യ ബുദ്ധി",
        heroTitle1: "കൃത്യമായ വിവരം",
        heroTitle2: "ഓരോ ഭാരതീയനും.",
        heroSubtitle: "സ്വാസ്ഥ്യ AI സങ്കീർണ്ണമായ ലാബ് റിപ്പോർട്ടുകളെ ലളിതമായ പ്രാദേശಿಕ ഭാഷകളിലേക്ക് മാറ്റുന്നു.",
        analyzeBtn: "വിശകലനം ചെയ്യുക",
        dropTitle: "റിപ്പോർട്ട് ഇവിടെ നൽകുക",
        processingTitle: "സ്വാಸ್ಥ്യ AI വിശകലനം ചെയ്യുന്നു...",
    },
    mr: {
        heroBadge: "भारतासाठी आरोग्य बुद्धिमत्ता",
        heroTitle1: "अचूक माहिती",
        heroTitle2: "प्रत्येक भारतीयासाठी.",
        heroSubtitle: "स्वास्थ्या AI क्लिष्ट लॅब रिपोर्ट्स सोप्या प्रादेशिक भाषांमध्ये समजून सांगते.",
        analyzeBtn: "विश्लेषण करा",
        dropTitle: "तुमचा रिपोर्ट येथे टाका",
        processingTitle: "स्वास्थ्या AI विश्लेषण करत आहे...",
    }
};

const sarvamMapping: Record<Language, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    te: 'te-IN',
    ta: 'ta-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    mr: 'mr-IN',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string) => {
        return translations[language]?.[key] || translations['en']?.[key] || key;
    };

    const sarvamCode = sarvamMapping[language] || 'en-IN';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, sarvamCode }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
