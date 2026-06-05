// Load voices reliably (Chrome needs this)
function loadVoices() {
    return new Promise(resolve => {
        const voices = speechSynthesis.getVoices();
        if (voices.length) return resolve(voices);

        speechSynthesis.onvoiceschanged = () => {
            resolve(speechSynthesis.getVoices());
        };
    });
}

// Simple multilingual speak() function
async function speak(text: string, lang = "en-US", repetitions = 1) {
    repetitions = Math.max(1, repetitions);
    const voices = await loadVoices() as SpeechSynthesisVoice[];

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;

    // Best matching voice for the language
    const match = voices.find(v => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
    if (match) utter.voice = match;
    
    speechSynthesis.cancel(); // stop previous speech
    for (let i = 0; i < repetitions; i++) {
        console.log("speaking", text, "voice", match, "lang", lang);
        speechSynthesis.speak(utter);
    }
}



