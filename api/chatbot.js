import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. CORS Headers: The "Handshake" between GitHub and Vercel
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const userMessage = req.body.message;
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            return res.status(500).json({ reply: "Error: GROQ_API_KEY is missing in Vercel settings." });
        }

        // 2. The Groq API Call
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { 
                        role: "system", 
                        content: "You are the official AI assistant for Las Piñas National High School - Main. You are friendly, helpful, and specifically knowledgeable about the school located near the Bamboo Organ. Answer student queries about enrollment and strands clearly and concisely." 
                    },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ reply: "Groq Error: " + data.error.message });
        }

        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ reply: "Server error: " + error.message });
    }
}