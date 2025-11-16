import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes } from '../theme/colors';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '¡Hola! Soy Hermes, tu asistente de viajes. ¿En qué puedo ayudarte hoy?',
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputText,
        isBot: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([...messages, newMessage]);
      setInputText('');
      
      // Simular respuesta del bot después de un breve delay
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          text: 'Gracias por tu mensaje. Esta funcionalidad estará disponible pronto para ayudarte a planificar tus viajes.',
          isBot: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const keyboardOffset = Platform.OS === 'ios' ? 64 : 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardOffset}
    >
      <ScrollView 
        style={styles.messagesContainer} 
        showsVerticalScrollIndicator={false}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
      >
        {messages.map((message) => (
          <View key={message.id} style={[
            styles.messageWrapper,
            message.isBot ? styles.botMessageWrapper : styles.userMessageWrapper
          ]}>
            <View style={[
              styles.messageBubble,
              message.isBot ? styles.botMessage : styles.userMessage
            ]}>
              <Text style={[
                styles.messageText,
                message.isBot ? styles.botMessageText : styles.userMessageText
              ]}>
                {message.text}
              </Text>
              <Text style={[
                styles.timestamp,
                message.isBot ? styles.botTimestamp : styles.userTimestamp
              ]}>
                {message.timestamp}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor={colors.gray + '80'}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={() => { if (inputText.trim()) sendMessage(); }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="arrow-up-circle" 
            size={22} 
            color={colors.white} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageWrapper: {
    marginVertical: 4,
  },
  botMessageWrapper: {
    alignItems: 'flex-start',
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  botMessage: {
    backgroundColor: colors.gray,
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    backgroundColor: colors.cyan,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: fontSizes.md,
    lineHeight: 20,
  },
  botMessageText: {
    color: colors.white,
  },
  userMessageText: {
    color: colors.black,
  },
  timestamp: {
    fontSize: fontSizes.sm,
    marginTop: 4,
  },
  botTimestamp: {
    color: colors.white + '80',
  },
  userTimestamp: {
    color: colors.black + '80',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.gray,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.black,
    color: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: fontSizes.md,
  },
  sendButton: {
    backgroundColor: colors.cyan,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray,
  },
});