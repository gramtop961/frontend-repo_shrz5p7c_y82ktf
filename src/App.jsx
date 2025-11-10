import React, { useCallback, useEffect, useMemo, useState } from 'react';
import HeroCinematic from './components/HeroCinematic';
import GlobalNav from './components/GlobalNav';
import AIAvatar from './components/AIAvatar';
import ProductLab from './components/ProductLab';
import ARTryOn from './components/ARTryOn';

function App() {
  const [lang, setLang] = useState('en');
  const [announce, setAnnounce] = useState('');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const onCommand = useCallback((cmd) => {
    const c = cmd.toLowerCase();
    if (c.includes('ar')) {
      document.getElementById('ar')?.scrollIntoView({ behavior: 'smooth' });
      setAnnounce('Opening AR Try-On');
    } else if (c.includes('product')) {
      document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' });
      setAnnounce('Navigating to Product Lab');
    } else if (c.includes('audio')) {
      window.dispatchEvent(new CustomEvent('toggle-audio'));
    } else if (c.includes('speak')) {
      const s = window.speechSynthesis; if (s) s.speak(new SpeechSynthesisUtterance('Welcome to Apotheon Labs'));
    }
  }, []);

  const openSecret = () => {
    alert('Secret unlocked: Reactive Ribbon Synth demo ready!');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-fuchsia-500/30">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 left-2 bg-black text-white px-3 py-2 rounded">Skip to content</a>
      <GlobalNav onCommand={onCommand} currentLang={lang} setLang={setLang} />
      <main id="main">
        <HeroCinematic onKonami={openSecret} />
        <AIAvatar />
        <div id="lab"><ProductLab /></div>
        <div id="ar"><ARTryOn /></div>
      </main>
      <div aria-live="polite" aria-atomic="true" className="sr-only">{announce}</div>
      <footer className="border-t border-white/10 py-10 text-center text-white/60">
        © {new Date().getFullYear()} Apotheon Labs — Crafted for cinematic web experiments.
      </footer>
    </div>
  );
}

export default App;
