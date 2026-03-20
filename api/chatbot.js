export default async function handler(req, res) {
    // These lines allow your frontend to communicate with this backend without getting blocked
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Quick response for pre-flight checks
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userMessage = req.body.message;

        // This is the System Instruction your professor mentioned!
        const systemPrompt = "You are the official AI assistant for Las Piñas National High School - Main, located near the historic Bamboo Organ Church. You are helpful, friendly, and knowledgeable about the campus, particularly the STEM strand.";

        // Sending the message securely to Grok's API
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // This grabs the secret key we will put into Vercel later
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
        
        // Sending Grok's reply back to your frontend website
        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Sorry, I'm having trouble connecting to the principal's office right now. Please try again!" });
    }
}