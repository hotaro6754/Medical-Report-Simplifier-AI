'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function ScanningBeam() {
    return (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-3xl">
            <motion.div
                animate={{
                    top: ['-10%', '110%'],
                    opacity: [0, 1, 1, 0]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute left-0 right-0 h-2 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(96,165,250,0.8)]"
            />
            <motion.div
                animate={{
                    top: ['-10%', '110%'],
                    opacity: [0, 0.3, 0.3, 0]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.1
                }}
                className="absolute left-0 right-0 h-20 bg-gradient-to-b from-blue-400/20 to-transparent blur-xl"
            />
        </div>
    );
}
