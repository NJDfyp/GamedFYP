import axios from 'axios';
import { fetchGamingNews } from './newsService';

const API_KEY = 'Put Key in report.';
const API_URL = 'https://api.openai.com/v1/chat/completions';

const fetchGamingNewsChatbotResponse = async (userMessage) => {
  try {
    const news = await fetchGamingNews();
    const formattedNews = news.length > 0
      ? news.slice(0, 3)
            .map(n => `- ${n.title} (Source: ${n.source})\nRead more: ${n.url}`)
            .join("\n\n")
      : "No recent gaming news found.";
    
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are an AI assistant that provides gaming news." },
          { role: "user", content: userMessage },
          { role: "system", content: `Here are the latest gaming news:\n\n${formattedNews}` }
        ],
        max_tokens: 250
      },
      { 
        headers: { 
          "Authorization": `Bearer ${API_KEY}`, 
          "Content-Type": "application/json" 
        } 
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Chatbot API Error:", error);
    return "Sorry, I couldn't fetch gaming news right now.";
  }
};

export default fetchGamingNewsChatbotResponse;
