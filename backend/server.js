// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = 3000;

app.use(cors()); // Allow cross-origin requests
app.use(express.json({ limit: '50mb' })); // To handle large base64 image strings

// Initialize the client
const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
});

app.post('/generate-content', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'No image data provided.' });
        }

        // Convert base64 to buffer
        const imageBytes = Buffer.from(image, 'base64');

        // Use the correct syntax for @google/genai
        const response = await genAI.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                {
                    parts: [
                        {
                            text: "You are a master palmist with decades of experience reading palms from images of all qualities. Analyze this palm image and provide definitive palmistry insights based on ancient palmistry principles.REQUIRED OUTPUT:1. Life Line Analysis: Analyze length, depth, and curvature - predict health, vitality, and life span2. Head Line Analysis: Assess intelligence, creativity, and decision-making abilities3. Heart Line Analysis: Determine emotional nature, love capacity, and relationship patterns4. Marriage Line(s): Provide specific details about:   - Number of significant relationships   - Age of marriage/partnerships   - Quality and duration of relationships   - Compatibility with partners5. Fate Line: Career path, success patterns, and life direction6.PREDICTION STYLE:- Use confident, declarative statements (You will... ,Your nature is...)- Draw from traditional palmistry interpretations- Provide specific timeframes when possible (ages, years)- Include both positive traits and challenges- Give actionable insights about relationships, career, and health.IMPORTANT: Work with whatever palm features you can observe. Every palm tells a story - extract maximum insight from all visible lines, mounts, and hand characteristics -give only 3 important points from each lines. Provide a complete reading regardless of image clarity. Focus on delivering valuable, specific predictions that follow traditional palmistry wisdom.Begin your reading immediately without any disclaimers about image quality.Do not make up content apart from traditional palmistry techniques."
                        },
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: image
                            }
                        }
                    ]
                }
            ]
        });

        const text = response.candidates[0].content.parts[0].text;
        res.json({ content: text });

    } catch (error) {
        console.error('Error Predicting Future:', error);
        res.status(500).json({ 
            error: 'You Have no Future Bewareeee!!!.',
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});