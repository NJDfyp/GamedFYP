import AsyncStorage from '@react-native-async-storage/async-storage';

// Load daily/onetime completions stored under "gaming_completions"
export const loadCompletions = async () => {
  try {
    const data = await AsyncStorage.getItem('gaming_completions');
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error('Error loading completions:', err);
    return {};
  }
};

// Save daily/onetime completions under "gaming_completions"
export const saveCompletion = async (date, completedTasks) => {
  try {
    const key = 'gaming_completions';
    const raw = await AsyncStorage.getItem(key);
    const all = raw ? JSON.parse(raw) : {};
    // Save or overwrite completions for a specific date
    all[date] = completedTasks;
    await AsyncStorage.setItem(key, JSON.stringify(all));
  } catch (err) {
    console.error('Error saving completion:', err);
  }
};
export const getCompletionByDate = async (date) => {
  try {
    const key = 'gaming_completions';
    const raw = await AsyncStorage.getItem(key);
    const all = raw ? JSON.parse(raw) : {};
    return all[date] || [];
  } catch (err) {
    console.error('Error getting completion for date:', err);
    return [];
  }
};
// Helper: Generate a week key from a date string (format: "YYYY-W{weekNumber}")
export const getWeekKey = (dateStr) => {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const diffDays = Math.floor((d - jan1) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((diffDays + jan1.getDay() + 1) / 7);
  return `${year}-W${weekNum}`;
};

// Save weekly completions under "weekly_completions" using the week key
export const saveWeeklyCompletion = async (date, completedWeeklyTasks) => {
  try {
    const weekKey = getWeekKey(date);
    const key = 'weekly_completions';
    const raw = await AsyncStorage.getItem(key);
    const all = raw ? JSON.parse(raw) : {};
    // Save or overwrite weekly completions for the given week
    all[weekKey] = completedWeeklyTasks;
    await AsyncStorage.setItem(key, JSON.stringify(all));
  } catch (err) {
    console.error('Error saving weekly completion:', err);
  }
};

// Load weekly completions for a given date (returns a Set of completed weekly task texts)
export const getWeeklyCompletion = async (date) => {
  try {
    const weekKey = getWeekKey(date);
    const key = 'weekly_completions';
    const raw = await AsyncStorage.getItem(key);
    const all = raw ? JSON.parse(raw) : {};
    const completed = all[weekKey] || [];
    return new Set(completed);
  } catch (err) {
    console.error('Error loading weekly completion:', err);
    return new Set();
  }
};
