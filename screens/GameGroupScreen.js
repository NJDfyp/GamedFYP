import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles';

const GameGroupScreen = () => {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState('');

  const loadGroups = async () => {
    try {
      const data = await AsyncStorage.getItem('game_groups');
      setGroups(data ? JSON.parse(data) : []);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const addGroup = async () => {
    if (newGroup.trim() === '') return;
    const updatedGroups = [...groups, newGroup.trim()];
    try {
      await AsyncStorage.setItem('game_groups', JSON.stringify(updatedGroups));
      setGroups(updatedGroups);
      setNewGroup('');
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Game Groups</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={styles.input}
          placeholder="Enter group name"
          value={newGroup}
          onChangeText={setNewGroup}
        />
        <TouchableOpacity style={styles.button} onPress={addGroup}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.taskList}>
        {groups.length === 0 ? (
          <Text style={styles.noTasks}>No groups added yet.</Text>
        ) : (
          groups.map((group, index) => (
            <View key={index} style={styles.groupItem}>
              <Text style={styles.taskItem}>{group}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default GameGroupScreen;
