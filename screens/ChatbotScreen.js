import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import fetchGamingNewsChatbotResponse from '../services/chatbotService';


const ChatbotScreen = () => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleSend = async () => {
    // If the input is empty, do nothing
    if (!userInput.trim()) return;

    // Add user's message to chat history
    const userMessage = { role: 'user', content: userInput };
    setChatHistory((prevHistory) => [...prevHistory, userMessage]);

    // Call chatbot service
    try {
      const botResponse = await fetchGamingNewsChatbotResponse(userInput);
      const botMessage = { role: 'bot', content: botResponse };
      setChatHistory((prevHistory) => [...prevHistory, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
    }

    // Clear the input field
    setUserInput('');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatContainer}>
        {chatHistory.map((msg, index) => (
          <Text
            key={index}
            style={[
              styles.message,
              msg.role === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            {msg.content}
          </Text>
        ))}
      </ScrollView>

      <TextInput
        style={styles.input}
        value={userInput}
        onChangeText={setUserInput}
        placeholder="Ask about gaming news..."
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  chatContainer: { flex: 1, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  message: { marginVertical: 5, fontSize: 16 },
  userMessage: { textAlign: 'right', color: 'blue' },
  botMessage: { textAlign: 'left', color: 'black' },
});

export default ChatbotScreen;
