import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes } from '../theme/colors';
import { N8N_WEBHOOK_URL, N8N_TIMEOUT_MS, assertWebhookConfigured } from '../lib/config';
import { supabase } from '../lib/supabase';

export default function ChatbotScreen() {
  const defaultGreeting = {
    id: 1,
    text: '¡Hola! Soy Hermes, tu asistente de viajes. ¿En qué puedo ayudarte hoy?',
    isBot: true,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  assertWebhookConfigured();

  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!authUser) {
          if (isMounted) setMessages([defaultGreeting]);
          return;
        }
        const { data: userRow, error: userError } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', authUser.email)
          .maybeSingle();
        if (userError) throw userError;
        if (!userRow) {
          if (isMounted) setMessages([defaultGreeting]);
          return;
        }
        if (isMounted) setUserId(userRow.user_id);

        // Obtener o crear la sesión de chat del usuario
        const { data: existingSessions, error: csErr } = await supabase
          .from('chat_sessions')
          .select('chat_id')
          .eq('user_id', userRow.user_id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (csErr) {
          const missing = csErr?.code === 'PGRST205' || String(csErr?.message || '').includes('chat_sessions');
          if (missing) {
            if (isMounted) setMessages([defaultGreeting]);
            return;
          }
          throw csErr;
        }
        let cid = existingSessions?.[0]?.chat_id;
        if (!cid) {
          const { data: inserted, error: insErr } = await supabase
            .from('chat_sessions')
            .insert({ user_id: userRow.user_id, title: 'Conversación' })
            .select('chat_id')
            .maybeSingle();
          if (insErr) throw insErr;
          cid = inserted.chat_id;
          // Sembrar saludo inicial
          await supabase
            .from('chat_messages')
            .insert({ chat_id: cid, user_id: userRow.user_id, role: 'assistant', content: defaultGreeting.text });
        }
        if (isMounted) setChatId(cid);

        const { data: msgs, error: mErr } = await supabase
          .from('chat_messages')
          .select('message_id, role, content, created_at')
          .eq('chat_id', cid)
          .order('created_at', { ascending: true });
        if (mErr) throw mErr;
        const mapped = (msgs || []).map((m) => ({
          id: m.message_id,
          text: m.content,
          isBot: m.role !== 'user',
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        if (isMounted) setMessages(mapped.length > 0 ? mapped : [defaultGreeting]);
      } catch (err) {
        console.log('Error cargando historial del chat:', err);
        if (isMounted) setMessages((prev) => prev.length ? prev : [defaultGreeting]);
      } finally {
        if (isMounted) setHistoryLoaded(true);
      }
    };
    loadHistory();
    return () => { isMounted = false; };
  }, []);

  const persistMessage = async (role, content) => {
    if (!chatId || !userId) return;
    try {
      await supabase
        .from('chat_messages')
        .insert({ chat_id: chatId, user_id: userId, role, content });
    } catch (e) {
      const missing = e?.code === 'PGRST205' || String(e?.message || '').includes('chat_messages');
      if (!missing) console.log('Error guardando mensaje:', e);
    }
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    const userMessage = {
      id: messages.length + 1,
      text,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    // Persistir mensaje del usuario
    persistMessage('user', text);
    setInputText('');

    if (!N8N_WEBHOOK_URL) {
      const botResponse = {
        id: userMessage.id + 1,
        text: 'Webhook no configurado. Define EXPO_PUBLIC_N8N_WEBHOOK_URL en .env.',
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botResponse]);
      return;
    }

    setSending(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), N8N_TIMEOUT_MS);

      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/plain, application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      let replyText = '';
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        // Flexible parsing: accept nested {json: {output}}, flat {output}, {assistant_reply}, {message}, {text}, or raw string
        if (typeof data === 'string') {
          replyText = data;
        } else if (data?.json?.output) {
          replyText = String(data.json.output);
        } else if (data.output) {
          replyText = String(data.output);
        } else if (data.assistant_reply) {
          replyText = String(data.assistant_reply);
        } else if (data.message) {
          replyText = String(data.message);
        } else if (data.text) {
          replyText = String(data.text);
        } else if (data.query) {
          // Fallback: if the agent returns a SQL query confirmation
          replyText = 'He generado la inserción correctamente.';
        } else {
          replyText = 'No se pudo interpretar la respuesta del agente.';
        }
      } else {
        // Plain text
        replyText = await res.text();
      }

      const botResponse = {
        id: userMessage.id + 1,
        text: replyText || 'Sin contenido de respuesta.',
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botResponse]);
      // Persistir respuesta del asistente
      persistMessage('assistant', botResponse.text);
    } catch (err) {
      const botError = {
        id: userMessage.id + 1,
        text: 'Error llamando al agente: ' + (err?.message || 'desconocido'),
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botError]);
      persistMessage('assistant', botError.text);
    } finally {
      setSending(false);
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
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]} 
          onPress={() => { if (inputText.trim() && !sending) sendMessage(); }}
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