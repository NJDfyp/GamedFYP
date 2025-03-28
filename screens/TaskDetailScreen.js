import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { loadTasks } from '../services/taskService';
import { 
  loadCompletions, 
  saveCompletion, 
  getCompletionByDate, 
  getWeekKey, 
  saveWeeklyCompletion, 
  getWeeklyCompletion 
} from '../services/completionService';

import styles from '../styles';

const TaskDetailScreen = ({ route, navigation }) => {
  const { date } = route.params; // the selected date from CalendarScreen
  const [tasksForDay, setTasksForDay] = useState([]);
  const [completedIndices, setCompletedIndices] = useState([]);

  // Load tasks and completions when the screen mounts or the date changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTasks = await loadTasks();
        const filteredTasks = getTasksForDate(date, storedTasks);
        setTasksForDay(filteredTasks);

        const dailyComp = await getCompletionByDate(date); // array of completed texts for daily/onetime
        const weeklyComp = await getWeeklyCompletion(date); // a Set of completed weekly task texts

        // Build a list of indices that are marked complete
        const indices = filteredTasks.map((task, index) => {
          if (task.type === 'weekly') {
            return weeklyComp.has(task.text) ? index : null;
          } else {
            return dailyComp.includes(task.text) ? index : null;
          }
        }).filter(i => i !== null);
        setCompletedIndices(indices);
      } catch (error) {
        console.error("Error in loadData:", error);
      }
    };

    loadData();
  }, [date]);

  // Filter tasks for the given date: daily tasks and onetime tasks are only those with a matching date,
  // weekly tasks are always included so that they can be completed once per week.
  const getTasksForDate = (date, tasksObj) => {
    if (!date || !tasksObj) return [];
    let results = [];
    Object.keys(tasksObj).forEach(dateKey => {
      (tasksObj[dateKey] || []).forEach(task => {
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

  // Toggle completion for a task:
  // For weekly tasks, once marked complete, they cannot be unchecked.
  // For daily and onetime tasks, toggle normally.
  const toggleComplete = (index) => {
    const task = tasksForDay[index];
    if (task.type === 'weekly') {
      if (!completedIndices.includes(index)) {
        setCompletedIndices([...completedIndices, index]);
      }
      // Once a weekly task is marked complete, do not allow unchecking.
    } else {
      if (completedIndices.includes(index)) {
        setCompletedIndices(completedIndices.filter(i => i !== index));
      } else {
        setCompletedIndices([...completedIndices, index]);
      }
    }
  };

  // Save completions: save daily/onetime completions for the current date and weekly completions separately.
  const handleSave = async () => {
    try {
      const dailyTasksCompleted = tasksForDay
        .filter((_, index) => completedIndices.includes(index) && tasksForDay[index].type !== 'weekly')
        .map(task => task.text);
      const weeklyTasksCompleted = tasksForDay
        .filter((_, index) => completedIndices.includes(index) && tasksForDay[index].type === 'weekly')
        .map(task => task.text);
      await saveCompletion(date, dailyTasksCompleted);
      await saveWeeklyCompletion(date, weeklyTasksCompleted);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving completions:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Task Details for {date}</Text>
      <ScrollView style={styles.taskList}>
        {tasksForDay.length === 0 ? (
          <Text style={styles.noTasks}>No tasks for this day</Text>
        ) : (
          tasksForDay.map((task, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.taskItemRow,
                completedIndices.includes(index) && { backgroundColor: '#d4edda' }
              ]}
              onPress={() => toggleComplete(index)}
            >
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Text style={styles.taskItem}>[{task.type}] {task.text}</Text>
              </View>
              {task.eventLabel ? (
                <Text style={styles.taskLabel}>{task.eventLabel}</Text>
              ) : null}
              <Text>{completedIndices.includes(index) ? '✅' : '⬜'}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Completion</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TaskDetailScreen;
