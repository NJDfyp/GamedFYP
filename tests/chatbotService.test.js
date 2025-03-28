
import axios from 'axios';
import fetchGamingNewsChatbotResponse from '../services/chatbotService';

import { fetchGamingNews } from '../services/newsService';

jest.mock('axios');
jest.mock('../services/newsService');

describe('Chatbot Service', () => {
  test('returns formatted response when news is available', async () => {
    const mockTweets = [
      { title: 'Game Update 1', source: 'Source A', url: 'http://example.com/a' },
      { title: 'Game Update 2', source: 'Source B', url: 'http://example.com/b' }
    ];
    fetchGamingNews.mockResolvedValue(mockTweets);
    axios.post.mockResolvedValue({
      data: { choices: [{ message: { content: "ChatGPT Response" } }] }
    });
    
    const response = await fetchGamingNewsChatbotResponse("What's new?");
    expect(response).toBe("ChatGPT Response");
  });

  test('falls back to ChatGPT if news fetch fails', async () => {
    fetchGamingNews.mockResolvedValue([]);
    axios.post.mockResolvedValue({
      data: { choices: [{ message: { content: "Fallback Response" } }] }
    });
    
    const response = await fetchGamingNewsChatbotResponse("Tell me something");
    expect(response).toBe("Fallback Response");
  });
});
