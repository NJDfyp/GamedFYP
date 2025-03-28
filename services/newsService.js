import axios from 'axios';

export const fetchGamingNews = async () => {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'gaming',
        language: 'en',
        sortBy: 'publishedAt',
        apiKey: '5d6a299908514e6eae7cc844dac2a7f7',
      },// key should be put in .env but just for convenience since its a submission
    });
    return response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source.name,
    }));
  } catch (error) {
    // Only log errors if not in the test environment
    if (process.env.NODE_ENV !== 'test') {
      console.error("Error fetching gaming news:", error);
    }
    return [];
  }
};
