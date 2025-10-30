const express = require('express');
const router = express.Router();

const chatbotResponses = {
  greeting: {
    message: "Hello! I'm here to help you with college complaints. How can I assist you today?",
    options: ["File a complaint", "Check complaint status", "General guidance"]
  },
  'file-complaint': {
    message: "To file a complaint, please go to the Dashboard and click 'File New Complaint'. You'll need to provide: Category, Title, Description, and optionally upload proof images.",
    options: ["Complaint categories", "File now", "Back"]
  },
  'check-status': {
    message: "You can check your complaint status in the Dashboard under 'My Complaints'. Each complaint shows its current status: Pending, In Progress, or Resolved.",
    options: ["View dashboard", "Back"]
  },
  categories: {
    message: "We handle these complaint categories: Hostel Issues, Mess/Food, Academic Problems, Administrative, College Infrastructure, and Others.",
    options: ["Hostel issues", "Academic problems", "Back"]
  },
  default: {
    message: "I'm here to help with college complaints. You can file new complaints, check status, or get guidance. What would you like to do?",
    options: ["File complaint", "Check status", "Get help"]
  }
};

router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMessage = message.toLowerCase();

    let response;

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = chatbotResponses.greeting;
    } else if (lowerMessage.includes('file') || lowerMessage.includes('complaint')) {
      response = chatbotResponses['file-complaint'];
    } else if (lowerMessage.includes('status') || lowerMessage.includes('check')) {
      response = chatbotResponses['check-status'];
    } else if (lowerMessage.includes('category') || lowerMessage.includes('type')) {
      response = chatbotResponses.categories;
    } else {
      response = chatbotResponses.default;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Chatbot error', error: error.message });
  }
});

module.exports = router;