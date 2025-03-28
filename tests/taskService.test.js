
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveTasks, loadTasks } from '../services/taskService';

// Ensure that AsyncStorage is mocked using the official Jest mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Task Service', () => {
  beforeEach(async () => {
    // Clear AsyncStorage before each test to prevent state leakage.
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('loadTasks returns an empty object when no tasks are stored', async () => {
    const tasks = await loadTasks();
    expect(tasks).toEqual({});
  });

  test('saveTasks stores tasks and loadTasks retrieves them correctly', async () => {
    const sampleTasks = {
      "2025-03-22": [{ text: "Task 1", type: "daily", eventLabel: "Game A" }],
    };
    await saveTasks(sampleTasks);
    const loadedTasks = await loadTasks();
    expect(loadedTasks).toEqual(sampleTasks);
  });

  test('saveTasks calls AsyncStorage.setItem with correct parameters', async () => {
    const sampleTasks = {
      "2025-03-22": [{ text: "Task 1", type: "daily", eventLabel: "Game A" }],
    };
    await saveTasks(sampleTasks);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "gaming_tasks",
      JSON.stringify(sampleTasks)
    );
  });
});
