import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. CORS Headers to allow your GitHub Pages site to talk to Vercel
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userMessage = req.body.message;
        
        // 2. The Grok API Call
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROK_API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-beta", 
                messages: [
                    { role: "system", content: "You are the official AI assistant for Las Piñas National High School - Main. You are helpful and friendly." },
                    { role: "user", content: userMessage }
                ]
            }) // Correctly closed the JSON.stringify
        }); // Correctly closed the fetch call

        const data = await response.json();

        // 3. Error Handling
        if (!response.ok) {
            return res.status(response.status).json({ 
                reply: `Grok Error (${response.status}): ${data.error ? JSON.stringify(data.error) : 'Check your x.ai credits/billing'}` 
            });
        }

        // 4. Send the successful reply
        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ reply: "Server error: " + error.message });
    }
}