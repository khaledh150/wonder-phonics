import React, { useState, useEffect, useRef } from 'react';
import { Zap, Shield, ArrowLeft, Lock, Star, X, Trophy, Pencil, PartyPopper, Check } from 'lucide-react';
import { WorldBackground, SuperHero } from './components/Assets';
import { GameSession } from './components/GameEngine';
import { TracingGame, PhonicsPopGame } from './components/MiniGames';
import { HEROES, GROUPS, generateQuestions, getMiniGameData } from './lib/gameData';

export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState({ 
    name: '', 
    hero: 'blaze',
    progress: 1, 
    subStep: 0, 
    stars: {}    
  });

  const [activeGroup, setActiveGroup] = useState(null);
  const [activeMiniGame, setActiveMiniGame] = useState(null); 
  const [showProfile, setShowProfile] = useState(false);
  const mapRef = useRef(null);

  const LEVEL_2_GROUPS = Array.from({length: 10}).map((_, i) => ({
    id: 21 + i, 
    title: `L2 Group ${i + 1}`,
    sounds: "Locked",
    locked: true
  }));
  
  // Logic to order groups so Level 1 Group 1 is at the bottom
  const ALL_GROUPS = [...[...LEVEL_2_GROUPS].reverse(), ...[...GROUPS].reverse()];
  const totalStars = Object.values(user.stars).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (view === 'map' && mapRef.current) {
      setTimeout(() => {
        const el = document.getElementById(`group-${user.progress}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [view, user.progress]);

  // --- HANDLERS ---
  const handleGroupComplete = (starsEarned) => {
    const currentBest = user.stars[activeGroup] || 0;
    const newStars = { ...user.stars, [activeGroup]: Math.max(currentBest, starsEarned) };
    
    let newSubStep = user.subStep;
    if (activeGroup === user.progress && user.subStep === 0) {
      newSubStep = 1; // Unlock Tracing
    }

    setUser(prev => ({ ...prev, stars: newStars, subStep: newSubStep }));
    setView('map');
    setActiveGroup(null);
  };

  const handleTracingComplete = (success) => {
    // 0.5 stars if success, 0 if fail
    const starsToAdd = success ? 0.5 : 0;
    const currentBest = user.stars[activeGroup] || 0;
    const newStars = { ...user.stars, [activeGroup]: Math.min(3, currentBest + starsToAdd) };

    if (activeGroup === user.progress && user.subStep === 1) {
      setUser(prev => ({ ...prev, stars: newStars, subStep: 2 }));
    }
    setView('map');
    setActiveMiniGame(null);
  };

  const handlePopComplete = (success) => {
    const starsToAdd = success ? 0.5 : 0;
    const currentBest = user.stars[activeGroup] || 0;
    const newStars = { ...user.stars, [activeGroup]: Math.min(3, currentBest + starsToAdd) };

    if (activeGroup === user.progress && user.subStep === 2) {
      setUser(prev => ({ ...prev, stars: newStars, progress: prev.progress + 1, subStep: 0 }));
    }
    setView('map');
    setActiveMiniGame(null);
  };

  // --- RENDERING ---
  if (view === 'game' && activeGroup) {
    const questions = generateQuestions(activeGroup);
    return <GameSession questions={questions} userHero={user.hero} onExit={() => setView('map')} onComplete={handleGroupComplete} />;
  }

  if (view === 'minigame') {
    const data = getMiniGameData(activeGroup);
    if (activeMiniGame === 'tracing') {
      return <TracingGame targetLetter={data.tracing.target} onExit={() => setView('map')} onComplete={handleTracingComplete} />;
    }
    if (activeMiniGame === 'pop') {
      return <PhonicsPopGame targetSound={data.pop.target} distractors={data.pop.distractors} onExit={() => setView('map')} onComplete={handlePopComplete} />;
    }
  }

  if (view === 'map') {
    return (
      <div className="h-screen flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 z-20 w-full p-4 flex justify-between items-start pointer-events-none">
          <button onClick={() => setView('home')} className="pointer-events-auto bg-white/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><ArrowLeft className="text-slate-700" /></button>
          <div className="bg-white/90 px-6 py-2 rounded-full shadow-lg font-black text-indigo-600 tracking-widest border-2 border-indigo-50">
             LEVEL {user.progress > 20 ? 2 : 1}
          </div>
        </div>

        <div ref={mapRef} className="flex-1 overflow-y-auto relative no-scrollbar scroll-smooth bg-linear-to-t from-emerald-200 via-cyan-200 to-blue-300">
          <WorldBackground />
          <div className="min-h-[300vh] flex flex-col items-center justify-end pb-32 pt-32 relative z-10">
            
            {/* The SVG Path Line - Goes through center of container */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{minHeight: '100%'}}>
               <defs>
                 <linearGradient id="pathGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                   <stop offset="0%" stopColor="#34d399" />
                   <stop offset="100%" stopColor="#60a5fa" />
                 </linearGradient>
               </defs>
               {/* Drawing a simple dashed line down the center for visual connection. 
                  Since flex offset logic is complex for SVG, we use a central winding path 
                  simulated by the layout, but here's a visual guide line.
               */}
               <path d="M 50% 100% L 50% 0%" stroke="white" strokeWidth="8" strokeDasharray="20,20" fill="none" opacity="0.6" />
            </svg>

            {ALL_GROUPS.map((g, i) => {
              const isLockedGroup = g.locked || g.id > user.progress;
              const isCurrentGroup = g.id === user.progress;
              const stars = user.stars[g.id] || 0;
              
              const isTracingDone = g.id < user.progress || (isCurrentGroup && user.subStep > 0);
              const isTracingActive = isCurrentGroup && user.subStep === 1;
              const isPopDone = g.id < user.progress || (isCurrentGroup && user.subStep > 1);
              const isPopActive = isCurrentGroup && user.subStep === 2;

              // Alternating Layout
              const isRight = i % 2 === 0;
              const containerClass = isRight ? 'translate-x-16 items-start' : '-translate-x-16 items-end';
              
              return (
                <div key={g.id} id={`group-${g.id}`} className={`relative mb-32 flex flex-col ${isRight ? 'items-start ml-12' : 'items-end mr-12'}`}>
                  
                  {/* --- PATH SEGMENT (Mini Games) --- */}
                  {!g.locked && (
                     <div className={`flex flex-col gap-8 mb-6 ${isRight ? 'ml-10' : 'mr-10'}`}>
                        {/* Pop Game (Top) */}
                        <div className="relative">
                          {isPopActive && <div className="absolute -left-16 top-0 w-16 h-16 animate-bounce"><SuperHero heroId={user.hero} className="w-full h-full"/></div>}
                          <button
                            onClick={() => { setActiveGroup(g.id); setActiveMiniGame('pop'); setView('minigame'); }}
                            disabled={!isTracingDone} 
                            className={`
                                w-14 h-14 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all z-10 relative
                                ${!isTracingDone ? 'bg-slate-300 grayscale' : isPopDone ? 'bg-purple-400' : 'bg-purple-500 animate-pulse'}
                            `}
                          >
                              {isPopDone ? <Check size={20} className="text-white"/> : <PartyPopper size={20} className="text-white"/>}
                          </button>
                        </div>

                        {/* Tracing Game (Bottom) */}
                        <div className="relative">
                          {isTracingActive && <div className="absolute -left-16 top-0 w-16 h-16 animate-bounce"><SuperHero heroId={user.hero} className="w-full h-full"/></div>}
                          <button
                            onClick={() => { setActiveGroup(g.id); setActiveMiniGame('tracing'); setView('minigame'); }}
                            disabled={isLockedGroup && user.subStep === 0}
                            className={`
                                w-14 h-14 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all z-10 relative
                                ${(isLockedGroup && user.subStep === 0) ? 'bg-slate-300 grayscale' : isTracingDone ? 'bg-blue-400' : 'bg-blue-500 animate-pulse'}
                            `}
                          >
                              {isTracingDone ? <Check size={20} className="text-white"/> : <Pencil size={20} className="text-white"/>}
                          </button>
                        </div>
                     </div>
                  )}

                  {/* --- MAIN GROUP NODE --- */}
                  <div className="relative z-10">
                      {(isCurrentGroup && user.subStep === 0) && (
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-20 h-20 pointer-events-none z-30 animate-bounce">
                            <SuperHero heroId={user.hero} emotion="happy" className="w-full h-full" />
                        </div>
                      )}

                      <button
                        onClick={() => !isLockedGroup && (setActiveGroup(g.id), setView('game'))}
                        disabled={isLockedGroup}
                        className={`
                          w-28 h-28 rounded-4xl border-4 border-white shadow-xl flex flex-col items-center justify-center transition-all relative
                          ${isLockedGroup ? 'bg-slate-300 grayscale' : 'bg-linear-to-br from-emerald-400 to-teal-500 hover:scale-110'}
                          ${(isCurrentGroup && user.subStep === 0) ? 'ring-8 ring-white/50' : ''}
                        `}
                      >
                        {isLockedGroup ? <Lock className="text-white/50" size={32} /> : (
                          <>
                            <span className="text-4xl font-black text-white drop-shadow-md">{g.id}</span>
                            <div className="flex gap-0.5 mt-1">
                              {[1,2,3].map(s => <Star key={s} size={10} className={s <= Math.floor(stars) ? "fill-yellow-300 text-yellow-300" : "text-emerald-700/30"} />)}
                            </div>
                          </>
                        )}
                      </button>

                      {!isLockedGroup && (
                        <div className={`absolute top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg whitespace-nowrap ${isRight ? 'right-full mr-4' : 'left-full ml-4'}`}>
                          <div className="text-xs font-bold text-slate-400 uppercase">{g.title}</div>
                          <div className="font-black text-slate-700">{g.sounds}</div>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}

            <div id="start-node" className="absolute bottom-0 w-full h-40 bg-emerald-500 rounded-t-[50%] flex items-end justify-center pb-8">
              <span className="text-white/50 font-black text-4xl tracking-[1em]">START</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- HOME SCREEN (Restored) ---
  if (view === 'home') {
    return (
      <div className="h-screen w-full flex flex-col overflow-hidden bg-sky-100 relative">
        <WorldBackground />
        
        <div className="z-10 p-6 flex justify-between items-start">
          <button onClick={() => setShowProfile(true)} className="bg-white/80 backdrop-blur-md pl-4 pr-6 py-2 rounded-full shadow-lg flex items-center gap-4 border-2 border-white hover:scale-105 transition-transform group">
            <div className="w-12 h-12 bg-indigo-100 rounded-full border-2 border-white overflow-hidden relative">
               <SuperHero heroId={user.hero} className="w-full h-full scale-150 translate-y-2" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-black text-indigo-900 leading-none">{user.name}</h2>
              <div className="flex items-center gap-1 text-xs font-bold text-indigo-400">
                 <span>Group {user.progress}</span>
                 <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
                 <span className="flex items-center text-yellow-500"><Star size={10} className="fill-yellow-500 mr-0.5"/> {Math.floor(totalStars)}</span>
              </div>
            </div>
          </button>
        </div>

        <div className="flex-1 z-10 flex flex-col items-center justify-center gap-6 p-6 overflow-y-auto pb-20">
          <button onClick={() => setView('map')} className="w-full max-w-sm h-64 shrink-0 relative group transition-transform hover:scale-105">
            <div className="absolute inset-0 bg-red-500 rounded-4xl rotate-2 opacity-30 group-hover:rotate-6 transition-transform" />
            <div className="relative h-full bg-linear-to-br from-red-100 to-red-50 rounded-4xl border-8 border-white shadow-2xl flex flex-col items-center justify-center">
              <Zap size={80} className="text-red-400 mb-4" />
              <h2 className="text-4xl font-black text-red-600">PHONICS</h2>
              <span className="text-red-400 font-bold">Super Sounds</span>
            </div>
          </button>

          <button className="w-full max-w-sm h-64 shrink-0 relative group transition-transform hover:scale-105 opacity-80 cursor-not-allowed">
            <div className="absolute inset-0 bg-blue-500 rounded-4xl -rotate-2 opacity-30 group-hover:-rotate-6 transition-transform" />
            <div className="relative h-full bg-linear-to-br from-blue-100 to-blue-50 rounded-4xl border-8 border-white shadow-2xl flex flex-col items-center justify-center">
              <Shield size={80} className="text-blue-400 mb-4" />
              <h2 className="text-4xl font-black text-blue-600">GRAMMAR</h2>
              <span className="text-blue-400 font-bold">Coming Soon</span>
            </div>
          </button>
        </div>

        {/* PROFILE MODAL (Same as before) */}
        {showProfile && (
           <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-4xl p-6 w-full max-w-md shadow-2xl border-4 border-white animate-pop relative">
                 <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X size={20}/></button>
                 
                 <h2 className="text-center text-2xl font-black text-slate-800 mb-6">HERO PROFILE</h2>
                 
                 <div className="flex justify-center mb-8">
                    <div className="w-32 h-32 relative">
                       <SuperHero heroId={user.hero} emotion="happy" className="w-full h-full" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-100 flex flex-col items-center">
                       <Star className="text-yellow-400 fill-yellow-400 mb-2" />
                       <span className="text-2xl font-black text-yellow-600">{Math.floor(totalStars)}</span>
                       <span className="text-xs font-bold text-yellow-400 uppercase">Stars</span>
                    </div>
                    <div className={`p-4 rounded-xl border-2 flex flex-col items-center ${user.progress > 20 ? 'bg-yellow-100 border-yellow-300' : user.progress > 10 ? 'bg-slate-100 border-slate-300' : 'bg-orange-50 border-orange-200'}`}>
                       <div className="relative">
                          <Trophy size={32} className={`mb-2 ${user.progress > 20 ? 'text-yellow-600 fill-yellow-400' : user.progress > 10 ? 'text-slate-500 fill-slate-300' : 'text-orange-600 fill-orange-300'}`} />
                          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-black text-white">{user.progress}</span>
                       </div>
                       <span className={`text-2xl font-black ${user.progress > 20 ? 'text-yellow-700' : user.progress > 10 ? 'text-slate-600' : 'text-orange-700'}`}>
                          Lvl {user.progress}
                       </span>
                    </div>
                 </div>

                 <p className="font-bold text-slate-400 text-sm mb-4 uppercase tracking-wider text-center">Change Character</p>
                 <div className="flex justify-center gap-3">
                    {Object.keys(HEROES).map(key => (
                       <button 
                         key={key} 
                         onClick={() => setUser({...user, hero: key})}
                         className={`w-16 h-16 rounded-xl border-2 transition-all overflow-hidden ${user.hero === key ? 'border-blue-500 bg-blue-50 scale-110 shadow-lg' : 'border-gray-100 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                       >
                          <SuperHero heroId={key} className="w-full h-full scale-125 translate-y-2" />
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        )}
      </div>
    );
  }

  // --- LOGIN ---
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      <WorldBackground />
      <div className="z-10 bg-white/90 backdrop-blur-xl p-8 rounded-4xl shadow-2xl w-full max-w-sm flex flex-col items-center border-4 border-white/50 animate-pop">
        <h1 className="text-4xl font-black text-indigo-900 mb-2 text-center">WONDER PHONICS</h1>
        <p className="text-slate-500 font-bold mb-8">Pick Your Hero</p>
        <div className="flex gap-3 mb-8">
          {Object.keys(HEROES).map(key => (
            <button key={key} onClick={() => setUser({...user, hero: key})} className={`transition-all ${user.hero === key ? 'scale-125 z-10' : 'scale-90 opacity-60'}`}>
              <SuperHero heroId={key} className="w-16 h-16" />
            </button>
          ))}
        </div>
        <input 
          placeholder="Hero Name"
          value={user.name}
          onChange={e => setUser({...user, name: e.target.value})}
          className="w-full bg-slate-100 rounded-2xl p-4 text-center font-bold text-xl text-slate-800 mb-6 focus:ring-4 ring-purple-300 outline-none"
        />
        <button onClick={() => user.name && setView('home')} className="w-full bg-linear-to-r from-indigo-500 to-purple-500 py-4 rounded-2xl text-white font-black text-xl shadow-lg hover:scale-105 transition-transform">
          START ADVENTURE
        </button>
      </div>
    </div>
  );
}