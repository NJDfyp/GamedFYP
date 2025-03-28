import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { loadTasks } from '../services/taskService';
import styles from '../styles';

const CalendarScreen = () => {
  const navigation = useNavigation();

  const todayDate = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [tasks, setTasks] = useState({});
  const [lastTap, setLastTap] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchTasks = async () => {
        const storedTasks = await loadTasks();
        setTasks(storedTasks || {});
      };
      fetchTasks();
    }, [])
  );

  
  const getTasksForDate = (date, tasksObj) => {
    if (!date || !tasksObj) return [];
    const today = new Date(date);
    const weekday = today.getDay();
    const results = [];
    Object.keys(tasksObj).forEach(dateKey => {
      const dayTasks = tasksObj[dateKey];
      dayTasks.forEach(task => {
        if (task.type === 'daily') {
          results.push(task);
        } else if (task.type === 'weekly') {
          results.push(task);
        } else if (task.type === 'onetime' && dateKey === date) {
          results.push(task);
        }
      });
    });
    return results;
  };

  const handleDayPress = (day) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    const tappedDate = day.dateString;

    if (selectedDate === tappedDate && lastTap && (now - lastTap) < DOUBLE_TAP_DELAY) {
      navigation.navigate('TaskDetail', { date: tappedDate });
    } else {
      setSelectedDate(tappedDate);
      setLastTap(now);
    }
  };

  const displayTasks = getTasksForDate(selectedDate, tasks);

  const markedDates = selectedDate ? { [selectedDate]: { selected: true } } : {};

  return (
    <View style={styles.container}>
      <Calendar onDayPress={handleDayPress} markedDates={markedDates} />

      <ScrollView style={styles.taskList}>
        <Text style={styles.header}>Tasks for {String(selectedDate || 'Select a day')}</Text>
        {Array.isArray(displayTasks) && displayTasks.length > 0 ? (
          displayTasks.map((task, index) => (
            <View key={index} style={styles.taskItemRow}>
              <Text style={styles.taskItem}>[{task.type}] {task.text}</Text>
              {task.eventLabel ? (
                <Text style={styles.taskLabel}>{task.eventLabel}</Text>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.noTasks}>No tasks for this day</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TaskSetup')}>
        <Text style={styles.buttonText}>Manage Dailies & Weeklies</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MonthlySummary')}>
        <Text style={styles.buttonText}>View Monthly Summary</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CalendarScreen;
