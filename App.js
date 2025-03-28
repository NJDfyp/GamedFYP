import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CalendarScreen from './screens/CalendarScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import { Ionicons } from '@expo/vector-icons';
import CalendarStack from './screens/CalendarStack';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Calendar') {
              iconName = 'calendar';
            } else if (route.name === 'Chatbot') {
              iconName = 'chatbox-ellipses';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#1E90FF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Calendar" component={CalendarStack} />
        <Tab.Screen name="Chatbot" component={ChatbotScreen} />
            
      </Tab.Navigator>
    </NavigationContainer>
  );
}
