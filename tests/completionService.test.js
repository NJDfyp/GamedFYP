// services/completionService.test.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadCompletions, getWeekKey, saveCompletion, saveWeeklyCompletion, getWeeklyCompletion } from '../services/completionService';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Define a helper function in the test that mimics getCompletionByDate
const getCompletionByDate = async (date) => {
  const all = await loadCompletions();
  return all[date] || [];
};

describe('Completion Service', () => {
  test('getCompletionByDate returns stored completions', async () => {
    const mockData = { "2025-03-22": ["Task A", "Task B"] };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockData));
    const completions = await getCompletionByDate("2025-03-22");
    expect(completions).toEqual(["Task A", "Task B"]);
  });

  test('getWeekKey returns correct format', () => {
    const dateStr = "2025-03-22";
    const weekKey = getWeekKey(dateStr);
    expect(weekKey).toMatch(/^2025-W\d+$/);
  });

  test('saveCompletion saves data correctly', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    await saveCompletion("2025-03-22", ["Task A"]);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'gaming_completions',
      JSON.stringify({ "2025-03-22": ["Task A"] })
    );
  });

  test('saveWeeklyCompletion and getWeeklyCompletion work together', async () => {
    // Assume the week key for "2025-03-22" is "2025-W12"
    AsyncStorage.getItem.mockResolvedValue(null);
    await saveWeeklyCompletion("2025-03-22", ["Weekly Task A"]);
    // Now simulate stored weekly completions
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ "2025-W12": ["Weekly Task A"] }));
    const weeklySet = await getWeeklyCompletion("2025-03-22");
    expect(weeklySet.has("Weekly Task A")).toBe(true);
  });
});
