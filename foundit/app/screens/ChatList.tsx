"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  StatusBar,
  Image,
} from "react-native"
import { db, FIREBASE_AUTH } from "../../FirebaseConfig"
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
  orderBy,
  limit,
  type Timestamp,
  getDocs,
} from "firebase/firestore"
import { useNavigation } from "@react-navigation/native"
import type { InsideTabParamList } from "../../App"
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"

interface ChatDoc {
  id: string
  participants: string[]
  itemId: string
  lastMessage?: {
    text: string
    timestamp: Timestamp
    senderId: string
  }
}

interface User {
  name: string
  photoURL?: string
}

interface Item {
  name: string
  imageURL?: string
}

interface Message {
  text: string
  senderId: string
  createdAt: Timestamp
}

export default function ChatsList() {
  const navigation = useNavigation<BottomTabNavigationProp<InsideTabParamList, "Chat">>()
  const currentUser = FIREBASE_AUTH.currentUser

  const [chats, setChats] = useState<ChatDoc[]>([])
  const [filteredChats, setFilteredChats] = useState<ChatDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [userDetails, setUserDetails] = useState<{ [key: string]: User }>({})
  const [itemDetails, setItemDetails] = useState<{ [key: string]: Item }>({})
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const chatsRef = collection(db, "chats")
    const q = query(chatsRef, where("participants", "array-contains", currentUser.uid))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allChats: ChatDoc[] = []

      // Process each chat document
      for (const chatDoc of snapshot.docs) {
        const chatData = chatDoc.data() as ChatDoc
        const chatId = chatDoc.id

        // Fetch the last message for this chat
        const messagesRef = collection(db, "chats", chatId, "messages")
        const lastMessageQuery = query(messagesRef, orderBy("createdAt", "desc"), limit(1))
        const lastMessageSnapshot = await getDocs(lastMessageQuery)

        let lastMessage = null
        if (!lastMessageSnapshot.empty) {
          const messageData = lastMessageSnapshot.docs[0].data() as Message
          lastMessage = {
            text: messageData.text,
            timestamp: messageData.createdAt,
            senderId: messageData.senderId,
          }
        }

        allChats.push({
          id: chatId,
          ...chatData,
          lastMessage: lastMessage,
        })
      }

      // Fetch user and item details for each chat
      const userPromises = allChats.map(async (chat) => {
        const otherParticipant = chat.participants.find((uid) => uid !== currentUser.uid)
        if (otherParticipant && !userDetails[otherParticipant]) {
          const userDoc = await getDoc(doc(db, "users", otherParticipant))
          return { uid: otherParticipant, data: userDoc.data() as User }
        }
        return null
      })

      const itemPromises = allChats.map(async (chat) => {
        if (chat.itemId && !itemDetails[chat.itemId]) {
          const itemDoc = await getDoc(doc(db, "items", chat.itemId))
          return { itemId: chat.itemId, data: itemDoc.data() as Item }
        }
        return null
      })

      const userResults = await Promise.all(userPromises)
      const itemResults = await Promise.all(itemPromises)

      const userDetailsMap: { [key: string]: User } = {}
      userResults.forEach((result) => {
        if (result) userDetailsMap[result.uid] = result.data
      })

      const itemDetailsMap: { [key: string]: Item } = {}
      itemResults.forEach((result) => {
        if (result) itemDetailsMap[result.itemId] = result.data
      })

      setUserDetails((prev) => ({ ...prev, ...userDetailsMap }))
      setItemDetails((prev) => ({ ...prev, ...itemDetailsMap }))

      // Sort chats by last message timestamp (most recent first)
      allChats.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp?.toMillis() || 0
        const timeB = b.lastMessage?.timestamp?.toMillis() || 0
        return timeB - timeA
      })

      setChats(allChats)
      setFilteredChats(allChats)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Filter chats based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChats(chats)
      return
    }

    const filtered = chats.filter((chat) => {
      const otherParticipant = chat.participants.find((uid) => uid !== currentUser?.uid)
      const otherPersonName = otherParticipant ? userDetails[otherParticipant]?.name || "" : ""
      const itemName = itemDetails[chat.itemId]?.name || ""
      const lastMessageText = chat.lastMessage?.text || ""

      const searchLower = searchQuery.toLowerCase()
      return (
        otherPersonName.toLowerCase().includes(searchLower) ||
        itemName.toLowerCase().includes(searchLower) ||
        lastMessageText.toLowerCase().includes(searchLower)
      )
    })

    setFilteredChats(filtered)
  }, [searchQuery, chats, userDetails, itemDetails])

  const handleOpenChat = (chat: ChatDoc) => {
    const otherParticipant = chat.participants.find((uid) => uid !== currentUser?.uid)
    const otherPersonName = otherParticipant ? userDetails[otherParticipant]?.name || "Unknown" : "Unknown"
    const itemName = itemDetails[chat.itemId]?.name || "Unknown Item"

    navigation.navigate("Chat", {
      postOwnerId: otherParticipant || "",
      itemId: chat.itemId,
      postOwnerName: otherPersonName,
      itemName: itemName,
    })
  }

  // Format timestamp to readable time
  const formatTime = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return ""

    const date = timestamp.toDate()
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Today, show time
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      // Yesterday
      return "Yesterday"
    } else if (diffDays < 7) {
      // This week, show day name
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      // Older, show date
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  // Get the first letter of a name for the avatar
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?"
  }

  // Truncate message text to a certain length
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const renderChatItem = ({ item: chat }: { item: ChatDoc }) => {
    const otherParticipant = chat.participants.find((uid) => uid !== currentUser?.uid)
    const otherPersonName = otherParticipant ? userDetails[otherParticipant]?.name || "Unknown" : "Unknown"
    const itemName = itemDetails[chat.itemId]?.name || "Unknown Item"
    const lastMessageText = chat.lastMessage?.text || "No messages yet"
    const isMyLastMessage = chat.lastMessage?.senderId === currentUser?.uid

    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => handleOpenChat(chat)} activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          {userDetails[otherParticipant || ""]?.photoURL ? (
            <Image source={{ uri: userDetails[otherParticipant || ""]?.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{getInitial(otherPersonName)}</Text>
            </View>
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{otherPersonName}</Text>
            <Text style={styles.timestamp}>{formatTime(chat.lastMessage?.timestamp)}</Text>
          </View>

          <View style={styles.chatPreview}>
            <Text
              style={[
                styles.messagePreview,
                isMyLastMessage ? styles.myMessage : {},
              ]}
              numberOfLines={1}
            >
              {isMyLastMessage ? "You: " : ""}
              {truncateText(lastMessageText, 30)}
            </Text>
            <Text style={styles.itemName}>{truncateText(itemName, 15)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          {searchQuery ? (
            <>
              <Ionicons name="search" size={50} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>We couldn't find any conversations matching "{searchQuery}"</Text>
            </>
          ) : (
            <>
              <Ionicons name="chatbubble-ellipses-outline" size={50} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtitle}>When you start or receive messages, they'll appear here</Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(chat) => chat.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3765",
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 16,
    color: "#000000",
  },
  chatItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1E3765",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  timestamp: {
    fontSize: 12,
    color: "#8E8E93",
  },
  chatPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  messagePreview: {
    flex: 1,
    fontSize: 14,
    color: "#8E8E93",
  },
  myMessage: {
    fontStyle: "italic",
  },
  itemName: {
    fontSize: 12,
    color: "#8E8E93",
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    paddingHorizontal: 40,
  },
}

