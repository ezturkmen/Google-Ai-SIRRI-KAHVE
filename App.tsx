
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Coffee, Upload, ChevronRight, Loader2, 
  RefreshCw, History, Moon, Star, LayoutDashboard,
  Trash2, ExternalLink, Calendar, Camera, ShieldCheck, 
  UserCircle, Heart, UserPlus, HelpCircle, Sun, Eye
} from 'lucide-react';
import MysticBackground from './components/MysticBackground';
import { AppState, FortuneResult, FortuneCategory, UserProfile } from './types';
import { analyzeFortune } from './services/geminiService';

const TAROT_CARDS = [
  "Büyücü", "Azize", "İmparatoriçe", "İmparator", "Aziz", "Aşıklar", "Araba", 
  "Adalet", "Ermiş", "Kader Çarkı", "Güç", "Asılan Adam", "Ölüm", "Denge", 
  "Şeytan", "Yıkılan Kule", "Yıldız", "Ay", "Güneş", "Mahkeme", "Dünya", "Aptal"
];

const ZODIAC_SIGNS = [
  "Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", 
  "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"
];

interface SetupScreenProps {
  onSave: (profile: UserProfile) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-3">
        <h2 className="text-5xl font-header text-amber-500 text-glow-gold tracking-tighter">Kadim Başlangıç</h2>
        <p className="text-stone-400 italic font-body text-lg">Ruhun aynası telvelerde saklıdır...</p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] text-stone-500 font-bold uppercase ml-3 tracking-[0.3em] font-header">Ruhun Adı</label>
          <div className="relative group">
            <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-600 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-900/40 border border-stone-800 rounded-[28px] py-5 pl-14 pr-6 text-stone-100 outline-none focus:border-amber-500/50 focus:bg-stone-900/70 transition-all font-accent text-xl placeholder:text-stone-700"
              placeholder="Örn: Elif Sönmez"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-stone-500 font-bold uppercase ml-3 tracking-[0.3em] font-header">Doğum Kozmosu</label>
          <div className="relative group">
            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-600 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="date" 
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-stone-900/40 border border-stone-800 rounded-[28px] py-5 pl-14 pr-6 text-stone-100 outline-none focus:border-amber-500/50 focus:bg-stone-900/70 transition-all [color-scheme:dark] font-accent text-xl"
            />
          </div>
        </div>
      </div>

      <button 
        disabled={!name || !birthDate}
        onClick={() => onSave({ name, birthDate })}
        className="w-full py-6 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white rounded-[28px] font-header font-bold shadow-2xl shadow-amber-900/30 disabled:opacity-30 disabled:grayscale transition-all duration-500 flex items-center justify-center gap-4 text-xl tracking-wider"
      >
        Kaderin Yoluna Başla <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'setup',
    status: 'idle',
    profile: null,
    images: [],
    selectedCards: [],
    selectedSign: '',
    result: null,
    error: null
  });

  const [journal, setJournal] = useState<FortuneResult[]>([]);
  const [showCameraInfo, setShowCameraInfo] = useState(true);

  useEffect(() => {
    const savedJournal = localStorage.getItem('mistik_gunluk');
    const savedProfile = localStorage.getItem('mistik_profil');
    
    if (savedJournal) setJournal(JSON.parse(savedJournal));
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setState(s => ({ ...s, profile, view: 'dashboard' }));
    }
  }, []);

  const saveProfile = (profile: UserProfile) => {
    localStorage.setItem('mistik_profil', JSON.stringify(profile));
    setState(s => ({ ...s, profile, view: 'dashboard' }));
  };

  const saveToJournal = (result: FortuneResult) => {
    const updated = [result, ...journal].slice(0, 50);
    setJournal(updated);
    localStorage.setItem('mistik_gunluk', JSON.stringify(updated));
  };

  const deleteFromJournal = (id: string) => {
    const updated = journal.filter(j => j.id !== id);
    setJournal(updated);
    localStorage.setItem('mistik_gunluk', JSON.stringify(updated));
  };

  const handleAction = async () => {
    setState(s => ({ ...s, status: 'analyzing', error: null }));
    try {
      let data: any = {};
      const category = state.view as FortuneCategory;
      if (category === 'coffee') data = { images: state.images };
      if (category === 'tarot') data = { cards: state.selectedCards };
      if (category === 'astrology') data = { sign: state.selectedSign };

      const result = await analyzeFortune(category, data, state.profile);
      setState(s => ({ ...s, status: 'result', result }));
      saveToJournal(result);
    } catch (err: any) {
      setState(s => ({ ...s, status: 'idle', error: err.message }));
    }
  };

  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-6 p-6 bg-amber-900/5 border border-amber-800/20 rounded-[40px] shadow-inner">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg">
          <UserCircle className="w-9 h-9 text-amber-500/70" />
        </div>
        <div className="flex-1">
          <h4 className="text-stone-100 font-header font-bold text-2xl tracking-tight">Merhaba, {state.profile?.name}</h4>
          <p className="text-[11px] text-stone-500 uppercase tracking-[0.3em] font-header font-bold mt-1">Yıldız Kozmosu: {state.profile?.birthDate}</p>
        </div>
        <button 
          onClick={() => setState(s => ({ ...s, view: 'setup' }))}
          className="p-3.5 text-stone-600 hover:text-amber-500 transition-all bg-white/5 rounded-2xl hover:bg-white/10"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-1000 delay-200">
        <button 
          onClick={() => setState(s => ({ ...s, view: 'coffee', images: [], status: 'idle' }))}
          className="p-10 bg-amber-900/5 border border-amber-800/20 rounded-[48px] hover:bg-amber-900/10 transition-all duration-500 group flex flex-col items-center shadow-xl border-white/5"
        >
          <Coffee className="w-16 h-16 text-amber-500/70 mb-6 group-hover:scale-110 transition-transform duration-700 text-glow-gold" />
          <h3 className="text-3xl font-mystic text-amber-500 tracking-wide">Kahve Falı</h3>
          <p className="text-stone-400 text-sm mt-3 font-body italic text-center max-w-[200px]">Sembol veri tabanı ve geleneksel yorumlar...</p>
        </button>

        <button 
          onClick={() => setState(s => ({ ...s, view: 'tarot', selectedCards: [], status: 'idle' }))}
          className="p-10 bg-purple-900/5 border border-purple-800/20 rounded-[48px] hover:bg-purple-900/10 transition-all duration-500 group flex flex-col items-center shadow-xl border-white/5"
        >
          <Sparkles className="w-16 h-16 text-purple-400/70 mb-6 group-hover:scale-110 transition-transform duration-700 text-glow-purple" />
          <h3 className="text-3xl font-mystic text-purple-400 tracking-wide">Tarot</h3>
          <p className="text-stone-400 text-sm mt-3 font-body italic text-center max-w-[200px]">Arkanaların gizemi ve sezgi...</p>
        </button>

        <button 
          onClick={() => setState(s => ({ ...s, view: 'astrology', selectedSign: '', status: 'idle' }))}
          className="p-10 bg-blue-900/5 border border-blue-800/20 rounded-[48px] hover:bg-blue-900/10 transition-all duration-500 group flex flex-col items-center shadow-xl border-white/5"
        >
          <Moon className="w-16 h-16 text-blue-400/70 mb-6 group-hover:scale-110 transition-transform duration-700" />
          <h3 className="text-3xl font-mystic text-blue-400 tracking-wide">Astroloji</h3>
          <p className="text-stone-400 text-sm mt-3 font-body italic text-center max-w-[200px]">Transitler ve doğum haritası sentezi...</p>
        </button>

        <button 
          onClick={() => setState(s => ({ ...s, view: 'journal' }))}
          className="p-10 bg-stone-800/5 border border-stone-700/20 rounded-[48px] hover:bg-stone-800/10 transition-all duration-500 group flex flex-col items-center shadow-xl border-white/5"
        >
          <History className="w-16 h-16 text-stone-500 mb-6 group-hover:scale-110 transition-transform duration-700" />
          <h3 className="text-3xl font-mystic text-stone-300 tracking-wide">Fal Günlüğü</h3>
          <p className="text-stone-500 text-sm mt-3 font-body italic text-center max-w-[200px]">Geçmişin izlerini takip edin...</p>
        </button>
      </div>
    </div>
  );

  const renderJournal = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-700">
      <div className="flex justify-between items-center mb-10 px-4">
        <h2 className="text-4xl font-mystic text-stone-100 tracking-tighter">Kadim Arşiv</h2>
        <button onClick={() => setState(s => ({ ...s, view: 'dashboard' }))} className="p-4 bg-white/5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-all"><LayoutDashboard className="w-6 h-6"/></button>
      </div>
      {journal.length === 0 ? (
        <div className="text-center py-32 text-stone-500 italic font-body text-xl">Arşiv tozlu... Henüz bir fal kaydedilmemiş.</div>
      ) : (
        journal.map(entry => (
          <div key={entry.id} className="p-6 bg-stone-900/40 border border-stone-800 rounded-[32px] flex gap-6 items-center group hover:bg-stone-800/40 transition-all duration-500 shadow-lg">
            {entry.imageUrl ? (
              <img src={entry.imageUrl} className="w-24 h-24 rounded-3xl object-cover shadow-2xl border border-white/5" />
            ) : (
              <div className="w-24 h-24 bg-stone-800 rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl">
                {entry.category === 'tarot' ? <Sparkles className="w-10 h-10 text-purple-400/30" /> : <Moon className="w-10 h-10 text-blue-400/30" />}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <span className={`text-[10px] uppercase font-bold tracking-[0.2em] px-4 py-1.5 rounded-full font-header ${
                  entry.category === 'coffee' ? 'bg-amber-900/30 text-amber-500' : 
                  entry.category === 'tarot' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'
                }`}>
                  {entry.category}
                </span>
                <span className="text-xs text-stone-500 flex items-center gap-2 font-header font-bold"><Calendar className="w-4 h-4"/> {new Date(entry.date).toLocaleDateString()}</span>
              </div>
              <p className="text-stone-300 text-sm line-clamp-2 mt-3 font-body leading-relaxed italic">"{entry.advice}"</p>
            </div>
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setState(s => ({ ...s, view: 'result' as any, result: entry }))} className="p-3.5 text-amber-500 hover:bg-stone-700 rounded-2xl transition-colors"><ChevronRight /></button>
              <button onClick={() => deleteFromJournal(entry.id)} className="p-3.5 text-red-500 hover:bg-red-950/20 rounded-2xl transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTarotSelector = () => {
    const slots = Array.from({ length: 22 }, (_, i) => i);

    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="text-center space-y-2">
          <h3 className="text-4xl font-header text-purple-400 text-glow-purple tracking-tight">Kozmik Arkana</h3>
          <p className="text-stone-500 text-sm font-body italic">İsimlere değil, ruhunun çekimine güven. 3 kart seç.</p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 max-h-[450px] overflow-y-auto p-6 scrollbar-hide bg-black/30 rounded-[40px] border border-white/5 shadow-inner">
          {slots.map(index => {
            const isSelected = state.selectedCards.length > 0 && state.selectedCards.some(c => c === TAROT_CARDS[index]);
            return (
              <button 
                key={index}
                onClick={() => {
                  const cardName = TAROT_CARDS[index];
                  if (state.selectedCards.includes(cardName)) {
                    setState(s => ({ ...s, selectedCards: s.selectedCards.filter(c => c !== cardName) }));
                  } else if (state.selectedCards.length < 3) {
                    setState(s => ({ ...s, selectedCards: [...s.selectedCards, cardName] }));
                  }
                }}
                className={`aspect-[2/3] rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-500 relative group overflow-hidden ${
                  isSelected 
                  ? 'bg-purple-900/60 border-purple-400 scale-105 shadow-[0_0_30px_rgba(168,85,247,0.4)]' 
                  : 'bg-stone-900/80 border-stone-800 hover:border-purple-500/50'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-tr from-purple-950/30 to-transparent ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                <HelpCircle className={`w-10 h-10 transition-all duration-700 ${isSelected ? 'text-purple-200 scale-110' : 'text-stone-700 group-hover:text-stone-500'}`} />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-bold font-header shadow-lg">
                    {state.selectedCards.indexOf(TAROT_CARDS[index]) + 1}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <button 
          disabled={state.selectedCards.length < 3}
          onClick={handleAction}
          className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white rounded-[28px] font-header font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500 shadow-2xl shadow-purple-900/30 text-xl tracking-wide"
        >
          Kaderimi Açığa Çıkar ({state.selectedCards.length}/3)
        </button>
      </div>
    );
  };

  const renderAstrologySelector = () => (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h3 className="text-4xl font-header text-blue-400 tracking-tight">Gezegenlerin Dili</h3>
        <p className="text-stone-500 text-sm font-body italic">Kozmik hizalanma senin için ne söylüyor?</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {ZODIAC_SIGNS.map(sign => (
          <button 
            key={sign}
            onClick={() => setState(s => ({ ...s, selectedSign: sign }))}
            className={`p-6 rounded-[28px] border text-lg transition-all duration-500 text-center font-header font-bold ${
              state.selectedSign === sign 
              ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] scale-105' 
              : 'bg-stone-800/40 border-stone-800 text-stone-400 hover:border-blue-500/50 hover:bg-stone-800/60'
            }`}
          >
            {sign}
          </button>
        ))}
      </div>
      <button 
        disabled={!state.selectedSign}
        onClick={handleAction}
        className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[28px] font-header font-bold disabled:opacity-30 transition-all duration-500 shadow-2xl shadow-blue-900/30 text-xl tracking-wide"
      >
        Gökyüzü Analizini Başlat
      </button>
    </div>
  );

  const renderFortuneResult = (result: FortuneResult) => {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="flex flex-wrap justify-center gap-4">
          {result.symbols?.map((s, i) => <span key={i} className="text-xs bg-amber-950/40 text-amber-400 px-6 py-2.5 rounded-full border border-amber-900/30 font-header font-bold tracking-widest shadow-lg text-glow-gold">✨ {s}</span>)}
          {result.sign && <span className="text-xs bg-blue-950/40 text-blue-400 px-6 py-2.5 rounded-full border border-blue-900/30 font-header font-bold tracking-widest shadow-lg">🌙 {result.sign}</span>}
        </div>

        {result.category === 'tarot' && (
          <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
            {result.cards?.map((card, i) => (
              <div 
                key={i} 
                className="flex-1 bg-gradient-to-b from-purple-900/30 to-black/70 border border-purple-500/20 rounded-[40px] p-8 flex flex-col items-center text-center space-y-6 shadow-2xl relative overflow-hidden group animate-in zoom-in duration-700"
                style={{ animationDelay: `${i * 250}ms` }}
              >
                <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
                <div className="w-32 h-48 bg-stone-950 border-2 border-purple-500/20 rounded-3xl flex items-center justify-center shadow-inner relative overflow-hidden">
                  <Sparkles className="w-16 h-16 text-purple-500/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 to-transparent" />
                </div>
                <h5 className="text-2xl font-mystic text-purple-100 drop-shadow-[0_0_12px_rgba(168,85,247,0.7)] tracking-tight">{card}</h5>
              </div>
            ))}
          </div>
        )}

        <section className="p-12 bg-stone-900/40 border border-stone-800 rounded-[56px] relative overflow-hidden group hover:bg-stone-900/60 transition-all duration-700 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-15 transition-opacity duration-1000 pointer-events-none">
             {result.category === 'coffee' ? <Coffee className="w-32 h-32" /> : result.category === 'tarot' ? <Sparkles className="w-32 h-32" /> : <Moon className="w-32 h-32" />}
          </div>
          <h4 className="text-stone-500 text-xs font-bold uppercase tracking-[0.35em] mb-8 flex items-center gap-4 font-header">
            <Star className="w-5 h-5 text-amber-500" /> Kozmik Yorum
          </h4>
          <p className="text-stone-100 leading-[2] font-body text-xl relative z-10 drop-cap italic text-justify">{result.interpretation}</p>
        </section>

        <div className="p-14 bg-gradient-to-br from-amber-900/20 via-stone-950/90 to-purple-950/20 border border-white/5 rounded-[72px] italic text-stone-100 text-center font-accent text-3xl shadow-[0_30px_70px_rgba(0,0,0,0.7)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          "{result.advice}"
        </div>

        <button onClick={() => setState(s => ({ ...s, view: 'dashboard', status: 'idle', result: null }))} className="w-full py-7 text-stone-500 hover:text-stone-100 transition-all flex items-center justify-center gap-4 font-header font-bold bg-white/5 rounded-[32px] hover:bg-white/10 text-2xl tracking-tight">
          <RefreshCw className="w-6 h-6" /> Yeni Bir Sırra Yolculuk
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <MysticBackground />

      <div className="fixed top-10 right-12 z-[100] pointer-events-none select-none opacity-20 hover:opacity-100 transition-opacity duration-1000">
        <span className="font-mystic text-[12px] md:text-lg tracking-[0.5em] text-amber-500 drop-shadow-2xl">
          EDIT BY @EZTURKMEN
        </span>
      </div>

      <main className="w-full max-w-3xl bg-stone-950/90 backdrop-blur-3xl border border-stone-800/40 rounded-[64px] shadow-[0_0_120px_rgba(0,0,0,0.9)] overflow-hidden min-h-[800px] flex flex-col relative z-10 my-8">
        
        <nav className="p-8 border-b border-stone-800/30 flex justify-between items-center bg-black/50 backdrop-blur-2xl">
          <button onClick={() => setState(s => ({ ...s, view: 'dashboard' }))} className="flex items-center gap-5 hover:opacity-80 transition-all">
            <div className="w-14 h-14 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center shadow-inner group overflow-hidden">
              <Star className="w-7 h-7 text-amber-500 fill-amber-500/20 group-hover:scale-125 transition-transform duration-1000" />
            </div>
            <span className="font-mystic text-3xl tracking-[0.15em] text-stone-100 font-bold drop-shadow-lg">SIRR-I KAHVE</span>
          </button>
          <div className="flex gap-4">
            <button onClick={() => setState(s => ({ ...s, view: 'journal' }))} className="p-4 text-stone-400 hover:text-amber-500 transition-all bg-white/5 rounded-full hover:bg-white/10"><History className="w-6 h-6"/></button>
            <button onClick={() => setState(s => ({ ...s, view: 'dashboard' }))} className="p-4 text-stone-400 hover:text-amber-500 transition-all bg-white/5 rounded-full hover:bg-white/10"><LayoutDashboard className="w-6 h-6"/></button>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-10 md:p-16 scrollbar-hide">
          
          {state.error && (
            <div className="mb-10 p-6 bg-red-950/50 border border-red-800/30 text-red-400 rounded-[32px] text-center text-lg font-body animate-pulse shadow-lg">
              {state.error}
            </div>
          )}

          {state.status === 'analyzing' ? (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-10 py-28 animate-in fade-in zoom-in duration-1000">
                <div className="relative">
                  <div className={`absolute inset-0 blur-[80px] rounded-full opacity-50 animate-pulse duration-[3s] ${
                    state.view === 'coffee' ? 'bg-amber-600' : state.view === 'tarot' ? 'bg-purple-600' : 'bg-blue-600'
                  }`} />
                  <Loader2 className="w-28 h-28 text-stone-200 animate-spin relative drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" strokeWidth={1} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-mystic text-stone-100 tracking-wider">Kaderin Okunuyor...</h3>
                  <p className="text-stone-500 italic font-body text-xl animate-pulse">Evrenin kadim fısıltıları telvelerde şekilleniyor.</p>
                </div>
             </div>
          ) : (
            <>
              {state.view === 'setup' && <SetupScreen onSave={saveProfile} />}
              {state.view === 'dashboard' && renderDashboard()}
              {state.view === 'journal' && renderJournal()}
              {state.view === 'coffee' && (
                <div className="space-y-10 animate-in slide-in-from-bottom duration-700">
                  <div className="text-center space-y-3 mb-10">
                    <h2 className="text-5xl font-header text-amber-500 tracking-tight">Kahve Analizi</h2>
                    <p className="text-stone-500 text-lg font-body italic max-w-md mx-auto">Fincanın kalbindeki semboller senin hikayenle birleşiyor.</p>
                  </div>

                  {showCameraInfo && state.images.length === 0 && (
                    <div className="p-10 bg-amber-900/10 border border-amber-800/20 rounded-[48px] animate-in fade-in slide-in-from-top-6 duration-1000 relative overflow-hidden group shadow-inner">
                      <div className="absolute top-0 right-0 p-5">
                        <button onClick={() => setShowCameraInfo(false)} className="text-amber-900/50 hover:text-amber-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex gap-8 items-start">
                        <div className="bg-amber-500/15 p-5 rounded-[32px] h-fit border border-amber-500/25 shadow-lg">
                          <Camera className="w-10 h-10 text-amber-500/80" />
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-amber-200 text-2xl font-header font-bold flex items-center gap-3">
                            Mistik Gözlem
                          </h4>
                          <p className="text-stone-400 text-lg leading-relaxed font-body">
                            Fincanın içindeki telve figürlerini görebilmemiz için en fazla 10 adet net fotoğraf gerekli. Her kare yeni bir sırrı açığa çıkarır.
                          </p>
                          <div className="pt-4 flex items-center gap-3 text-[12px] text-amber-500/70 font-bold tracking-[0.2em] font-header">
                            <ShieldCheck className="w-5 h-5" /> MAHREMİYETİNİZ KOZMİK KORUMA ALTINDADIR.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {state.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-[40px] overflow-hidden border border-stone-800 shadow-2xl group ring-1 ring-white/5">
                        <img src={img} className="w-full h-full object-cover group-hover:scale-150 transition-transform duration-[2s]" />
                        <button onClick={() => setState(s => ({ ...s, images: s.images.filter((_, i) => i !== idx) }))} className="absolute top-4 right-4 p-3 bg-black/60 rounded-full text-white hover:bg-red-600 transition-all backdrop-blur-xl border border-white/10 shadow-lg"><Trash2 className="w-5 h-5"/></button>
                      </div>
                    ))}
                    {state.images.length < 10 && (
                      <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-stone-800 rounded-[40px] cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-700 group shadow-inner">
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                          const files = Array.from(e.target.files || []) as File[];
                          files.slice(0, 10 - state.images.length).forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (ev) => setState(s => ({ ...s, images: [...s.images, ev.target?.result as string] }));
                            reader.readAsDataURL(file);
                          });
                        }} />
                        <div className="w-20 h-20 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-700 shadow-2xl">
                          <Upload className="w-10 h-10 text-stone-600 group-hover:text-amber-500" />
                        </div>
                        <span className="text-sm text-stone-500 font-bold uppercase tracking-[0.25em] font-header group-hover:text-amber-400">Telve Fotoğrafı Ekle</span>
                      </label>
                    )}
                  </div>
                  
                  <div className="pt-6">
                    <button 
                      onClick={handleAction} 
                      disabled={state.images.length === 0} 
                      className="w-full py-7 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white rounded-[32px] font-header font-bold shadow-[0_30px_60px_rgba(180,83,9,0.3)] disabled:opacity-30 disabled:grayscale transition-all duration-700 flex items-center justify-center gap-5 text-2xl tracking-tight"
                    >
                      Fincanı Oku {state.images.length > 0 && <span className="text-sm bg-black/30 px-4 py-1.5 rounded-full font-header">{state.images.length}/10</span>}
                    </button>
                  </div>
                </div>
              )}
              {state.view === 'tarot' && renderTarotSelector()}
              {state.view === 'astrology' && renderAstrologySelector()}
              
              {state.status === 'result' && state.result && renderFortuneResult(state.result)}
            </>
          )}
        </div>

        <footer className="p-8 bg-black/70 border-t border-stone-800/40 flex justify-center backdrop-blur-3xl">
           <p className="text-[11px] text-stone-600 uppercase tracking-[0.6em] font-header font-bold drop-shadow-sm">
             Geleneksel Bilgelik • Modern Teknoloji • Sırr-ı Kahve
           </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
