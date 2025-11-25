import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- SHARED UTILS ---
const speak = (text) => {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
};

// --- GAME 1: WORD TRACING ---
export const TracingGame = ({ targetLetter, onComplete, onExit }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    speak(`Trace the word, ${targetLetter}`);
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [targetLetter]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawGuide(ctx, rect.width, rect.height);
  };

  const drawGuide = (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const fontSize = Math.min(w / (targetLetter.length * 0.6), h * 0.8);
    ctx.font = `bold ${fontSize}px "Comic Sans MS", "Chalkboard SE", sans-serif`;
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(targetLetter, w / 2, h / 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([8, 8]);
    ctx.strokeText(targetLetter, w / 2, h / 2);
    ctx.setLineDash([]);
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    if (hasFinished) return;
    setIsDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 35; 
    ctx.strokeStyle = '#3b82f6';
  };

  const draw = (e) => {
    if (!isDrawing || hasFinished) return;
    e.preventDefault(); 
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Generous increment to ensure they win
    const increment = 3.0 / targetLetter.length; 
    setProgress(p => Math.min(p + increment, 100));
  };

  const endDraw = () => {
    setIsDrawing(false);
    if (progress >= 95 && !hasFinished) {
      setHasFinished(true);
      speak("Excellent writing!");
      confetti({ particleCount: 80, origin: { y: 0.7 } });
      setTimeout(() => onComplete(true), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4 animate-pop">
      <button onClick={onExit} className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full"><ArrowLeft /></button>
      
      <h2 className="text-3xl font-black text-slate-700 mb-2">Trace: {targetLetter}</h2>
      
      <div className="relative w-full max-w-4xl h-64 md:h-96 bg-slate-50 rounded-3xl border-4 border-slate-200 shadow-xl overflow-hidden touch-none flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      
      <div className="mt-8 w-64 h-8 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300">
        <div className="h-full bg-green-500 transition-all duration-100" style={{width: `${progress}%`}} />
      </div>
      <p className="mt-2 text-slate-400 font-bold">{Math.round(progress)}%</p>
    </div>
  );
};

// --- GAME 2: PHONICS POP ---
export const PhonicsPopGame = ({ targetSound, distractors, onComplete, onExit }) => {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState('playing');
  const gameLoopRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    speak(`Pop bubbles with the letter ${targetSound}`);
    startGame();
    startTimer();
    return () => {
      clearInterval(gameLoopRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGame = () => {
    gameLoopRef.current = setInterval(() => {
      setBubbles(prev => {
        const filtered = prev.filter(b => b.y > -100);
        if (filtered.length < 7) {
          const isTarget = Math.random() > 0.6;
          const content = isTarget ? targetSound : distractors[Math.floor(Math.random() * distractors.length)];
          return [...filtered, {
            id: Date.now() + Math.random(),
            x: Math.random() * 80 + 10, 
            y: 110, 
            speed: Math.random() * 0.1 + 0.05, // VERY SLOW
            content,
            isTarget,
            scale: 1
          }];
        }
        return filtered;
      });
    }, 1200);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    let animId;
    const animate = () => {
      setBubbles(prev => prev.map(b => ({ ...b, y: b.y - b.speed })));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  const endGame = (result) => {
    setGameState(result);
    clearInterval(gameLoopRef.current);
    clearInterval(timerRef.current);
    
    if (result === 'won') {
      confetti();
      speak("You did it!");
      setTimeout(() => onComplete(true), 2000); 
    } else {
      speak("Time is up. Moving on!");
      // On failure, we still "Complete" but user gets no stars. 
      // The requirement was: "no stars if failed but still unlocks the next group"
      setTimeout(() => onComplete(false), 2000);
    }
  };

  const handlePop = (bubble) => {
    if (gameState !== 'playing') return;

    if (bubble.isTarget) {
      speak(bubble.content);
      const newScore = score + 1;
      setScore(newScore);
      setBubbles(prev => prev.filter(b => b.id !== bubble.id));

      if (newScore >= 5) {
        endGame('won');
      }
    } else {
      speak("No");
      setBubbles(prev => prev.map(b => b.id === bubble.id ? {...b, scale: 0.8} : b));
    }
  };

  return (
    <div className="fixed inset-0 bg-linear-to-b from-cyan-200 to-blue-400 z-50 overflow-hidden flex flex-col">
       <div className="p-4 flex justify-between items-start z-10">
         <button onClick={onExit} className="p-2 bg-white/50 rounded-full"><ArrowLeft color="white"/></button>
         
         <div className="flex gap-4">
            <div className={`px-4 py-2 rounded-full font-black text-xl shadow-lg border-2 border-white flex items-center gap-2 ${timeLeft < 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/90 text-blue-600'}`}>
                <Timer size={20} /> {timeLeft}s
            </div>
            <div className="bg-white/90 px-6 py-2 rounded-full font-black text-blue-600 text-xl shadow-lg border-2 border-white">
                Pop: {score} / 5
            </div>
         </div>
       </div>

       <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
          <span className="text-9xl font-black text-white">{targetSound}</span>
       </div>

       {bubbles.map(b => (
         <button
           key={b.id}
           onClick={() => handlePop(b)}
           className="absolute w-28 h-28 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.1),0_10px_20px_rgba(0,0,0,0.2)] flex items-center justify-center border-2 border-white/50 backdrop-blur-sm transition-transform active:scale-125"
           style={{
             left: `${b.x}%`,
             top: `${b.y}%`,
             backgroundColor: b.isTarget ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)',
             transform: `scale(${b.scale})`
           }}
         >
           <span className="text-5xl font-black text-slate-800 drop-shadow-sm">{b.content}</span>
           <div className="absolute top-4 left-4 w-6 h-3 bg-white rounded-[50%] rotate-45 opacity-60"></div>
         </button>
       ))}

       {gameState === 'won' && (
         <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <h1 className="text-7xl font-black text-white animate-bounce">SUCCESS!</h1>
         </div>
       )}
       
       {gameState === 'lost' && (
         <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <h1 className="text-6xl font-black text-red-400">TIME'S UP!</h1>
         </div>
       )}
    </div>
  );
};