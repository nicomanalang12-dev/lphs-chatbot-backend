import fetch from 'node-fetch';

export default async function handler(req, res) {
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
        
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROK_API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-2-latest", // Updated to the most stable model name
                messages: [
                    { role: "system", content: "You are the official AI assistant for Las Piñas National High School - Main." },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();

        // If Grok sends an error, this will now show us the FULL details
        if (!response.ok) {
            return res.status(500).json({ 
                reply: `Grok Error (${response.status}): ${data.error ? JSON.stringify(data.error) : 'Unknown Error'}` 
            });
        }

        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ reply: "Server error: " + error.message });
    }
}