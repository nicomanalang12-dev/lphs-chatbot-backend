import fetch from 'node-fetch';

export default async function handler(req, res) {
    // CORS Headers: The "Handshake" between your GitHub site and Vercel
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
                        content: `You are the official AI assistant for Las Piñas National High School - Main (LPNHS-Main). 
                        
                        LOCATION: Alabang-Zapote Road, Las Piñas City, near the Bamboo Organ.

                        OFFICIAL ALMA MATER SONG (LPNHS HYMN):
                        When asked for the lyrics, provide exactly this:
                        "LOYAL SCHOOLMATES COME TOGETHER
                        BE GLAD AND LET US SING
                        GIVE PRAISE TO ALMA MATER
                        AND LET HER GLORIOUS RING

                        LET OUR DUTIES NOBLE AND LOVING
                        TO HER BRING HONOR HIGH
                        FOR HER OUR SCHOOL INSPIRING
                        OUR LOVE SHALL NEVER DIE

                        LONG LIVE ALMA MATER’S GLORY
                        WHOSE SPIRIT SHALL GUIDE US EVER
                        WE’LL LABOR WITH FAITH AND NOBLY
                        IN DEDICATION TO HER (Repeat)

                        LONG LIVE
                        LONG LIFE
                        LAS PIÑAS HIGH"

                        OFFICIAL STRANDS:
                        - STEM, ABM, HUMSS, GAS, TVL, Sports, and Arts & Design.

                        INSTRUCTIONS:
                        - Be friendly and professional.
                        - If you don't know something about a specific student's record, tell them to visit the Student Support desk in the Main Building.` 
                    },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();
        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ reply: "Server error: " + error.message });
    }
}