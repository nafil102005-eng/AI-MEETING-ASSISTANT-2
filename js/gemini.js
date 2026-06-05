// js/gemini.js

const GeminiAPI = {
    async processTranscript(transcript) {
        const apiKey = window.Storage.getApiKey();
        if (!apiKey) {
            throw new Error("API Key not found. Please add your Gemini API Key in Settings.");
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const prompt = `
You are an expert AI Meeting Assistant. Analyze the following meeting transcript and extract the key information.
Please return ONLY a valid JSON object with the following structure, and no markdown formatting or extra text outside the JSON:

{
  "summary": "A concise paragraph summarizing the meeting.",
  "points": ["Key discussion point 1", "Key discussion point 2"],
  "actions": ["Action item 1", "Action item 2"],
  "decisions": ["Important decision 1"]
}

Transcript:
"""
${transcript}
"""
`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Error calling Gemini API");
            }

            const data = await response.json();
            let textResponse = data.candidates[0].content.parts[0].text;
            
            // Clean up potential markdown formatting (e.g., ```json ... ```)
            textResponse = textResponse.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
            
            // Try parsing the JSON
            const result = JSON.parse(textResponse);
            return result;
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw error;
        }
    }
};

window.GeminiAPI = GeminiAPI;
