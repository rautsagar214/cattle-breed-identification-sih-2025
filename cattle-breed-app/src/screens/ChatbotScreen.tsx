import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

/**
 * ChatbotScreen - AI-powered chatbot for cattle-related queries
 * Uses Google Gemini API to answer questions about breeds, care, health
 * Supports multiple languages (Hindi, English, etc.)
 */
export default function ChatbotScreen(): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! 👋 I am your cattle care assistant. Ask me anything about cattle breeds, health, care, or farming!',
      isBot: true,
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // TODO: Connect to Gemini API
  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      isBot: false,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response (replace with actual Gemini API call)
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: 'I\'m currently under development! Soon I\'ll be able to answer all your cattle-related questions using Google Gemini AI. 🤖',
        isBot: true,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);

    // TODO: Actual implementation
    // try {
    //   const response = await fetch('YOUR_GEMINI_API_ENDPOINT', {
    //     method: 'POST',
    //     body: JSON.stringify({ question: inputText }),
    //   });
    //   const data = await response.json();
    //   // Add bot response
    // } catch (error) {
    //   console.error('Error:', error);
    // }
  };

  const QuickQuestion = ({ question }: { question: string }) => (
    <TouchableOpacity
      style={styles.quickQuestion}
      onPress={() => setInputText(question)}
    >
      <Text style={styles.quickQuestionText}>{question}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 Cattle Care Assistant</Text>
        <Text style={styles.headerSubtitle}>Ask me anything!</Text>
      </View>

      {/* Quick Questions */}
      <View style={styles.quickQuestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <QuickQuestion question="What is Gir breed?" />
          <QuickQuestion question="How to increase milk production?" />
          <QuickQuestion question="Common cattle diseases?" />
          <QuickQuestion question="Best feed for cattle?" />
        </ScrollView>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isBot ? styles.botBubble : styles.userBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.isBot ? styles.botText : styles.userText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <Text style={styles.typingText}>Typing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your question..."
          placeholderTextColor="#95a5a6"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={inputText.trim() === ''}
        >
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ecf0f1',
    marginTop: 5,
  },
  quickQuestionsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  quickQuestion: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  quickQuestionText: {
    fontSize: 13,
    color: '#2980b9',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  botBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    backgroundColor: '#3498db',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  botText: {
    color: '#2c3e50',
  },
  userText: {
    color: '#fff',
  },
  typingText: {
    fontSize: 15,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3498db',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  sendButtonText: {
    fontSize: 20,
  },
});
