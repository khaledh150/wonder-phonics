export const HEROES = {
  blaze: { name: "Blaze" },
  storm: { name: "Storm" },
  spark: { name: "Spark" },
  terra: { name: "Terra" },
};

export const GROUPS = [
  {
    id: 1,
    title: "Group 1",
    sounds: "s, a, t, i, p, n",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    // EXPANDED WORD LIST FROM YOUR REQUEST
    words: [
      { word: "pin", image: "pin" },
      { word: "tin", image: "tin" },
      { word: "pan", image: "pan" },
      { word: "tan", image: "tan" },
      { word: "nap", image: "nap" },
      { word: "sat", image: "sat" },
      { word: "sip", image: "sip" },
      { word: "pants", image: "pants" }, 
      { word: "ant", image: "ant" },
      { word: "pit", image: "pit" },
      { word: "sap", image: "sap" },
      // Duplicates/Extras to ensure variety if needed
      { word: "tap", image: "default" },
      { word: "pat", image: "default" },
      { word: "sit", image: "default" }
    ],
    sentences: [
      { text: "I ____ water.", answer: "sip", options: ["sip", "sap", "sat", "tin"] },
      { text: "She has a safety ____.", answer: "pin", options: ["pin", "pan", "pit", "nap"] },
      { text: "Cookies are in the ____.", answer: "tin", options: ["tin", "tan", "sat", "sip"] },
      { text: "He wears long ____.", answer: "pants", options: ["pants", "pins", "pans", "pits"] },
      { text: "The baby takes a ____.", answer: "nap", options: ["nap", "map", "tap", "sap"] },
      { text: "He fell into a ____.", answer: "pit", options: ["pit", "pat", "pot", "pin"] },
      { text: "She cooks eggs in a ____.", answer: "pan", options: ["pan", "pin", "pen", "tan"] },
      { text: "The cat ____ on the mat.", answer: "sat", options: ["sat", "sit", "sip", "sap"] },
      { text: "He has a brown ____.", answer: "tan", options: ["tan", "tin", "ten", "pan"] },
      { text: "The tree has sticky ____.", answer: "sap", options: ["sap", "sip", "sat", "nap"] }
    ]
  },
  // Placeholders
  ...Array.from({length: 19}).map((_, i) => ({
    id: i + 2,
    title: `Group ${i + 2}`,
    sounds: "Locked",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    words: [{ word: "star", image: "default" }],
    sentences: [{ text: "Demo ____.", answer: "test", options: ["test", "toast", "tast", "tost"] }]
  }))
];

// --- HELPER FOR MINI GAMES ---
export const getMiniGameData = (groupId) => {
  const group = GROUPS.find(g => g.id === groupId) || GROUPS[0];
  
  // Tracing: Random word from the group
  const randomWordObj = group.words[Math.floor(Math.random() * group.words.length)];
  const traceTarget = randomWordObj ? randomWordObj.word.toUpperCase() : "ABC";
  
  // Pop: Randomly pick ONE sound from the group's sound list (e.g., 'p' or 's' or 'a')
  const availableSounds = group.sounds.split(',').map(s => s.trim().toUpperCase());
  const popTarget = availableSounds[Math.floor(Math.random() * availableSounds.length)];
  
  const distractors = ["X", "Z", "Q", "B", "R", "M", "K", "L"].filter(c => c !== popTarget);
  
  return {
    tracing: { target: traceTarget },
    pop: { target: popTarget, distractors: distractors }
  };
};

export const generateQuestions = (groupId) => {
  const group = GROUPS.find(g => g.id === groupId) || GROUPS[0];
  const allWords = group.words;
  const allSentences = group.sentences;
  
  const q1 = { type: 'video', src: group.video, title: group.title, sounds: group.sounds };

  const w1 = allWords[Math.floor(Math.random() * allWords.length)];
  const distractors = allWords.filter(w => w.word !== w1.word).sort(() => 0.5 - Math.random()).slice(0, 2);
  const q2 = { 
    type: 'image_match', 
    prompt: `Find the ${w1.word.toUpperCase()}`, 
    target: w1.word, 
    options: [w1, ...distractors].sort(() => 0.5 - Math.random())
  };

  const s1 = allSentences[Math.floor(Math.random() * allSentences.length)];
  const q3 = { 
    type: 'fill_blank', 
    prompt: s1.text, 
    target: s1.answer, 
    options: s1.options 
  };

  const pool = allWords.sort(() => 0.5 - Math.random()).slice(0, 4);
  const distractorWord = allWords.find(w => !pool.includes(w))?.word || "bogus";
  const q4 = {
    type: 'word_pic_match',
    prompt: "Match words to pictures!",
    pairs: pool.map(p => ({ word: p.word, img: p.image })),
    distractor: distractorWord
  };

  const w2 = allWords[Math.floor(Math.random() * allWords.length)];
  const q5 = {
    type: 'speech',
    prompt: `Say: ${w2.word.toUpperCase()}`,
    target: w2.word,
    image: w2.image
  };

  const w3 = allWords[Math.floor(Math.random() * allWords.length)];
  const q6 = {
    type: 'spelling',
    prompt: `Spell: ${w3.word.toUpperCase()}`,
    target: w3.word,
    image: w3.image
  };

  return [q1, q2, q3, q4, q5, q6];
};