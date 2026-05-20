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
async function speak(text, lang = "en-US") {
    const voices = await loadVoices();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;

    // Best matching voice for the language
    const match = voices.find(v => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
    if (match) utter.voice = match;

    speechSynthesis.cancel(); // stop previous speech
    speechSynthesis.speak(utter);
}

// Attach a click handler that speaks the given text
function attach(id, textToSpeak) {
    const el = document.getElementById(id);
    if (!el) return console.warn("Element not found:", id);

    el.addEventListener("click", () => speak(textToSpeak));
}

