const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
let chatHistory = [];


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        
        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 200,
            },
        });

        
        const result = await chat.sendMessage(message);
        const response = result.response;

        


        res.json({
            success: true,
            response: response.text()
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});


router.post('/chat-with-history', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ success: false, error: "Missing sessionId" });
        }

        
        if (!chatHistories[sessionId]) {
            chatHistories[sessionId] = [];
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
            history: chatHistories[sessionId],
            generationConfig: {
                maxOutputTokens: 200,
            },
        });

        const result = await chat.sendMessage(message);
        const response = result.response;

        
        chatHistories[sessionId].push({ role: "user", parts: message });
        chatHistories[sessionId].push({ role: "model", parts: response.text() });

        res.json({
            success: true,
            response: response.text(),
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message,
        });
    }
});


router.post('/history', async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ success: false, error: "Missing sessionId" });
        }

        const history = chatHistories[sessionId] || [];
        
        
        const formattedHistory = history.map(item => ({
            type: item.role === "user" ? "user" : "bot",
            content: item.parts,
        }));

        res.json({ success: true, history: formattedHistory });

    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message,
        });
    }
});

module.exports = router;
