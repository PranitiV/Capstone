// app/screens/ChatScreen.tsx (Version 1 - Stable Chat ID)

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { db, FIREBASE_AUTH } from '../../FirebaseConfig';
import { 
  doc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/ChatScreen';

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
}

interface ChatScreenProps {
  route: any; // containing { postOwnerId, itemId }
  navigation: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const currentUser = FIREBASE_AUTH.currentUser;

  // Grab the two critical pieces of data from route.params
  const { postOwnerId, itemId } = route.params || {};

  const [chatId, setChatId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const createOrFetchChat = useCallback(async () => {
    if (!currentUser || !postOwnerId) {
      console.log('DEBUG: Missing currentUser or postOwnerId');
      return;
    }

    try {
      // 1. Sort the user IDs so we get a stable, consistent order.
      //    This ensures both participants produce the same chatId.
      const sortedUids = [currentUser.uid, postOwnerId].sort(); 
      const stableChatId = [itemId, sortedUids[0], sortedUids[1]].join('_'); 

      console.log('DEBUG: stableChatId =', stableChatId);

      // 2. Check if the doc exists in /chats/{stableChatId}
      const chatDocRef = doc(db, 'chats', stableChatId);
      const chatDocSnap = await getDoc(chatDocRef);

      // 3. If no doc, create one
      if (!chatDocSnap.exists()) {
        console.log('DEBUG: chat doc does NOT exist -> creating');
        await setDoc(chatDocRef, {
          participants: sortedUids,
          itemId: itemId,
          createdAt: serverTimestamp(),
        });
      } else {
        console.log('DEBUG: chat doc already exists');
      }

      setChatId(stableChatId);
    } catch (error) {
      console.log('Error in createOrFetchChat:', error);
    }
  }, [currentUser, postOwnerId, itemId]);

  // On mount, call createOrFetchChat
  useEffect(() => {
    createOrFetchChat();
  }, [createOrFetchChat]);

  // Once we have chatId, set up real-time listener
  useEffect(() => {
    if (!chatId) {
      console.log('DEBUG: No chatId yet -> skip onSnapshot');
      return;
    }

    setLoading(true);
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const newMessages: Message[] = [];
        snapshot.forEach((doc) => {
          newMessages.push({ id: doc.id, ...doc.data() } as Message);
        });
        console.log('DEBUG: Received', newMessages.length, 'messages');
        setMessages(newMessages);
        setLoading(false);
      },
      (err) => {
        console.log('DEBUG: onSnapshot error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  // Sending a new message
  const sendMessage = async () => {
    if (!inputText.trim() || !currentUser) return;

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: inputText,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setInputText('');
    } catch (error) {
      console.log('Error sending message:', error);
    }
  };

  // Render each message bubble
  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUser?.uid;
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  // Loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Main chat UI
  return (
    <View style={styles.container}>
      {/* Message list */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(msg) => msg.id}
        style={styles.messagesList}
      />

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;
