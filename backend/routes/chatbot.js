const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat endpoint
router.post('/ask', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    console.log('🤖 Chatbot request:', message);

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // ✅ FIXED: Use Gemini 2.5 Flash (current stable model)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build conversation context
    let prompt = `You are an AI learning assistant for students. Answer questions about programming, data structures, algorithms, web development, databases, and computer science topics. Be helpful, clear, and educational.\n\n`;

    // Add conversation history for context
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg) => {
        prompt += `${msg.sender === 'user' ? 'Student' : 'AI'}: ${msg.message}\n`;
      });
    }

    // Add current question
    prompt += `Student: ${message}\nAI:`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const botMessage = response.text();

    console.log('✅ Chatbot response:', botMessage.substring(0, 50) + '...');

    res.json({
      message: botMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chatbot error:', error.message);
    
    // Better error handling
    if (error.message.includes('API_KEY_INVALID')) {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your GEMINI_API_KEY in .env file',
        details: error.message 
      });
    }
    
    if (error.message.includes('PERMISSION_DENIED')) {
      return res.status(403).json({ 
        error: 'API key does not have permission to access this model',
        details: 'Try generating a new API key at https://aistudio.google.com/app/apikey'
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// Get suggested questions
router.get('/suggestions', (req, res) => {
  const suggestions = [
    "What is the time complexity of quicksort?",
    "Explain the difference between stack and queue",
    "How does dynamic programming work?",
    "What are the SOLID principles?",
    "Explain binary search trees",
    "What is RESTful API?",
    "Difference between SQL and NoSQL",
    "How does React useState work?"
  ];

  res.json({ suggestions });
});

module.exports = router;
