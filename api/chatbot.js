export default async function handler(req, res) {
    // 1. These headers tell the browser "It is okay to talk to this website"
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 2. Handle the "Pre-flight" check (the browser's secret handshake)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userMessage = req.body.message;
        const systemPrompt = "You are the official AI assistant for Las Piñas National High School - Main. You are helpful and friendly.";

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROK_API_KEY}` 
            },
            body: JSON.stringify({
                model: "grok-beta", 
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();
        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ reply: "Connection error with Grok AI." });
    }
}