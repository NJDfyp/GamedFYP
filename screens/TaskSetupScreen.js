import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { saveTasks, loadTasks } from '../services/taskService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles';

const GROUPS_KEY = 'game_groups';

const TaskSetupScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState('');
  const [taskType, setTaskType] = useState('daily'); // daily, weekly, or onetime
  const [selectedDate, setSelectedDate] = useState(''); // used for one-time tasks
  const [showDatePicker, setShowDatePicker] = useState(false);
  // New state for game groups
  const [gameGroups, setGameGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(''); // event label from groups

  useEffect(() => {
    const fetchTasks = async () => {
      const storedTasks = await loadTasks();
      setTasks(storedTasks || {});
    };
    fetchTasks();
    loadGameGroups();
  }, []);

  // Load game groups from AsyncStorage
  const loadGameGroups = async () => {
    try {
      const data = await AsyncStorage.getItem(GROUPS_KEY);
      if (data) {
        setGameGroups(JSON.parse(data));
      } else {
        setGameGroups([]);
      }
    } catch (error) {
      console.error("Error loading game groups:", error);
    }
  };

  const addTask = () => {
    if (!newTask.trim()) return;

    // For one-time tasks, require a date input; for daily/weekly tasks, default to today's date.
    const baseDate = taskType === 'onetime' ? selectedDate : new Date().toISOString().split('T')[0];
    if (taskType === 'onetime' && !selectedDate) return;

    // Create the task object, including the selected game group as eventLabel.
    const taskData = {
      text: newTask,
      type: taskType,
      date: baseDate,
      eventLabel: selectedGroup, // save the selected game group as the event label
    };

    // Save tasks under the key of baseDate.
    const updatedTasks = {
      ...tasks,
      [baseDate]: [...(tasks[baseDate] || []), taskData],
    };

    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    // Clear inputs
    setNewTask('');
    setSelectedDate('');
    setTaskType('daily');
    // Optionally clear selectedGroup if desired:
    // setSelectedGroup('');
  };

  // Function to remove a task given its date key and index
  const removeTask = (dateKey, index) => {
    const updatedTasks = { ...tasks };
    if (!updatedTasks[dateKey]) return;
    updatedTasks[dateKey].splice(index, 1);
    // If no tasks remain for that date, remove the date key
    if (updatedTasks[dateKey].length === 0) {
      delete updatedTasks[dateKey];
    }
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add a Task</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter task description"
        value={newTask}
        onChangeText={setNewTask}
      />

      <Picker
        selectedValue={taskType}
        style={styles.input}
        onValueChange={(value) => setTaskType(value)}
      >
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="One-time" value="onetime" />
      </Picker>

      {taskType === 'onetime' && (
        <>
          <TouchableOpacity
            style={[styles.input, { justifyContent: 'center' }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{selectedDate || 'Select a date'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  const formatted = date.toISOString().split('T')[0];
                  setSelectedDate(formatted);
                }
              }}
            />
          )}
        </>
      )}

      {/* New: Game Group Picker */}
      <Text style={styles.header}>Select Game Group</Text>
      <Picker
        selectedValue={selectedGroup}
        style={styles.input}
        onValueChange={(value) => setSelectedGroup(value)}
      >
        <Picker.Item label="-- None --" value="" />
        {gameGroups.map((group, index) => (
          <Picker.Item key={index} label={group} value={group} />
        ))}
      </Picker>

      {/* Link to manage game groups */}
      <TouchableOpacity onPress={() => navigation.navigate('GameGroup')}>
        <Text style={{ color: '#1E90FF', marginVertical: 10 }}>Manage Game Groups</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.addButton} onPress={addTask}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>

      <ScrollView style={styles.taskList}>
        {Object.keys(tasks).map(date => (
          <View key={date}>
            <Text style={styles.dateTitle}>{date}</Text>
            {tasks[date].map((task, index) => (
              <View key={index} style={styles.taskItemRow}>
                <Text style={styles.taskItem}>
                  [{task.type}] {task.text}
                  {task.eventLabel ? ` - ${task.eventLabel}` : ''}
                </Text>
                <TouchableOpacity onPress={() => removeTask(date, index)}>
                  <Text style={{ color: 'red', marginLeft: 10 }}>❌</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default TaskSetupScreen;
