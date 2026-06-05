// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const btnRecord = document.getElementById('btnRecord');
    const recordText = document.getElementById('recordText');
    const micStatus = document.getElementById('micStatus');
    const transcriptContent = document.getElementById('transcriptContent');
    const aiProcessing = document.getElementById('aiProcessing');
    const resultsContainer = document.getElementById('resultsContainer');
    
    const summaryContent = document.getElementById('summaryContent');
    const pointsContent = document.getElementById('pointsContent');
    const actionsContent = document.getElementById('actionsContent');
    const decisionsContent = document.getElementById('decisionsContent');

    const btnNewMeeting = document.getElementById('btnNewMeeting');
    const meetingTitle = document.getElementById('meetingTitle');
    const btnExportPdf = document.getElementById('btnExportPdf');
    
    const historyList = document.getElementById('historyList');
    
    const btnSettings = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const apiKeyInput = document.getElementById('apiKey');

    // --- State ---
    let currentMeetingId = null;
    const recorder = new window.SpeechRecorder();

    // --- Initialization ---
    initSettings();
    renderHistory();
    resetDashboard();

    // --- Recorder Callbacks ---
    recorder.onStart = () => {
        btnRecord.classList.add('recording');
        recordText.innerText = 'Stop Recording';
        micStatus.innerHTML = '<i class="fa-solid fa-circle-dot"></i> Recording...';
        micStatus.classList.add('recording');
        if (transcriptContent.querySelector('.placeholder-text')) {
            transcriptContent.innerHTML = '';
        }
        resultsContainer.classList.add('hidden');
        btnExportPdf.classList.add('hidden');
    };

    recorder.onResult = (interim, final) => {
        // Build the display
        let html = '';
        if (final) {
            html += `<span>${final}</span>`;
        }
        if (interim) {
            html += `<span style="color: var(--text-muted); font-style: italic;"> ${interim}</span>`;
        }
        transcriptContent.innerHTML = html;
        // Auto-scroll to bottom
        transcriptContent.parentElement.scrollTop = transcriptContent.parentElement.scrollHeight;
    };

    recorder.onEnd = async (finalTranscript) => {
        btnRecord.classList.remove('recording');
        recordText.innerText = 'Start Recording';
        micStatus.innerHTML = 'Ready to record';
        micStatus.classList.remove('recording');

        if (!finalTranscript || finalTranscript.trim() === '') {
            alert('No speech detected.');
            return;
        }

        // Processing with Gemini
        aiProcessing.classList.remove('hidden');
        try {
            const aiResults = await window.GeminiAPI.processTranscript(finalTranscript);
            displayResults(aiResults);
            saveCurrentMeeting(finalTranscript, aiResults);
        } catch (error) {
            alert(error.message);
        } finally {
            aiProcessing.classList.add('hidden');
        }
    };

    recorder.onError = (err) => {
        btnRecord.classList.remove('recording');
        recordText.innerText = 'Start Recording';
        micStatus.innerHTML = 'Ready to record';
        micStatus.classList.remove('recording');
        if (err !== 'no-speech') {
            alert("Speech recognition error: " + err);
        }
    };

    // --- Event Listeners ---
    btnRecord.addEventListener('click', () => {
        // Check API key first
        if (!window.Storage.getApiKey()) {
            openSettings();
            alert("Please enter your Gemini API Key first.");
            return;
        }

        if (recorder.isRecording) {
            recorder.stop();
        } else {
            recorder.start();
        }
    });

    btnNewMeeting.addEventListener('click', () => {
        if (recorder.isRecording) {
            recorder.stop();
        }
        resetDashboard();
    });

    btnExportPdf.addEventListener('click', () => {
        window.PDFExport.exportCurrentMeeting();
    });

    // --- Settings Modal ---
    function initSettings() {
        apiKeyInput.value = window.Storage.getApiKey();
    }

    function openSettings() {
        settingsModal.classList.remove('hidden');
    }

    function closeSettings() {
        settingsModal.classList.add('hidden');
    }

    btnSettings.addEventListener('click', openSettings);
    btnCloseSettings.addEventListener('click', closeSettings);
    btnSaveSettings.addEventListener('click', () => {
        window.Storage.saveApiKey(apiKeyInput.value.trim());
        closeSettings();
    });

    // --- UI Helpers ---
    function resetDashboard() {
        currentMeetingId = null;
        meetingTitle.innerText = 'Meeting ' + new Date().toLocaleDateString();
        transcriptContent.innerHTML = '<p class="placeholder-text">Click "Start Recording" and begin speaking. Your transcript will appear here...</p>';
        resultsContainer.classList.add('hidden');
        btnExportPdf.classList.add('hidden');
        
        // Remove active class from history
        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
    }

    function displayResults(aiResults) {
        resultsContainer.classList.remove('hidden');
        btnExportPdf.classList.remove('hidden');

        summaryContent.innerHTML = `<p>${aiResults.summary || 'No summary available.'}</p>`;
        
        const renderList = (items) => {
            if (!items || items.length === 0) return '<p>None.</p>';
            return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
        };

        pointsContent.innerHTML = renderList(aiResults.points);
        actionsContent.innerHTML = renderList(aiResults.actions);
        decisionsContent.innerHTML = renderList(aiResults.decisions);
    }

    function saveCurrentMeeting(transcript, aiResults) {
        const title = meetingTitle.innerText;
        const meetingData = {
            id: currentMeetingId,
            title: title,
            date: new Date().toISOString(),
            transcript: transcript,
            results: aiResults
        };

        const saved = window.Storage.saveMeeting(meetingData);
        currentMeetingId = saved.id; // Update in case it's new
        renderHistory();
    }

    function renderHistory() {
        const meetings = window.Storage.getAllMeetings();
        historyList.innerHTML = '';

        if (meetings.length === 0) {
            historyList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No past meetings.</p>';
            return;
        }

        meetings.forEach(m => {
            const li = document.createElement('li');
            li.className = 'history-item';
            if (m.id === currentMeetingId) {
                li.classList.add('active');
            }

            const titleDiv = document.createElement('div');
            titleDiv.className = 'history-item-title';
            titleDiv.innerText = m.title;

            const dateDiv = document.createElement('div');
            dateDiv.className = 'history-item-date';
            dateDiv.innerText = new Date(m.date).toLocaleString();

            li.appendChild(titleDiv);
            li.appendChild(dateDiv);

            li.addEventListener('click', () => loadMeeting(m.id));
            historyList.appendChild(li);
        });
    }

    function loadMeeting(id) {
        if (recorder.isRecording) return; // Prevent loading while recording

        const m = window.Storage.getMeeting(id);
        if (!m) return;

        currentMeetingId = m.id;
        meetingTitle.innerText = m.title;
        
        // Render transcript
        transcriptContent.innerHTML = `<span>${m.transcript}</span>`;
        
        // Render AI Results
        if (m.results) {
            displayResults(m.results);
        } else {
            resultsContainer.classList.add('hidden');
        }

        renderHistory(); // Update active state
    }
});
