import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatbotScreen from '../screens/ChatbotScreen';

jest.mock('../services/chatbotService', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue("Test response")
}));

test('clears input after sending message', async () => {
  const { getByPlaceholderText, getByText, findByText } = render(<ChatbotScreen />);
  
  const input = getByPlaceholderText("Ask about gaming news...");
  
  fireEvent.changeText(input, "Hello");
  fireEvent.press(getByText("Send"));

  // Wait for state updates
  await waitFor(() => {
    expect(input.props.value).toBe("");  // Verify input cleared
  });

  expect(await findByText("Test response")).toBeTruthy(); // Verify response appears
});
