
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { loadTasks } from '../services/taskService';
import { loadCompletions } from '../services/completionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles';
import * as Progress from 'react-native-progress';
import { getWeekKey } from '../services/completionService';

const MonthlySummaryScreen = () => {
  console.log("MonthlySummaryScreen rendered");
  
  const [monthOffset, setMonthOffset] = useState(0);
  const [groupedSummary, setGroupedSummary] = useState({}); // { groupName: { dailyCompleted, expectedDaily, weeklyCompleted, expectedWeekly, onetimeCompleted, expectedOnetime } }
  const [openGroups, setOpenGroups] = useState({}); // to track which groups are expanded

  useEffect(() => {
    console.log("useEffect triggered: generating grouped summary");
    generateGroupedSummary();
  }, [monthOffset]);

  const generateGroupedSummary = async () => {
    try {
      console.log("generateGroupedSummary started");
      
      // Load all tasks and completions from AsyncStorage
      const allTasks = await loadTasks(); // expected: object keyed by date ("YYYY-MM-DD")
      console.log("allTasks:", allTasks);
      
      const dailyCompletions = await loadCompletions(); // object keyed by date
      console.log("dailyCompletions:", dailyCompletions);
      
      const weeklyCompletionsRaw = await AsyncStorage.getItem('weekly_completions');
      const weeklyCompletions = weeklyCompletionsRaw ? JSON.parse(weeklyCompletionsRaw) : {};
      console.log("weeklyCompletions:", weeklyCompletions);

      // Determine target month based on monthOffset (0 = current month)
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + monthOffset);
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      const daysInMonth = new Date(year, targetDate.getMonth() + 1, 0).getDate();
      console.log("Target month:", monthKey, "Days in month:", daysInMonth);

      // Build a set of week keys for each day in the target month.
      const weekSet = new Set();
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, targetDate.getMonth(), i);
        const dStr = d.toISOString().split('T')[0];
        weekSet.add(getWeekKey(dStr));
      }
      const totalWeeks = weekSet.size;
      console.log("Week keys in month:", Array.from(weekSet), "Total weeks:", totalWeeks);

      // Group tasks by eventLabel (only include tasks with a non-empty eventLabel)
      const groupedTasks = {}; // { groupName: { daily: [], weekly: [], onetime: [] } }
      Object.keys(allTasks || {}).forEach(dateKey => {
        if (!dateKey.startsWith(monthKey)) return; // only consider tasks for target month
        (allTasks[dateKey] || []).forEach(task => {
          if (!task.eventLabel || task.eventLabel.trim() === "") return; // skip if no group label
          const group = task.eventLabel.trim();
          if (!groupedTasks[group]) {
            groupedTasks[group] = { daily: [], weekly: [], onetime: [] };
          }
          if (task.type === 'daily') {
            groupedTasks[group].daily.push(task);
          } else if (task.type === 'weekly') {
            groupedTasks[group].weekly.push(task);
          } else if (task.type === 'onetime') {
            groupedTasks[group].onetime.push(task);
          }
        });
      });
      console.log("Grouped Tasks:", groupedTasks);

      // For each group, calculate summary stats
      const newGroupedSummary = {};
      for (const group in groupedTasks) {
        const tasksInGroup = groupedTasks[group];
        // Daily summary: if there is at least one daily task in this group, expected = daysInMonth.
        const expectedDaily = tasksInGroup.daily.length > 0 ? daysInMonth : 0;
        let dailyCompleted = 0;
        if (expectedDaily > 0 && dailyCompletions) {
          for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, targetDate.getMonth(), i);
            const dKey = d.toISOString().split('T')[0];
            if (dailyCompletions[dKey] && dailyCompletions[dKey].some(name => tasksInGroup.daily.find(t => t.text === name))) {
              dailyCompleted++;
            }
          }
        }
        // Weekly summary: expected = (unique weekly tasks count) * totalWeeks.
        const uniqueWeekly = new Set(tasksInGroup.weekly.map(t => t.text));
        const expectedWeekly = tasksInGroup.weekly.length > 0 ? uniqueWeekly.size * totalWeeks : 0;
        let weeklyCompleted = 0;
        if (expectedWeekly > 0) {
          weekSet.forEach(weekKey => {
            if (weeklyCompletions[weekKey] && weeklyCompletions[weekKey].some(name => tasksInGroup.weekly.find(t => t.text === name))) {
              weeklyCompleted++;
            }
          });
        }
        // One-time summary: expected = number of one-time tasks in this group.
        const expectedOnetime = tasksInGroup.onetime.length;
        let onetimeCompleted = 0;
        if (expectedOnetime > 0 && dailyCompletions) {
          Object.keys(dailyCompletions || {}).forEach(dKey => {
            if (dKey.startsWith(monthKey)) {
              const count = (dailyCompletions[dKey] || []).filter(name => tasksInGroup.onetime.find(t => t.text === name)).length;
              onetimeCompleted += count;
            }
          });
        }
        newGroupedSummary[group] = {
          dailyCompleted,
          expectedDaily,
          weeklyCompleted,
          expectedWeekly,
          onetimeCompleted,
          expectedOnetime,
        };
      }
      console.log("Grouped Summary:", newGroupedSummary);
      setGroupedSummary(newGroupedSummary);
    } catch (error) {
      console.error("Error in generateGroupedSummary:", error);
    }
  };

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const changeMonth = (direction) => {
    setMonthOffset((offset) => offset + direction);
  };

  const formatMonth = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const renderProgressBar = (label, completed, total) => {
    const percent = total > 0 ? completed / total : 0;
    return (
      <View style={{ marginVertical: 10 }}>
        <Text style={styles.taskItem}>{label}</Text>
        <View style={{ position: 'relative' }}>
          <Progress.Bar
            progress={percent}
            width={null}
            height={25}
            borderRadius={8}
            color="#1E90FF"
            unfilledColor="#eee"
            borderWidth={1}
            borderColor="#ccc"
          />
          <Text
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              textAlign: 'center',
              textAlignVertical: 'center',
              color: 'black',
              fontWeight: 'bold',
            }}
          >
            {`${Math.round(percent * 100)}% (${completed} / ${total})`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Text style={styles.header}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.header}>{formatMonth()}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Text style={styles.header}>{'→'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.taskList}>
        {Object.keys(groupedSummary).length === 0 ? (
          <Text style={styles.noTasks}>No game groups found for this month.</Text>
        ) : (
          Object.keys(groupedSummary).map((group) => (
            <View key={group} style={{ marginBottom: 20 }}>
              <TouchableOpacity onPress={() => toggleGroup(group)}>
                <Text style={styles.header}>
                  {group} {openGroups[group] ? '▾' : '▸'}
                </Text>
              </TouchableOpacity>
              {openGroups[group] && (
                <View style={{ paddingHorizontal: 10 }}>
                  {renderProgressBar('Dailies Completed', groupedSummary[group].dailyCompleted, groupedSummary[group].expectedDaily)}
                  {renderProgressBar('Weeklies Completed', groupedSummary[group].weeklyCompleted, groupedSummary[group].expectedWeekly)}
                  {renderProgressBar('One-Time Events Completed', groupedSummary[group].onetimeCompleted, groupedSummary[group].expectedOnetime)}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default MonthlySummaryScreen;
