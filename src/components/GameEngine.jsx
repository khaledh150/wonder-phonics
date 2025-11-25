import React, { useState, useEffect } from 'react';
import { Volume2, Mic, MicOff, X, Star, RotateCcw } from 'lucide-react';
import { SuperHero, GameAsset } from './Assets';
import confetti from 'canvas-confetti';

const speak = (text) => {
  if (!text) return;
  const clean = text.replace(/_+/g, "blank").replace(/\//g, " or ");
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
};

const StarDisplay = ({ value, index }) => {
  let fillPercent = 0;
  if (value >= index) {
    fillPercent = 100;
  } else if (value >= index - 0.5) {
    fillPercent = 50;
  }

  return (
    <div className="relative w-8 h-8">
       <Star className="text-gray-200 absolute inset-0" size={32} />
       <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
         <Star className="text-yellow-400 fill-yellow-400" size={32} />
       </div>
    </div>
  );
};

export const GameSession = ({ questions, userHero, onComplete, onExit }) => {
  const [index, setIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [status, setStatus] = useState('idle');
  const [matchState, setMatchState] = useState({ selectedWord: null, pairsFound: [] });
  const [isListening, setIsListening] = useState(false);
  const [simTranscript, setSimTranscript] = useState("");
  const [spellingInput, setSpellingInput] = useState([]);

  const q = questions[index];

  useEffect(() => {
    if (q.type === 'video' && currentScore === 0) {
        setCurrentScore(0.5);
    }
  }, [q, currentScore]);

  useEffect(() => {
    if (q.type !== 'video') speak(q.prompt);
    setSpellingInput([]); 
  }, [index, q]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setStatus('correct');
      speak("Excellent!");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      
      if (q.type !== 'video') {
         setCurrentScore(s => Math.min(3, s + 0.5));
      }

      setTimeout(() => {
        if (index < questions.length - 1) {
          setIndex(i => i + 1);
          setStatus('idle');
          setMatchState({ selectedWord: null, pairsFound: [] });
          setIsListening(false);
          setSimTranscript("");
          setSpellingInput([]);
        } else {
          onComplete(currentScore + (q.type !== 'video' ? 0.5 : 0)); 
        }
      }, 1500);
    } else {
      setStatus('wrong');
      speak("Try again");
      setTimeout(() => setStatus('idle'), 1000);
    }
  };

  const startSimulatedSpeech = () => {
    setIsListening(true);
    speak("Listening...");
    setTimeout(() => {
      setSimTranscript(q.target);
      setIsListening(false);
      handleAnswer(true); 
    }, 2000);
  };

  const handleMatchClick = (type, value) => {
    if (type === 'word') {
      setMatchState(prev => ({ ...prev, selectedWord: value }));
      speak(value);
    } else if (type === 'img') {
      if (matchState.selectedWord) {
        const pair = q.pairs.find(p => p.word === matchState.selectedWord);
        if (pair && pair.img === value) {
          const newPairs = [...matchState.pairsFound, matchState.selectedWord];
          setMatchState({ selectedWord: null, pairsFound: newPairs });
          if (newPairs.length === 4) handleAnswer(true);
        } else {
          speak("Not a match");
          setMatchState(prev => ({ ...prev, selectedWord: null }));
        }
      }
    }
  };

  const handleSpellingClick = (char) => {
    const newInput = [...spellingInput, char];
    setSpellingInput(newInput);
    speak(char);
    const currentWord = newInput.join('');
    if (currentWord === q.target) {
      handleAnswer(true);
    } else if (!q.target.startsWith(currentWord)) {
      speak("Oops");
      setTimeout(() => setSpellingInput([]), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onExit} className="p-2 bg-gray-100 rounded-full"><X className="text-slate-500"/></button>
        <div className="flex-1 mx-4 h-4 bg-gray-200 rounded-full overflow-hidden">
             <div className="h-full bg-green-400 transition-all duration-500" style={{width: `${((index + 1) / questions.length) * 100}%`}} />
        </div>
        <div className="flex gap-1 bg-slate-100 p-2 rounded-full">
          {[1,2,3].map(s => <StarDisplay key={s} value={currentScore} index={s} />)}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full pb-24 animate-pop">
        
        {q.type === 'video' && (
          <div className="text-center w-full">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-6 border-4 border-purple-200">
              <video src={q.src} controls className="w-full h-full" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">{q.title}</h2>
            <button onClick={() => handleAnswer(true)} className="w-full bg-green-500 text-white px-8 py-4 rounded-4xl text-xl font-black shadow-lg animate-bounce">START GAME</button>
          </div>
        )}

        {q.type === 'image_match' && (
          <div className="w-full">
            <div className="bg-white p-6 rounded-4xl shadow-xl text-center mb-8 relative border-4 border-indigo-50">
              <button onClick={() => speak(q.prompt)} className="absolute -top-4 -right-4 bg-blue-500 p-3 rounded-full text-white shadow-lg hover:scale-110"><Volume2 /></button>
              <h2 className="text-3xl font-black text-slate-700">{q.prompt}</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt.word === q.target)} className="bg-white p-4 rounded-3xl shadow-md border-b-8 border-slate-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center h-40">
                  <GameAsset type={opt.image} className="w-32 h-32" />
                </button>
              ))}
            </div>
          </div>
        )}

        {q.type === 'fill_blank' && (
          <div className="w-full">
            <div className="bg-white p-8 rounded-4xl shadow-xl text-center mb-8 relative border-4 border-indigo-50">
               <button onClick={() => speak(q.prompt)} className="absolute -top-4 -right-4 bg-blue-500 p-3 rounded-full text-white shadow-lg hover:scale-110"><Volume2 /></button>
              <h2 className="text-2xl font-black text-slate-700">{q.prompt}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt === q.target)} className="bg-white py-6 rounded-2xl border-b-4 border-indigo-100 font-bold text-3xl text-indigo-600 shadow-md hover:bg-indigo-50 active:translate-y-1">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {q.type === 'word_pic_match' && (
          <div className="w-full">
            <h3 className="text-center font-bold text-slate-400 mb-6 uppercase">Match Pictures & Words</h3>
            <div className="flex justify-between mb-8 gap-2">
              {q.pairs.map(pair => (
                <button key={pair.img} onClick={() => handleMatchClick('img', pair.img)} disabled={matchState.pairsFound.includes(pair.word)} className={`w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 transition-all ${matchState.pairsFound.includes(pair.word) ? 'opacity-30 border-green-400' : 'border-transparent hover:border-blue-300'}`}>
                  <GameAsset type={pair.img} className="w-20 h-20" />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {[...q.pairs.map(p=>p.word), q.distractor].sort().map(word => (
                <button key={word} onClick={() => handleMatchClick('word', word)} disabled={matchState.pairsFound.includes(word)} className={`px-6 py-4 rounded-full font-bold text-2xl shadow-sm transition-all border-b-4 ${matchState.pairsFound.includes(word) ? 'bg-green-100 text-green-400 scale-0' : matchState.selectedWord === word ? 'bg-blue-500 border-blue-700 text-white scale-110' : 'bg-white border-slate-200 text-slate-700'}`}>
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {q.type === 'speech' && (
          <div className="text-center">
            <div className="mb-8 animate-bounce flex justify-center">
               <GameAsset type={q.image} className="w-48 h-48" />
            </div>
            <h2 className="text-4xl font-black mb-8 text-slate-700">{q.prompt}</h2>
            <button onClick={startSimulatedSpeech} className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-8 border-white transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:scale-105'}`}>
              {isListening ? <MicOff size={48} className="text-white" /> : <Mic size={48} className="text-white" />}
            </button>
            <p className="mt-6 text-slate-400 font-bold">{isListening ? "Listening..." : "Tap to Speak"}</p>
          </div>
        )}

        {q.type === 'spelling' && (
            <div className="w-full text-center">
               <div className="mb-6 flex justify-center">
                  <GameAsset type={q.image} className="w-40 h-40" />
               </div>
               <button onClick={() => speak(q.target)} className="mb-6 bg-blue-100 text-blue-500 px-6 py-3 rounded-full font-bold flex items-center gap-2 mx-auto text-xl"><Volume2 size={24}/> Hear Word</button>
               
               <div className="flex justify-center gap-2 mb-8 h-20">
                  {q.target.split('').map((_, i) => (
                    <div key={i} className="w-16 h-20 bg-slate-100 rounded-xl border-b-4 border-slate-200 flex items-center justify-center text-4xl font-black text-slate-700">
                        {spellingInput[i] || ""}
                    </div>
                  ))}
               </div>

               <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
                  {(q.target + "ABC").split('').sort(()=>Math.random()-0.5).map((char, i) => (
                     <button key={i} onClick={() => handleSpellingClick(char)} className="w-16 h-16 bg-white rounded-xl shadow-md border-b-4 border-indigo-100 font-black text-2xl text-indigo-600 hover:scale-105 active:scale-95 transition-all">
                        {char}
                     </button>
                  ))}
                  <button onClick={() => setSpellingInput([])} className="w-16 h-16 bg-red-100 rounded-xl shadow-md border-b-4 border-red-200 text-red-500 flex items-center justify-center">
                    <RotateCcw size={28} />
                  </button>
               </div>
            </div>
        )}

      </div>

      <div className="absolute bottom-0 left-4 w-32 h-32 pointer-events-none z-10">
        <SuperHero heroId={userHero} emotion={status === 'correct' ? 'happy' : status === 'wrong' ? 'sad' : 'idle'} />
      </div>
    </div>
  );
};