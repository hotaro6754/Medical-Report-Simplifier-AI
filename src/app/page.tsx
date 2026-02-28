'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
const ReportProcessor = dynamic(() => import('@/medai/components/ReportProcessor').then(mod => mod.ReportProcessor), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-slate-900/50 glass-effect rounded-[3rem] border border-white/5 animate-pulse shadow-2xl">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-white font-black tracking-widest uppercase text-xs">Loading AI Copilot...</p>
      </div>
    </div>
  )
});
import { Heart, ShieldCheck, Zap, Globe, MapPin, AudioWaveform as Waveform, ArrowDown } from 'lucide-react';
import '@/medai/styles/design-system.css';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/medai/components/LanguageContext';

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === 'dark';

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scale = useSpring(useTransform(scrollYProgress, [0, 0.2], [1, 0.9]), { stiffness: 100, damping: 30 });
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 0.5, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

  return (
    <div ref={containerRef} id="hero" className="relative min-h-[500vh] bg-medical-surface text-medical-text selection:bg-medical-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2),transparent_70%)]" />
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>


      {/* Hero Section */}
      <motion.section
        style={{ scale, opacity, y: heroY }}
        className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "circOut" }}
          className="relative"
        >
          <div className="inline-block px-4 py-1.5 mb-8 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
            {t('heroBadge')}
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-10 overflow-hidden">
            <motion.span
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "circOut" }}
              className={`block bg-clip-text text-transparent ${isDark
                ? 'bg-gradient-to-b from-white to-slate-500'
                : 'bg-gradient-to-b from-slate-900 to-slate-600'
                }`}
            >
              {t('heroTitle1')}
            </motion.span>
            <motion.span
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "circOut" }}
              className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-600 to-emerald-500"
            >
              {t('heroTitle2')}
            </motion.span>
          </h1>
          <p className={`text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed mb-12 ${isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
            {t('heroSubtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => document.getElementById('analysis')?.scrollIntoView({ behavior: 'smooth' })}
              className="group h-16 px-10 text-lg font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30"
            >
              {t('analyzeBtn')}
              <motion.span
                className="ml-2 inline-flex"
                whileHover={{ scale: 1.4, rotate: [0, -15, 15, -10, 0], transition: { duration: 0.5, ease: 'easeInOut' } }}
              >
                <Zap className="w-5 h-5 fill-current text-yellow-400" />
              </motion.span>
            </Button>
          </div>

        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-black">{t('scrollText')}</span>
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.section>

      {/* The Storyscrolling Narrative */}
      <div id="narrative" className="relative z-10">
        <StorySlide
          progress={scrollYProgress}
          range={[0.15, 0.3]}
          title={t('story1Title')}
          description={t('story1Desc')}
          icon={<Heart className="w-12 h-12 text-rose-500" />}
          gradient="from-rose-500/20"
        />

        <StorySlide
          progress={scrollYProgress}
          range={[0.3, 0.45]}
          title={t('story2Title')}
          description={t('story2Desc')}
          icon={<Globe className="w-12 h-12 text-blue-500" />}
          gradient="from-blue-500/20"
        />

        <StorySlide
          progress={scrollYProgress}
          range={[0.45, 0.6]}
          title={t('story3Title')}
          description={t('story3Desc')}
          icon={<ShieldCheck className="w-12 h-12 text-emerald-500" />}
          gradient="from-emerald-500/20"
        />

        <StorySlide
          progress={scrollYProgress}
          range={[0.6, 0.75]}
          title={t('story4Title')}
          description={t('story4Desc')}
          icon={<Waveform className="w-12 h-12 text-purple-500" />}
          gradient="from-purple-500/20"
        />

        <StorySlide
          progress={scrollYProgress}
          range={[0.75, 0.9]}
          title={t('story5Title')}
          description={t('story5Desc')}
          icon={<MapPin className="w-12 h-12 text-orange-500" />}
          gradient="from-orange-500/20"
        />
      </div>

      {/* Utility Section */}
      <section id="analysis" className="relative min-h-screen z-20 bg-medical-surface flex flex-col items-center justify-center px-4 py-24 overflow-x-hidden">
        <motion.div
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "backOut" }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-6">{t('analysisTitle')}</h2>
          </div>
          <div className="glass-effect p-2 rounded-3xl border border-white/10 dark:border-white/5 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            <ReportProcessor />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-glass-border bg-medical-surface text-center">
        <h3 className="text-2xl font-black mb-8">Swasthya AI — {t('heroTitle2')}</h3>
        <p className="max-w-xl mx-auto text-slate-500 mb-12 font-medium">
          {t('heroSubtitle')}
        </p>
        <div className="flex flex-wrap gap-8 md:gap-12 justify-center text-[10px] uppercase font-bold tracking-[0.3em] text-slate-600">
          <a href="#" className="hover:text-white transition-colors">{t('privacyPolicy')}</a>
          <a href="#" className="hover:text-white transition-colors">{t('medicalDisclaimer')}</a>
          <a href="#" className="hover:text-white transition-colors">{t('termsOfUse')}</a>
        </div>
      </footer>
    </div>
  );
}

function StorySlide({ progress, range, title, description, icon, gradient }: any) {
  const innerProgress = useTransform(progress, range, [0, 1]);
  const opacity = useTransform(innerProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(innerProgress, [0, 1], [100, -100]);
  const blur = useTransform(innerProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "20px"]);

  return (
    <motion.div
      style={{ opacity, y, filter: `blur(${blur})` }}
      className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-6"
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient} to-transparent opacity-20 -z-10`} />
      <div className="mb-10 p-6 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 shadow-2xl rounded-[2.5rem]">
        {icon}
      </div>
      <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 uppercase leading-none bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
        {title}
      </h2>
      <p className="text-xl md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </motion.div>
  );
}
