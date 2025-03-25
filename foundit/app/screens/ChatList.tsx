// app/screens/ChatsList.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { db, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import type { InsideTabParamList } from '../../App';  
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

interface ChatDoc {
  id: string;
  participants: string[];
  itemId: string;
}

interface User {
  name: string;
}

interface Item {
  name: string;
}

export default function ChatsList() {
  const navigation = useNavigation<BottomTabNavigationProp<InsideTabParamList, 'Chat'>>();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [chats, setChats] = useState<ChatDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<{ [key: string]: User }>({});
  const [itemDetails, setItemDetails] = useState<{ [key: string]: Item }>({});

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allChats: ChatDoc[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatDoc[];

      // Fetch user and item details for each chat
      const userPromises = allChats.map(async (chat) => {
        const otherParticipant = chat.participants.find((uid) => uid !== currentUser.uid);
        if (otherParticipant && !userDetails[otherParticipant]) {
          const userDoc = await getDoc(doc(db, 'users', otherParticipant));
          return { uid: otherParticipant, data: userDoc.data() as User };
        }
        return null;
      });

      const itemPromises = allChats.map(async (chat) => {
        if (chat.itemId && !itemDetails[chat.itemId]) {
          const itemDoc = await getDoc(doc(db, 'items', chat.itemId));
          return { itemId: chat.itemId, data: itemDoc.data() as Item };
        }
        return null;
      });

      const userResults = await Promise.all(userPromises);
      const itemResults = await Promise.all(itemPromises);

      const userDetailsMap: { [key: string]: User } = {};
      userResults.forEach((result) => {
        if (result) userDetailsMap[result.uid] = result.data;
      });

      const itemDetailsMap: { [key: string]: Item } = {};
      itemResults.forEach((result) => {
        if (result) itemDetailsMap[result.itemId] = result.data;
      });

      setUserDetails((prev) => ({ ...prev, ...userDetailsMap }));
      setItemDetails((prev) => ({ ...prev, ...itemDetailsMap }));
      setChats(allChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleOpenChat = (chat: ChatDoc) => {
    const otherParticipant = chat.participants.find((uid) => uid !== currentUser?.uid);
    navigation.navigate('Chat', {
      postOwnerId: otherParticipant || '',
      itemId: chat.itemId,
    });
  };

  const renderChatItem = ({ item: chat }: { item: ChatDoc }) => {
    const otherParticipant = chat.participants.find((uid) => uid !== currentUser?.uid);
    const otherPersonName = otherParticipant ? userDetails[otherParticipant]?.name || 'Unknown' : 'Unknown';
    const itemName = itemDetails[chat.itemId]?.name || 'Unknown Item';

    return (
      <TouchableOpacity
        style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ccc' }}
        onPress={() => handleOpenChat(chat)}
      >
        <Text style={{ fontWeight: '600' }}>Chat with: {otherPersonName}</Text>
        <Text>Item: {itemName}</Text>
      </TouchableOpacity>
    );
  };

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

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>My Chats</Text>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(chat) => chat.id}
      />
    </View>
  );
}
