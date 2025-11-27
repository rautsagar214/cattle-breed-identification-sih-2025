import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useLanguage } from '../src/contexts/LanguageContext';
import { sendMessageToGemini } from '../src/services/gemini';
import { sanitizeInput, validateInputLength, detectSqlInjection } from '../src/utils/security';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function ChatbotScreen(): React.JSX.Element {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: t('chatbot.welcome'),
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const quickQuestions = [
    'How to care for Gir cattle?',
    'Best feed for dairy cattle',
    'Signs of cattle illness',
    'Vaccination schedule',
  ];

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (!user) {
      Alert.alert('Not Logged In', 'Please login to use the chatbot');
      router.push('/login' as any);
      return;
    }

    // Validate input length (max 500 characters)
    const lengthCheck = validateInputLength(inputText, 500);
    if (!lengthCheck.isValid) {
      Alert.alert('Message Too Long', lengthCheck.error + '\n\nPlease shorten your message.');
      return;
    }

    // Check for SQL injection attempts
    if (detectSqlInjection(inputText)) {
      Alert.alert(
        'Invalid Input',
        'Your message contains characters that are not allowed. Please rephrase your question.'
      );
      return;
    }

    // Sanitize input to prevent XSS
    const safeText = sanitizeInput(inputText);

    const userMessage: Message = {
      id: Date.now(),
      text: safeText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const questionText = safeText;
    setInputText('');
    setIsTyping(true);

    try {
      // Convert messages to chat history format
      const chatHistory = messages.map(msg => ({
        isBot: msg.isBot,
        text: msg.text,
      }));
      
      // Call Gemini API with language parameter
      console.log('📤 Sending to Gemini (Language:', language, '):', questionText);
      const responseText = await sendMessageToGemini(questionText, chatHistory, language);
      console.log('📥 Received from Gemini:', responseText);

      const botResponse: Message = {
        id: Date.now() + 1,
        text: responseText,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error: any) {
      console.error('❌ Chat error:', error);
      console.error('Error details:', error.message);
      
      // Show more helpful error message
      let errorMessage = 'Sorry, I encountered an error. ';
      
      if (error.message.includes('API key')) {
        errorMessage += 'API key issue detected.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage += 'Please check your internet connection.';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage += 'API quota exceeded. Please try again later.';
      } else {
        errorMessage += 'Please try again or contact support.';
      }
      
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: errorMessage + '\n\n(Error: ' + error.message + ')',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const getBotResponse = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes('gir')) {
      return 'Gir cattle are one of the best indigenous dairy breeds from India. They have:\n\n- Distinctive lyre-shaped horns\n- White to reddish-brown coat\n- Excellent milk production (10-12 liters/day)\n- High disease resistance\n\nFor best care:\n- Provide clean water (30-40 liters/day)\n- Feed green fodder & concentrate\n- Regular milking schedule\n- Maintain clean shelter';
    }
    
    if (q.includes('feed') || q.includes('diet')) {
      return 'A balanced cattle diet should include:\n\nRoughage (60-70%):\n- Green grass\n- Dry fodder\n- Silage\n\nConcentrate (30-40%):\n- Cattle feed\n- Mineral mixture\n- Salt\n\nWater:\n- Clean, fresh water always available\n- 30-50 liters per day per animal\n\nAdjust quantities based on milk production and body weight.';
    }
    
    if (q.includes('illness') || q.includes('disease') || q.includes('sick')) {
      return 'Common signs of cattle illness:\n\nWatch for:\n- Loss of appetite\n- Reduced milk production\n- Dull or sunken eyes\n- Rough hair coat\n- Discharge from nose/eyes\n- Difficulty breathing\n- Lameness or stiffness\n- Abnormal temperature (>102.5F)\n\nAction:\n- Isolate sick animal\n- Call veterinarian immediately\n- Keep records of symptoms';
    }
    
    if (q.includes('vaccine') || q.includes('vaccination')) {
      return 'Essential cattle vaccination schedule:\n\nMust-have vaccines:\n\n1. FMD (Foot & Mouth Disease)\n   - Every 6 months\n\n2. HS (Haemorrhagic Septicaemia)\n   - Annual\n\n3. BQ (Black Quarter)\n   - Annual (6-24 months age)\n\n4. Anthrax\n   - Annual in endemic areas\n\nConsult local vet for area-specific requirements and timing.';
    }
    
    return 'I can help you with:\n\n- Cattle breed information\n- Health & disease management\n- Feeding & nutrition\n- Vaccination schedules\n- Housing & shelter\n- Milk production tips\n\nPlease ask a specific question about any of these topics!';
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('chatbot.title')}</Text>
          <Text style={styles.headerSubtitle}>
            {user ? t('chatbot.subtitle') : 'Login to start chatting'}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
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
            <Text
              style={[
                styles.timestamp,
                message.isBot ? styles.botTimestamp : styles.userTimestamp,
              ]}
            >
              {message.timestamp.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <Text style={styles.typingText}>{t('chatbot.thinking')}</Text>
          </View>
        )}

        {/* Quick Questions */}
        {messages.length === 1 && (
          <View style={styles.quickQuestionsContainer}>
            <Text style={styles.quickQuestionsTitle}>{t('chatbot.quickQuestions')}</Text>
            {quickQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickQuestionButton}
                onPress={() => handleQuickQuestion(question)}
              >
                <Text style={styles.quickQuestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('chatbot.placeholder')}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isTyping}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3498db',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3498db',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: '#2c3e50',
  },
  userText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 5,
  },
  botTimestamp: {
    color: '#95a5a6',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
  },
  typingText: {
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  quickQuestionsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  quickQuestionButton: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  quickQuestionText: {
    color: '#3498db',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3498db',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.5,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
