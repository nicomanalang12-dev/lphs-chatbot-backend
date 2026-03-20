import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. CORS Headers: Essential for GitHub Pages to talk to Vercel
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 2. Handle the Browser's "Pre-flight" Handshake
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userMessage = req.body.message;
        
        // 3. The Grok 4.1 API Call
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROK_API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-4-1-fast", // Using the model you discovered!
                messages: [
                    { 
                        role: "system", 
                        content: "You are the official AI assistant for Las Piñas National High School - Main. You are friendly, helpful, and knowledgeable about enrollment, STEM/TVL strands, and the campus near the Bamboo Organ Church. Keep answers concise for a chat interface." 
                    },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        // 4. Detailed Error Reporting
        if (!response.ok) {
            console.error("Grok API Error:", data);
            return res.status(response.status).json({ 
                reply: `Grok Error (${response.status}): ${data.error ? data.error.message : 'Unknown Error'}. Please check your x.ai dashboard balance.` 
            });
        }

        // 5. Send the successful response back to the frontend
        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("Server Crash:", error);
        res.status(500).json({ reply: "The server hit a snag: " + error.message });
    }
}