// app/screens/ChatsList.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { db, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import type { InsideTabParamList } from '../../App';  // <--- ADJUST PATH if needed
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Optional: define a TypeScript interface for our chat docs
interface ChatDoc {
  id: string;
  participants: string[];
  itemId: string;
  // any other fields you might have, like createdAt, etc.
}

export default function ChatsList() {
  const navigation = useNavigation<BottomTabNavigationProp<InsideTabParamList, 'Chat'>>();

  const currentUser = FIREBASE_AUTH.currentUser;
  const [chats, setChats] = useState<ChatDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // 1. Query all chat docs where participants array contains the currentUser.uid
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));

    // 2. Listen in real‐time for any changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allChats: ChatDoc[] = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() } as ChatDoc;
      });
      setChats(allChats);
      setLoading(false);
    });

    // cleanup
    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text>You have no active chats</Text>
      </View>
    );
  }

  // 3. When user taps a chat, navigate to ChatScreen
  //    We pass { postOwnerId, itemId }, similar to how we do in Post.tsx
  const handleOpenChat = (chat: ChatDoc) => {
    // Suppose the user is the “finder,” then the “postOwnerId”
    // is the other participant. But if the user is the item owner,
    // the “other participant” is the finder. So we find that other UID:
    const otherParticipant = chat.participants.find(
      (uid) => uid !== currentUser?.uid
    );
    // Now navigate to "Chat", passing the same param shape
    navigation.navigate('Chat', {
      postOwnerId: otherParticipant || '',
      itemId: chat.itemId,
    });
  };

  const renderChatItem = ({ item: chat }: { item: ChatDoc }) => {
    return (
      <TouchableOpacity
        style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ccc' }}
        onPress={() => handleOpenChat(chat)}
      >
        <Text style={{ fontWeight: '600' }}>Chat ID: {chat.id}</Text>
        <Text>Item ID: {chat.itemId}</Text>
        <Text>Participants: {chat.participants.join(', ')}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
        Your Chats
      </Text>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(chat) => chat.id}
      />
    </View>
  );
}
