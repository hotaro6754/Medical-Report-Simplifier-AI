'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type TextSize = 'normal' | 'large' | 'extralarge';

interface AccessibilityContextType {
    highContrast: boolean;
    setHighContrast: (val: boolean) => void;
    textSize: TextSize;
    setTextSize: (val: TextSize) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [highContrast, setHighContrast] = useState(false);
    const [textSize, setTextSize] = useState<TextSize>('normal');

    useEffect(() => {
        const root = document.documentElement;
        if (highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        root.classList.remove('text-size-normal', 'text-size-large', 'text-size-extralarge');
        root.classList.add(`text-size-${textSize}`);
    }, [highContrast, textSize]);

    return (
        <AccessibilityContext.Provider value={{ highContrast, setHighContrast, textSize, setTextSize }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
    return context;
}
