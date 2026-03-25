import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. CORS Headers: Essential for the "handshake" between your site and Vercel
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

        // 2. The Groq API Call with Official School Knowledge
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
                        
                        LOCATION: Alabang-Zapote Road, Las Piñas City, Metro Manila, near the Bamboo Organ (St. Joseph Parish).
                        
                        OFFICIAL STRANDS OFFERED:
                        1. STEM (Science, Technology, Engineering, and Mathematics)
                        2. ABM (Accountancy, Business, and Management)
                        3. HUMSS (Humanities and Social Sciences)
                        4. GAS (General Academic Strand)
                        5. TVL (Technical-Vocational-Livelihood) - Includes ICT, Home Economics, etc.
                        6. Arts and Design Track
                        7. Sports Track
                        
                        ALMA MATER SONG / HYMN:
                        The official hymn is 'Las Piñas National High School Hymn.' If a student asks for lyrics, provide the official Tagalog version: 
                        'Las Piñas National High School, Mahal naming paaralan...' 
                        (Note: Ensure you only provide official verified lyrics).

                        INSTRUCTIONS:
                        - Be friendly, encouraging, and professional.
                        - Use Taglish (Tagalog-English) if the student speaks in Tagalog to be more relatable.
                        - For enrollment inquiries, advise them to visit the Main Building Student Support desk.` 
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