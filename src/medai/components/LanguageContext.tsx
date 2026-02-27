'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language =
    | 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml'
    | 'bn' | 'mr' | 'gu' | 'pa' | 'or';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        heroBadge: "Healthcare Intelligence for Bharat",
        heroTitle1: "INSIGHT FOR",
        heroTitle2: "FOR EVERY INDIAN.",
        heroSubtitle: "Swasthya AI simplifies complex lab reports into plain regional languages. Empowering Bharat with health literacy.",
        analyzeBtn: "Analyze Report",
        scrollText: "Scroll to read the story",
        story1Title: "The Mother's Panic",
        story1Desc: "Your mom gets a blood test. 30+ numbers, weird words like 'eosinophils'. She panics, googles, and worries all night.",
        story2Title: "Lost in Translation",
        story2Desc: "English reports. 65% of rural India doesn't understand them. 50km travels just to ask: 'Is this normal?'",
        story3Title: "The Solution",
        story3Desc: "Upload a photo. Our AI reads, understands, and explains in simple words. Telugu. Hindi. Tamil. No confusion.",
        story4Title: "Listen, Don't Read",
        story4Desc: "Natural voices by Sarvam AI. High-fidelity narration in regional accents. Every person deserves to understand their health.",
        story5Title: "Smart Locator",
        story5Desc: "Instantly find the nearest hospital. Prioritizing free government facilities for those who need them most.",
        analysisTitle: "AI Analysis",
        analysisSubtitle: "Drop your report below and watch the intelligence work.",
        dropTitle: "Drop Your Report",
        dropDesc: "Get an instant, simplified explanation of your lab results in your regional language.",
        selectFileBtn: "Select Medical File",
        trustedBy: "Trusted by 5,000+ users across Bharat",
        processingTitle: "AI Agents are analyzing your report...",
        processingDesc: "Extracting parameters & assessing severity",
        aiSummary: "AI Summary",
        scientificReferences: "Scientific References",
        measuredParameters: "Measured Parameters",
        normalRange: "Normal Range",
        processedOn: "Processed on",
        clearResults: "Clear Results & Upload Another",
        privacyPolicy: "Privacy Policy",
        medicalDisclaimer: "Medical Disclaimer",
        termsOfUse: "Terms of Use",
        storyTitle: "The Story",
        voiceTitle: "Regional Voice",
        careTitle: "Care Finder",
        findingCare: "Finding nearest care facilities...",
        recomCare: "Recommended Nearby Care",
        callBtn: "Call",
        directionsBtn: "Directions",
        careDisclaimer: "*Prioritizing free government facilities based on medical necessity.",
        hoverTip: "Tip: Hover over the report image to see AI-detected values highlighted.",
    },
    hi: {
        heroBadge: "भारत के लिए स्वास्थ्य इंटेलिजेंस",
        heroTitle1: "सटीक जानकारी",
        heroTitle2: "हर भारतीय के लिए।",
        heroSubtitle: "स्वास्थ्य AI जटिल लैब रिपोर्ट को सरल क्षेत्रीय भाषाओं में समझाता है। भारत को स्वास्थ्य साक्षरता के साथ सशक्त बनाना।",
        analyzeBtn: "रिपोर्ट का विश्लेषण करें",
        scrollText: "कहानी पढ़ने के लिए स्क्रॉल करें",
        story1Title: "माँ की घबराहट",
        story1Desc: "आपकी माँ का ब्लड टेस्ट होता है। 30+ नंबर, 'ईोसिनोफिल्स' जैसे अजीब शब्द। वह घबरा जाती हैं, गूगल करती हैं और पूरी रात चिंता करती हैं।",
        story2Title: "अनुवाद में खोया हुआ",
        story2Desc: "अंग्रेजी रिपोर्ट। ग्रामीण भारत के 65% लोग उन्हें नहीं समझते हैं। सिर्फ यह पूछने के लिए 50 किमी की यात्रा करते हैं कि 'क्या यह सामान्य है?'",
        story3Title: "समाधान",
        story3Desc: "एक फोटो अपलोड करें। हमारा AI पढ़ता है, समझता है और सरल शब्दों में समझाता है। तेलुगु। हिंदी। तमिल। कोई भ्रम नहीं।",
        story4Title: "सुनें, पढ़ें नहीं",
        story4Desc: "सर्वम AI द्वारा प्राकृतिक आवाज़ें। क्षेत्रीय लहजों में उच्च गुणवत्ता वाले वर्णन। हर व्यक्ति अपने स्वास्थ्य को समझने का हकदार है।",
        story5Title: "स्मार्ट लोकेटर",
        story5Desc: "तुरंत निकटतम अस्पताल खोजें। उन लोगों के लिए मुफ्त सरकारी सुविधाओं को प्राथमिकता देना जिन्हें उनकी सबसे अधिक आवश्यकता है।",
        analysisTitle: "AI विश्लेषण",
        analysisSubtitle: "अपनी रिपोर्ट नीचे डालें और बुद्धिमत्ता का काम देखें।",
        dropTitle: "अपनी रिपोर्ट यहाँ डालें",
        dropDesc: "अपनी क्षेत्रीय भाषा में अपने लैब परिणामों का तत्काल, सरल विवरण प्राप्त करें।",
        selectFileBtn: "मेडिकल फाइल चुनें",
        trustedBy: "पूरे भारत में 5,000+ उपयोगकर्ताओं द्वारा भरोसा किया गया",
        processingTitle: "AI एजेंट आपकी रिपोर्ट का विश्लेषण कर रहे हैं...",
        processingDesc: "पैरामीटर निकालना और गंभीरता का आकलन करना",
        aiSummary: "AI सारांश",
        scientificReferences: "वैज्ञानिक संदर्भ",
        measuredParameters: "मापा गया पैरामीटर",
        normalRange: "सामान्य सीमा",
        processedOn: "संसाधित किया गया",
        clearResults: "परिणाम साफ़ करें और दूसरा अपलोड करें",
        privacyPolicy: "गोपनीयता नीति",
        medicalDisclaimer: "मेडिकल अस्वीकरण",
        termsOfUse: "उपयोग की शर्तें",
        storyTitle: "कहानी",
        voiceTitle: "क्षेत्रীয় आवाज़",
        careTitle: "देखभाल खोजें",
        findingCare: "निकटतम देखभाल सुविधाओं की खोज...",
        recomCare: "अनुशंसित नजदीकी देखभाल",
        callBtn: "कॉल करें",
        directionsBtn: "दिशा-निर्देश",
        careDisclaimer: "*चिकित्सा आवश्यकता के आधार पर मुफ्त सरकारी सुविधाओं को प्राथमिकता देना।",
        hoverTip: "सुझाव: एआई-पता लगाए गए मानों को हाइलाइट करने के लिए रिपोर्ट इमेज पर होवर करें।",
    },
    te: {
        heroBadge: "భారత్ కోసం ఆరోగ్య మేధస్సు",
        heroTitle1: "ఖచ్చితమైన సమాచారం",
        heroTitle2: "ప్రతి భారతీయుడి కోసం.",
        heroSubtitle: "స్వాస్థ్య AI క్లిష్టమైన ల్యాబ్ రిపోర్టులను సాధారణ ప్రాంతీయ భాషల్లోకి మారుస్తుంది. ఆరోగ్య అక్షరాస్యతతో భారత్‌ను శక్తివంతం చేస్తుంది.",
        analyzeBtn: "నివేదికను విశ్లేషించండి",
        scrollText: "కథ చదవడానికి స్క్రోల్ చేయండి",
        story1Title: "తల్లి ఆందోళన",
        story1Desc: "మీ అమ్మకు రక్త పరీక్ష జరిగింది. 30+ సంఖ్యలు, 'eosinophils' వంటి వింత పదాలు. ఆమె భయపడి, గూగుల్ చేసి, రాత్రంతా ఆందోళన చెందుతుంది.",
        story2Title: "అనువాదంలో లోపం",
        story2Desc: "ఇంగ్లీష్ రిపోర్టులు. గ్రామీణ భారతదేశంలో 65% మందికి ఇవి అర్థం కావు. 'ఇది మామూలేనా?' అని అడగడానికి 50 కి.మీ ప్రయాణిస్తారు.",
        story3Title: "పరిష్కారం",
        story3Desc: "ఒక ఫోటో అప్‌లోడ్ చేయండి. మా AI చదువుతుంది, అర్థం చేసుకుంటుంది మరియు సరళమైన పదాలలో వివరిస్తుంది. తెలుగు. హిందీ. తమిళం. ఎటువంటి గందరగోళం లేదు.",
        story4Title: "వినండి, చదవకండి",
        story4Desc: "సర్వం AI ద్వారా సహజమైన స్వరాలు. ప్రాంతీయ యాసలలో అధిక నాణ్యత గల కథనం. ప్రతి వ్యక్తి తన ఆరోగ్యాన్ని అర్థం చేసుకునే హక్కును కలిగి ఉంటారు.",
        story5Title: "స్మార్ట్ లోకేటర్",
        story5Desc: "వెంటనే దగ్గరి ఆసుపత్రిని కనుగొనండి. అత్యంత అవసరమైన వారికి ఉచిత ప్రభుత్వ సౌకర్యాలకు ప్రాధాన్యత ఇస్తుంది.",
        analysisTitle: "AI విశ్లేషణ",
        analysisSubtitle: "మీ నివేదికను కింద వేయండి మరియు మా AI పనిని చూడండి.",
        dropTitle: "మీ నివేదికను ఇక్కడ వేయండి",
        dropDesc: "మీ ప్రాంతీయ భాషలో మీ ల్యాబ్ ఫలితాల గురించి తక్షణ, సరళమైన వివరణను పొందండి.",
        selectFileBtn: "మెడికల్ ఫైల్‌ను ఎంచుకోండి",
        trustedBy: "భారతదేశం అంతటా 5,000+ వినియోగదారులచే విశ్వసించబడింది",
        processingTitle: "AI ఏజెంట్లు మీ నివేదికను విశ్లేషిస్తున్నారు...",
        processingDesc: "పారామితులను సేకరించడం మరియు తీవ్రతను అంచనా వేయడం",
        aiSummary: "AI సారాంశం",
        scientificReferences: "శాస్త్రీయ ఆధారాలు",
        measuredParameters: "కొలవబడిన పారామితులు",
        normalRange: "సాధారణ పరిమితి",
        processedOn: "విశ్లేషించబడిన తేదీ",
        clearResults: "ఫలితాలను తీసివేసి మరొకటి అప్‌లోడ్ చేయండి",
        privacyPolicy: "గోప్యతా విధానం",
        medicalDisclaimer: "మెడికల్ డిస్క్లైమర్",
        termsOfUse: "ఉపయోగ నిబంధనలు",
        storyTitle: "కథ",
        voiceTitle: "ప్రాంతీయ స్వరం",
        careTitle: "సంరక్షణను కనుగొనండి",
        findingCare: "దగ్గరి ఆరోగ్య కేంద్రాలను కనుగొంటోంది...",
        recomCare: "సిఫార్సు చేయబడిన సమీప ఆరోగ్య కేంద్రాలు",
        callBtn: "కాల్ చేయండి",
        directionsBtn: "దిశలు",
        careDisclaimer: "*వైద్య అవసరాల ఆధారంగా ఉచిత ప్రభుత్వ సౌకర్యాలకు ప్రాధాన్యత ఇస్తుంది.",
        hoverTip: "చిట్కా: AI గుర్తించిన విలువలను చూడటానికి రిపోర్ట్ చిత్రంపై కర్సర్‌ను ఉంచండి.",
    },
    ta: { heroTitle1: "சரியான தகவல்", heroTitle2: "ஒவ்வொரு இந்தியருக்குமான.", storyTitle: "கதை", analyzeBtn: "பகுப்பாய்வு செய்" },
    kn: { heroTitle1: "నిఖర ಮಾಹಿತಿ", heroTitle2: "ప్రతి భారతీయుడి కోసం.", storyTitle: "కథ" },
    ml: { heroTitle1: "കൃത്യമായ വിവരം", heroTitle2: "ഓരോ ഭാരതീയനും.", storyTitle: "കഥ" },
    bn: { heroTitle1: "সঠিক তথ্য", heroTitle2: "প্রতিটি ভারতীয়র জন্য।", storyTitle: "গল্প" },
    mr: { heroTitle1: "अचूक माहिती", heroTitle2: "प्रत्येक भारतीयासाठी।", storyTitle: "गोष्ट" },
    gu: { heroTitle1: "ચોક્કસ માહિતી", heroTitle2: "દરેક ભારતીય માટે।", storyTitle: "વાર્તા" },
    pa: { heroTitle1: "ਸਹੀ ਜਾਣਕਾਰੀ", heroTitle2: "ਹਰ ਭਾਰਤੀ ਲਈ।", storyTitle: "ਕਹਾਣੀ" },
    or: { heroTitle1: "ସଠିକ୍ ସୂଚନା", heroTitle2: "ପ୍ରତ୍ୟేକ ଭారତୀୟଙ୍କ ପାଇଁ।", storyTitle: "ଗପ" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string) => {
        return translations[language]?.[key] || translations['en']?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
