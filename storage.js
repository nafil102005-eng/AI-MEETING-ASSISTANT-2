// js/storage.js
const STORAGE_KEY = 'meetai_history';

const Storage = {
    getAllMeetings: function() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error parsing storage data", e);
            return [];
        }
    },

    saveMeeting: function(meetingData) {
        const meetings = this.getAllMeetings();
        // Add ID if not exists
        if (!meetingData.id) {
            meetingData.id = 'mtg_' + Date.now();
        }
        
        // check if updating existing
        const index = meetings.findIndex(m => m.id === meetingData.id);
        if (index >= 0) {
            meetings[index] = meetingData;
        } else {
            meetings.unshift(meetingData); // Add to beginning
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
        return meetingData;
    },

    getMeeting: function(id) {
        const meetings = this.getAllMeetings();
        return meetings.find(m => m.id === id);
    },

    deleteMeeting: function(id) {
        let meetings = this.getAllMeetings();
        meetings = meetings.filter(m => m.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
    },
    
    // API Key storage
    getApiKey: function() {
        return localStorage.getItem('gemini_api_key') || '';
    },
    
    saveApiKey: function(key) {
        localStorage.setItem('gemini_api_key', key);
    }
};

window.Storage = Storage;
