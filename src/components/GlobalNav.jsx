import React, { useEffect, useRef, useState } from 'react';
import { Search, Mic, Rocket } from 'lucide-react';

export default function GlobalNav({ onCommand, currentLang, setLang }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const t = (key) => {
    const dict = {
      en: { search: 'Search commands…', voice: 'Voice', palette: 'Command palette', open: 'Open', close: 'Close' },
      es: { search: 'Buscar comandos…', voice: 'Voz', palette: 'Paleta de comandos', open: 'Abrir', close: 'Cerrar' },
      zh: { search: '搜索命令…', voice: '语音', palette: '命令面板', open: '打开', close: '关闭' },
      ar: { search: 'ابحث في الأوامر…', voice: 'صوت', palette: 'لوحة الأوامر', open: 'فتح', close: 'إغلاق' },
    };
    return dict[currentLang]?.[key] ?? key;
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = currentLang === 'es' ? 'es-ES' : currentLang === 'zh' ? 'zh-CN' : currentLang === 'ar' ? 'ar' : 'en-US';
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e) => {
      const text = Array.from(e.results).map((res) => res[0].transcript).join(' ');
      setQuery(text);
      onCommand?.(text);
      setOpen(false);
    };
    r.start();
  };

  const run = (e) => {
    e.preventDefault();
    onCommand?.(query);
    setOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/30 text-white">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" aria-label="Global">
        <div className="flex items-center gap-3">
          <Rocket className="text-fuchsia-400" aria-hidden="true" />
          <span className="font-semibold tracking-wide">Apotheon Labs</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 px-3 py-2"
            aria-label={`${t('open')} ${t('palette')}`}
          >
            <Search size={18} />
            <span className="hidden sm:block">Ctrl/⌘ K</span>
          </button>
          <select
            aria-label="Language"
            value={currentLang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-transparent border border-white/20 rounded-md px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="zh">中文</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </nav>

      {open && (
        <div role="dialog" aria-modal="true" aria-label={t('palette')} className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-xl bg-neutral-900 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 p-3 border-b border-white/10">
              <Search className="text-white/60" />
              <form onSubmit={run} className="flex-1">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('search')}
                  className="w-full bg-transparent outline-none text-white placeholder-white/50"
                  aria-label={t('search')}
                />
              </form>
              <button
                onClick={startVoice}
                className={`inline-flex items-center gap-2 rounded-md px-2 py-1 border border-white/20 ${listening ? 'bg-fuchsia-500/20' : 'hover:bg-white/10'}`}
                aria-pressed={listening}
                aria-label={t('voice')}
              >
                <Mic size={18} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="ml-2 p-2 rounded-md hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-fuchsia-400"
                aria-label={t('close')}
              >
                ✕
              </button>
            </div>
            <ul className="max-h-64 overflow-auto p-2" role="listbox" aria-label="Suggestions">
              {['Open AR Try-On', 'Go to Product Lab', 'Toggle Ambient Audio', 'Speak greeting'].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      onCommand?.(item);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-fuchsia-400"
                    role="option"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
