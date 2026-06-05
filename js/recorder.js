// js/recorder.js

class SpeechRecorder {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.finalTranscript = '';
        
        this.onStart = null;
        this.onResult = null; // passes (interimTranscript, finalTranscript)
        this.onEnd = null;
        this.onError = null;

        this.init();
    }

    init() {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!window.SpeechRecognition) {
            console.error("Speech Recognition API is not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isRecording = true;
            if (this.onStart) this.onStart();
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    this.finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            if (this.onResult) {
                this.onResult(interimTranscript, this.finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (this.onError) this.onError(event.error);
        };

        this.recognition.onend = () => {
            // Check if we manually stopped it or if it disconnected automatically
            if (this.isRecording) {
                // If it's still supposed to be recording but ended, restart it (hack for long periods)
                try {
                    this.recognition.start();
                } catch(e) {
                    // Do nothing
                }
            } else {
                if (this.onEnd) this.onEnd(this.finalTranscript);
            }
        };
    }

    start() {
        if (!this.recognition) return;
        this.finalTranscript = '';
        this.isRecording = true;
        try {
            this.recognition.start();
        } catch (e) {
            console.error(e);
        }
    }

    stop() {
        if (!this.recognition) return;
        this.isRecording = false;
        this.recognition.stop();
    }
    
    getTranscript() {
        return this.finalTranscript;
    }
}

window.SpeechRecorder = SpeechRecorder;
