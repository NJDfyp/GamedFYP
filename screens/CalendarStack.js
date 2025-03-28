
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CalendarScreen from './CalendarScreen';
import TaskSetupScreen from './TaskSetupScreen';
import TaskDetailScreen from './TaskDetailScreen';
import MonthlySummaryScreen from './MonthlySummaryScreen';
import GameGroupScreen from './GameGroupScreen';

const Stack = createStackNavigator();

export default function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarHome" component={CalendarScreen} />
      <Stack.Screen name="TaskSetup" component={TaskSetupScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="MonthlySummary" component={MonthlySummaryScreen} />
      <Stack.Screen name="GameGroup" component={GameGroupScreen} />
    </Stack.Navigator>
  );
}
