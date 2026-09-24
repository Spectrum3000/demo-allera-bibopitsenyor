const steps = [...document.querySelectorAll('#steps .dot')];
const screens = {
intro: document.getElementById('screen-intro'),
passage: document.getElementById('screen-passage'),
question: document.getElementById('screen-question'),
results: document.getElementById('screen-results'),
};
const order = ['intro', 'passage', 'question', 'results'];

const promptBank = [
    {
    passage: 'Lina finds a tiny seed in her pocket. She plants it in a cup, gives it water, and checks it every morning. After a few days, a green leaf pops up.',
    question: 'What is your favorite thing to do after school, and why do you like it?'
    },
    {
    passage: 'Sam packs a red kite for a trip to the park. The wind lifts it high above the trees, and Sam holds the string with both hands. When the kite comes down, a friendly dog runs over to say hello.',
    question: 'Tell me about a fun game you like to play with a friend or family member.'
    },
    {
    passage: 'Mia helps her grandpa make pancakes on Saturday morning. She mixes the batter while he warms the pan. Their first pancake is silly and lumpy, but it still tastes delicious.',
    question: 'What is a food you enjoy, and what does it taste or smell like?'
    },
    {
    passage: 'A little turtle named Pip wants to cross the garden. Pip walks past a yellow flower, a smooth stone, and a puddle. At last, Pip reaches the shady pond and rests on a log.',
    question: 'If you could be any animal for one day, which animal would you be?'
    },
    {
    passage: 'Nora hears music coming from the kitchen. Her brother is tapping spoons on a bowl and making up a song about bananas. Nora adds a dance, and soon everyone is laughing.',
    question: 'What makes you laugh or feel happy? Tell me about it.'
    },
    {
    passage: 'The library has a new story corner with blue cushions. Eli chooses a book about space and pretends the cushions are a rocket. Three, two, one, the reading adventure begins.',
    question: 'What kind of story would you like to read or hear today?'
    },
    {
    passage: 'Kai sees dark clouds over the playground. He brings the soccer ball inside and builds a tall block tower instead. When the rain stops, the tower is still standing.',
    question: 'What do you like to do on a rainy day?'
    },
    {
    passage: 'Ruby carries a basket of apples from the garden. One apple rolls away and stops beside a bench. Ruby picks it up, gives it a shine, and shares it with her little sister.',
    question: 'Tell me about a time you shared something with someone.'
    },
    {
    passage: 'Owen wakes up and sees a rainbow outside his window. He counts seven colors before getting dressed. On the way to school, he tells his best friend about the bright sky.',
    question: 'What is something beautiful you have seen? Describe it.'
    },
    {
    passage: 'Zoe builds a pretend shop with a box and three pillows. She puts toy fruit on a plate and makes a sign. Her dad visits the shop and buys a very funny purple banana.',
    question: 'If you opened a pretend shop, what would you sell?'
    },
    {
    passage: 'Ben loses one of his socks before school. He looks under the bed, behind a chair, and inside the laundry basket. He finds it hiding in his backpack with a toy car.',
    question: 'Tell me about something you lost and found.'
    },
    {
    passage: 'A small bird lands on Tia\'s window. Tia stays quiet and watches it hop from side to side. After a minute, the bird spreads its wings and flies to a nearby tree.',
    question: 'What would you ask an animal if it could talk?'
    },
    {
    passage: 'Leo helps clean the playground after a windy day. He picks up paper and puts each piece in the bin. When the playground is tidy, he feels proud of his helpful work.',
    question: 'How do you help at home or at school?'
    },
    {
    passage: 'Ella draws a map to a make-believe island. The map has a candy forest, a tall volcano, and a bridge made of clouds. She gives the map to her cousin for an adventure.',
    question: 'What would be on your own make-believe island?'
    },
    {
    passage: 'Max hears a soft sound in the garden and follows it carefully. A tiny frog is sitting beside the pond. Max watches from far away so the frog can keep singing.',
    question: 'What is a sound you like to hear? When do you hear it?'
    },
    {
    passage: 'Sofia makes a card for her teacher. She draws stars around a big thank-you message and adds a yellow sun. Her teacher smiles and puts the card on the desk.',
    question: 'Who is someone you would like to thank, and what would you say?'
    }
];
let selectedPrompt = promptBank[0];
let hasSelectedPrompt = false;

function choosePrompt() {
const previous = selectedPrompt;
const choices = promptBank.filter((prompt) => prompt !== previous);
selectedPrompt = choices[Math.floor(Math.random() * choices.length)];
hasSelectedPrompt = true;
document.getElementById('passage-text').textContent = selectedPrompt.passage;
document.getElementById('q-text').textContent = selectedPrompt.question;
}

function goTo(name) {
stopSpeaking();
order.forEach((n, i) => {
    screens[n].classList.toggle('visible', n === name);
    const idx = order.indexOf(name);
    if (steps[i]) {
    steps[i].classList.toggle('done', i < idx);
    steps[i].classList.toggle('active', i === idx);
    }
});
const navName = name === 'intro' ? 'home' : name === 'results' ? 'map' : 'play';
document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.nav === navName);
});
if (name === 'passage') playPrompt(document.getElementById('passage-text').textContent, 'btn-mic-passage');
if (name === 'question') playPrompt(document.getElementById('q-text').textContent, 'btn-mic-question');
}

// --- Speech recognition setup ---
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognitionAPI) {
recognition = new SpeechRecognitionAPI();
recognition.continuous = false;
recognition.interimResults = true;
recognition.maxAlternatives = 1;
recognition.lang = 'en-US';
}

// --- AI voice playback (Play/Stop toggle) ---
let speakingBtn = null;

function stopSpeaking() {
speechSynthesis.cancel();
if (speakingBtn) {
    speakingBtn.textContent = '🔊 Play';
    const micBtn = document.getElementById(speakingBtn.dataset.micBtn);
    if (micBtn) micBtn.disabled = false;
    speakingBtn = null;
}
}

function togglePlay(btn, text) {
if (speakingBtn === btn) { stopSpeaking(); return; }
stopSpeaking();
if (!('speechSynthesis' in window)) return;
const micBtn = document.getElementById(btn.dataset.micBtn);
if (micBtn) micBtn.disabled = true;
speakingBtn = btn;
btn.textContent = '⏹ Stop';
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'en-US';
utterance.rate = 0.95;
utterance.onend = () => { if (speakingBtn === btn) stopSpeaking(); };
utterance.onerror = () => { if (speakingBtn === btn) stopSpeaking(); };
speechSynthesis.speak(utterance);
}

function playPrompt(text, micBtnId) {
const btn = micBtnId === 'btn-mic-passage'
    ? document.getElementById('btn-replay-passage')
    : document.getElementById('btn-replay-question');
btn.dataset.micBtn = micBtnId;
togglePlay(btn, text);
}

document.getElementById('btn-start').addEventListener('click', () => {
choosePrompt();
goTo('passage');
});
document.getElementById('btn-replay-passage').dataset.micBtn = 'btn-mic-passage';
document.getElementById('btn-replay-passage').addEventListener('click', () => {
togglePlay(document.getElementById('btn-replay-passage'), document.getElementById('passage-text').textContent);
});
document.getElementById('btn-replay-question').dataset.micBtn = 'btn-mic-question';
document.getElementById('btn-replay-question').addEventListener('click', () => {
togglePlay(document.getElementById('btn-replay-question'), document.getElementById('q-text').textContent);
});

// --- Recording (real microphone capture, with optional live transcription) ---
let currentRecorder = null;

function setRecordState(recorder, isRecording) {
recorder.micBtn.classList.toggle('recording', isRecording);
recorder.micBtn.setAttribute('aria-label', isRecording ? 'Stop recording' : 'Start recording');
}

function saveTranscriptFile(text, filename) {
const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
const url = URL.createObjectURL(file);
const link = document.createElement('a');
link.href = url;
link.download = filename;
document.body.appendChild(link);
link.click();
link.remove();
window.setTimeout(() => URL.revokeObjectURL(url), 1000);
return file;
}

function finishRecorder(recorder) {
if (!currentRecorder || currentRecorder !== recorder || recorder.finishing) return;
recorder.finishing = true;
const displayedTranscript = recorder.transcriptEl.textContent.trim();
if (displayedTranscript && !displayedTranscript.startsWith('Listening...')) {
    recorder.lastTranscript = displayedTranscript;
}
if (recognition) {
    try { recognition.stop(); } catch (e) {}
}
if (recorder.timer) clearInterval(recorder.timer);
if (recorder.fallbackTimer) clearTimeout(recorder.fallbackTimer);
recorder.stream.getTracks().forEach((track) => track.stop());
window.setTimeout(() => {
    if (recorder.finished) return;
    recorder.finished = true;
    setRecordState(recorder, false);
    const duration = Math.max((performance.now() - recorder.startTime) / 1000, 1);
    const finalText = recorder.lastTranscript || `${recorder.finalTranscript} ${recorder.interimTranscript}`.trim();
    if (!finalText) {
    recorder.transcriptEl.textContent = 'No speech was detected. Check your microphone and try again.';
    }
    recorder.nextBtn.disabled = true;
    const transcriptFile = finalText ? saveTranscriptFile(finalText, recorder.filename) : null;
    const transcriptRead = transcriptFile ? transcriptFile.text() : Promise.resolve('');
    transcriptRead.then((fileText) => {
    recorder.onDone(finalText, duration, fileText);
    recorder.nextBtn.disabled = !fileText;
    currentRecorder = null;
    });
}, 1500);
}

function startRecognitionFor(recorder) {
if (!recognition || !currentRecorder || currentRecorder !== recorder || recorder.finished) return;
try {
    recognition.start();
} catch (e) {
    // The browser may still be closing the previous recognition session.
}
}

async function startRecorder(config) {
stopSpeaking();
if (!recognition) {
    config.transcriptEl.textContent = 'Automatic transcription is not supported here. Use Chrome or Edge and allow microphone access.';
    config.nextBtn.disabled = true;
    return;
}
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
    config.transcriptEl.textContent = 'Microphone recording is not supported in this browser.';
    config.nextBtn.disabled = true;
    return;
}
let stream;
try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error) {
    config.transcriptEl.textContent = 'Microphone access was blocked. Allow microphone access and try again.';
    return;
}
const recorder = {
    ...config,
    stream,
    chunks: [],
    finalTranscript: '',
    interimTranscript: '',
    lastTranscript: '',
    filename: config.filename,
    startTime: performance.now(),
    finished: false,
};
currentRecorder = recorder;
recorder.mediaRecorder = new MediaRecorder(stream);
recorder.mediaRecorder.ondataavailable = (event) => { if (event.data.size) recorder.chunks.push(event.data); };
recorder.mediaRecorder.onstop = () => finishRecorder(recorder);
recorder.mediaRecorder.start();
setRecordState(recorder, true);
recorder.nextBtn.disabled = true;
recorder.timer = setInterval(() => {
    const elapsed = Math.floor((performance.now() - recorder.startTime) / 1000);
    recorder.timeEl.textContent = `00:${String(elapsed).padStart(2, '0')}`;
}, 250);
if (recognition) {
    startRecognitionFor(recorder);
}
}

function wireRecorder(config) {
config.micBtn.addEventListener('click', () => {
    if (currentRecorder && currentRecorder.micBtn === config.micBtn) {
    currentRecorder.mediaRecorder.stop();
    } else {
    if (currentRecorder) currentRecorder.mediaRecorder.stop();
    config.transcriptEl.textContent = '';
    startRecorder(config);
    }
});
}

if (recognition) {
recognition.addEventListener('start', () => {
    if (currentRecorder) currentRecorder.recognitionActive = true;
});

recognition.addEventListener('result', (event) => {
    if (!currentRecorder) return;
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
    const text = event.results[i][0].transcript;
    if (event.results[i].isFinal) currentRecorder.finalTranscript += text + ' ';
    else interim += text;
    }
    currentRecorder.interimTranscript = interim;
    currentRecorder.lastTranscript = (currentRecorder.finalTranscript + interim).trim();
    currentRecorder.transcriptEl.textContent = currentRecorder.lastTranscript;
});

recognition.addEventListener('end', () => {
    if (!currentRecorder || currentRecorder.finished) return;
    currentRecorder.recognitionActive = false;
    if (currentRecorder.mediaRecorder.state === 'recording') {
    window.setTimeout(() => startRecognitionFor(currentRecorder), 150);
    }
});

recognition.addEventListener('error', (event) => {
    if (!currentRecorder || event.error === 'aborted' || event.error === 'no-speech') return;
    if (!currentRecorder.finalTranscript) {
    currentRecorder.transcriptEl.textContent = 'Listening... Speak clearly and keep going.';
    }
});
}

let passageResult = { transcript: '', duration: 1 };
let questionResult = { transcript: '', duration: 1 };

wireRecorder({
micBtn: document.getElementById('btn-mic-passage'),
transcriptEl: document.getElementById('transcript-passage'),
nextBtn: document.getElementById('btn-next-passage'),
timeEl: document.querySelector('#screen-passage .record-time'),
filename: 'alas-reading-transcript.txt',
onDone: (t, d, fileText) => { passageResult = { transcript: t, transcriptFileText: fileText, duration: d }; }
});

wireRecorder({
micBtn: document.getElementById('btn-mic-question'),
transcriptEl: document.getElementById('transcript-question'),
nextBtn: document.getElementById('btn-next-question'),
timeEl: document.querySelector('#screen-question .record-time'),
filename: 'alas-speaking-transcript.txt',
onDone: (t, d, fileText) => { questionResult = { transcript: t, transcriptFileText: fileText, duration: d }; }
});

document.getElementById('btn-next-passage').addEventListener('click', () => {
goTo('question');
});
document.getElementById('btn-next-question').addEventListener('click', () => {
showResults();
goTo('results');
});

document.querySelectorAll('[data-nav]').forEach((item) => {
item.addEventListener('click', () => {
    const destination = item.dataset.nav;
    if (destination === 'home') goTo('intro');
    if (destination === 'play') {
    if (!hasSelectedPrompt) choosePrompt();
    goTo('passage');
    }
    if (destination === 'map') {
    showResults();
    goTo('results');
    }
});
});

// --- Scoring ---
function accuracyScore(expectedText, transcript) {
const expectedWords = expectedText.toLowerCase().replace(/[.,]/g, '').split(/\s+/).filter(Boolean);
const saidWords = new Set(transcript.toLowerCase().replace(/[.,]/g, '').split(/\s+/));
const matched = expectedWords.filter(w => saidWords.has(w)).length;
return Math.round((matched / expectedWords.length) * 100);
}
function fluencyScore(transcript, durationSec) {
const words = transcript.trim().split(/\s+/).filter(Boolean);
if (words.length === 0) return 0;
const wpm = words.length / (durationSec / 60);
const fillerCount = (transcript.match(/\b(um|uh|like|you know|kind of|sort of)\b/gi) || []).length;
const fillerRatio = fillerCount / words.length;
const speedScore = (wpm >= 70 && wpm <= 150) ? 100 : Math.max(0, 100 - Math.abs(wpm - 110));
const fillerScore = Math.max(0, 100 - fillerRatio * 250);
return Math.round(speedScore * 0.6 + fillerScore * 0.4);
}
function rangeScore(transcript) {
const words = transcript.toLowerCase().split(/\s+/).filter(Boolean);
if (words.length === 0) return 0;
const uniqueWords = new Set(words).size;
return Math.round(Math.min((uniqueWords / words.length) * 150, 100));
}
function coherenceScore(transcript) {
const words = transcript.split(/\s+/).filter(Boolean);
if (words.length === 0) return 0;
const connectors = (transcript.match(/\b(because|so|then|but|also|after|before|therefore|however)\b/gi) || []).length;
const expected = Math.max(words.length / 15, 1);
return Math.round(Math.min((connectors / expected) * 100, 100));
}

function answerContentScore(transcript) {
const normalized = transcript.toLowerCase();
const words = normalized.split(/\s+/).filter(Boolean);
if (words.length === 0) return 0;
const detailWords = new Set(words).size;
const lengthScore = Math.min(words.length * 4, 60);
const detailScore = Math.min((detailWords / words.length) * 40, 30);
const relevantWords = ['morning', 'afternoon', 'evening', 'school', 'work', 'home', 'family', 'friend', 'breakfast', 'lunch', 'dinner', 'study', 'play', 'day', 'weekend'];
const relevanceScore = Math.min(relevantWords.filter(word => normalized.includes(word)).length * 5, 30);
return Math.round(Math.min(lengthScore + detailScore + relevanceScore, 100));
}

function cefrLevel(score) {
if (score < 25) return 'A1';
if (score < 45) return 'A2';
if (score < 65) return 'B1';
if (score < 80) return 'B2';
if (score < 93) return 'C1';
return 'C2';
}

function buildFeedback(scores) {
const tips = [];
if (scores.accuracy < 60) tips.push('Read a little slower and sound out each word — accuracy improves before speed does.');
if (scores.fluency < 60) tips.push('Practice speaking in short phrases without long pauses; try recording yourself daily for a minute.');
if (scores.range < 60) tips.push('Try using synonyms instead of repeating the same words (e.g. "happy" → "glad", "great").');
if (scores.coherence < 60) tips.push('Link your ideas with words like "because", "so", and "after" to help your answer flow.');
if (scores.content < 60) tips.push('Add two or three specific details about your day, such as when you do something, where you go, or who you are with.');
if (tips.length === 0) tips.push('Strong, well-rounded performance — keep practicing longer, more detailed answers.');
return tips;
}

function wordCount(transcript) {
return transcript.trim().split(/\s+/).filter(Boolean).length;
}

function buildAudioStyle(transcript, durationSec) {
const words = wordCount(transcript);
const minutes = Math.max(durationSec / 60, 1 / 60);
const wpm = Math.round(words / minutes);
const fillers = (transcript.match(/\b(um|uh|like|you know|kind of|sort of)\b/gi) || []).length;
const pace = words === 0 ? 'No speech detected' : wpm < 70 ? 'Gentle and thoughtful' : wpm > 150 ? 'Fast and energetic' : 'Steady and clear';
const clarity = words === 0 ? 'Try speaking closer to the mic' : fillers > Math.max(2, words / 12) ? 'Some hesitation words' : 'Strong, clean delivery';
const energy = words === 0 ? 'Record a short answer to begin' : durationSec < 5 ? 'Short recording' : wpm > 120 ? 'Bright and energetic' : 'Calm and focused';
const flow = words === 0 ? 'No transcript yet' : fillers === 0 ? 'Smooth flow' : `${fillers} filler word${fillers === 1 ? '' : 's'}`;
return { pace, clarity, energy, flow, wpm, words };
}

function showResults() {
const passageText = document.getElementById('passage-text').textContent;
const passageTranscript = passageResult.transcriptFileText || passageResult.transcript;
const answerTranscript = questionResult.transcriptFileText || questionResult.transcript;
const accuracy = accuracyScore(passageText, passageTranscript);
const fluency = fluencyScore(answerTranscript, questionResult.duration);
const range = rangeScore(answerTranscript);
const coherence = coherenceScore(answerTranscript);
const content = answerContentScore(answerTranscript);
const overall = Math.round(accuracy * 0.2 + fluency * 0.2 + range * 0.15 + coherence * 0.15 + content * 0.3);
const audioStyle = buildAudioStyle(answerTranscript, questionResult.duration);

document.getElementById('overall-num').textContent = overall;
document.getElementById('cefr-badge').textContent = 'CEFR level: ' + cefrLevel(overall);
document.getElementById('answer-quote').textContent = answerTranscript.trim() || 'No words were recognized. The score is based on the recording length only until a transcript is available.';
document.getElementById('audio-style').innerHTML = `
    <div class="style-card"><strong>🎚️ Pace</strong><span>${audioStyle.pace}<br>${audioStyle.wpm} words/min</span></div>
    <div class="style-card"><strong>✨ Clarity</strong><span>${audioStyle.clarity}<br>${audioStyle.words} words heard</span></div>
    <div class="style-card"><strong>⚡ Energy</strong><span>${audioStyle.energy}<br>${Math.round(questionResult.duration)} sec audio</span></div>
    <div class="style-card"><strong>🌊 Flow</strong><span>${audioStyle.flow}<br>Keep connecting ideas</span></div>
`;

const criteria = [
    { name: 'Reading Accuracy', val: accuracy, note: 'How closely your reading matched the original passage.' },
    { name: 'Fluency', val: fluency, note: 'Speaking pace and how few hesitations you had.' },
    { name: 'Vocabulary Range', val: range, note: 'Variety of different words used.' },
    { name: 'Coherence', val: coherence, note: 'Use of connecting words to link your ideas.' },
    { name: 'Answer Content', val: content, note: 'Specific details and relevant ideas in your answer.' },
];

const list = document.getElementById('criteria-list');
list.innerHTML = '';
criteria.forEach(c => {
    const div = document.createElement('div');
    div.className = 'criterion';
    div.innerHTML = `
    <div class="top"><span class="name">${c.name}</span><span class="val">${c.val}/100</span></div>
    <div class="bar"><span style="width:${c.val}%"></span></div>
    <div class="note">${c.note}</div>
    `;
    list.appendChild(div);
});

const tips = buildFeedback({ accuracy, fluency, range, coherence, content });
const adaptiveNote = overall >= 70
    ? 'Since you scored well, your next test will be adaptive and include more challenging passages and questions.'
    : overall < 40
    ? 'Your next test will be adaptive and adjust to an easier level to build your confidence.'
    : 'Your next test will be adaptive, adjusting slightly based on this result.';

document.getElementById('feedback-box').innerHTML = `
    <h3>Thoughts on your audio</h3>
    <ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>
    <div class="adaptive-note">${adaptiveNote} Audio style is estimated from your recording length and live transcript.</div>
`;
}

goTo('intro');
