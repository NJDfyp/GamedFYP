
import axios from 'axios';
import { fetchGamingNews } from '../services/newsService';

jest.mock('axios');

describe('fetchGamingNews', () => {
  it('should return mapped articles when API call succeeds', async () => {
    // Arrange: create a mock API response
    const articles = [
      {
        title: 'Article 1',
        description: 'Description 1',
        url: 'http://example.com/1',
        source: { name: 'Source 1' },
      },
      {
        title: 'Article 2',
        description: 'Description 2',
        url: 'http://example.com/2',
        source: { name: 'Source 2' },
      },
    ];
    axios.get.mockResolvedValue({
      data: { articles },
    });

    // Act: call the function
    const result = await fetchGamingNews();

    // Assert: check that the articles are mapped correctly
    const expected = [
      {
        title: 'Article 1',
        description: 'Description 1',
        url: 'http://example.com/1',
        source: 'Source 1',
      },
      {
        title: 'Article 2',
        description: 'Description 2',
        url: 'http://example.com/2',
        source: 'Source 2',
      },
    ];
    expect(result).toEqual(expected);
  });

  it('should return an empty array when API call fails', async () => {
    // Arrange: simulate a failure
    axios.get.mockRejectedValue(new Error("Network error"));

    // Act: call the function
    const result = await fetchGamingNews();

    // Assert: should return an empty array
    expect(result).toEqual([]);
  });
});
