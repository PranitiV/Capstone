"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  Animated,
  Keyboard,
  Pressable,
} from "react-native"
import { db, FIREBASE_AUTH } from "../../FirebaseConfig"
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDoc,
  setDoc,
  type Timestamp,
  updateDoc,
} from "firebase/firestore"
import { Ionicons } from "@expo/vector-icons"

interface Message {
  id: string
  text: string
  senderId: string
  createdAt: Timestamp
  status?: "sent" | "delivered" | "read"
  reactions?: { [key: string]: string }
  imageUrl?: string
  audioUrl?: string
}

interface ChatScreenProps {
  route: any 
  navigation: any
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const currentUser = FIREBASE_AUTH.currentUser
  const flatListRef = useRef<FlatList>(null)
  const inputRef = useRef<TextInput>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Grab the critical pieces of data from route.params
  const { postOwnerId, itemId, postOwnerName = "User", itemName = "Item" } = route.params || {}

  const [chatId, setChatId] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [attachmentType, setAttachmentType] = useState<"none" | "image" | "audio">("none")

  // Animation values
  const inputHeight = useRef(new Animated.Value(50)).current
  const attachmentMenuHeight = useRef(new Animated.Value(0)).current

  const createOrFetchChat = useCallback(async () => {
    if (!currentUser || !postOwnerId) {
      console.log("DEBUG: Missing currentUser or postOwnerId")
      return
    }

    try {
      // 1. Sort the user IDs for a stable, consistent order
      const sortedUids = [currentUser.uid, postOwnerId].sort()
      const stableChatId = [itemId, sortedUids[0], sortedUids[1]].join("_")

      console.log("DEBUG: stableChatId =", stableChatId)

      // 2. Check if the doc exists in /chats/{stableChatId}
      const chatDocRef = doc(db, "chats", stableChatId)
      const chatDocSnap = await getDoc(chatDocRef)

      // 3. If no doc, create one
      if (!chatDocSnap.exists()) {
        console.log("DEBUG: chat doc does NOT exist -> creating")
        await setDoc(chatDocRef, {
          participants: sortedUids,
          itemId: itemId,
          createdAt: serverTimestamp(),
          typingUsers: {},
        })
      } else {
        console.log("DEBUG: chat doc already exists")
      }

      setChatId(stableChatId)

      // Set up typing indicator listener
      onSnapshot(chatDocRef, (doc) => {
        const data = doc.data()
        if (data && data.typingUsers && data.typingUsers[postOwnerId]) {
          setOtherUserTyping(true)
        } else {
          setOtherUserTyping(false)
        }
      })
    } catch (error) {
      console.log("Error in createOrFetchChat:", error)
    }
  }, [currentUser, postOwnerId, itemId])

  // On mount, call createOrFetchChat
  useEffect(() => {
    createOrFetchChat()

    // Keyboard listeners for adjusting the UI
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      flatListRef.current?.scrollToEnd({ animated: true })
    })

    return () => {
      keyboardDidShowListener.remove()
      // Clear typing indicator when leaving
      if (chatId && currentUser) {
        updateTypingStatus(false)
      }
    }
  }, [createOrFetchChat])

  // Once we have chatId, set up real-time listener
  useEffect(() => {
    if (!chatId) {
      console.log("DEBUG: No chatId yet -> skip onSnapshot")
      return
    }

    setLoading(true)
    const messagesQuery = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"))

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const newMessages: Message[] = []
        snapshot.forEach((doc) => {
          newMessages.push({ id: doc.id, ...doc.data() } as Message)
        })
        console.log("DEBUG: Received", newMessages.length, "messages")
        setMessages(newMessages)
        setLoading(false)

        // Mark messages as read
        markMessagesAsRead(newMessages)

        // Scroll to bottom when new messages arrive
        if (newMessages.length > 0) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true })
          }, 100)
        }
      },
      (err) => {
        console.log("DEBUG: onSnapshot error:", err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [chatId])

  // Mark messages from other user as read
  const markMessagesAsRead = async (msgs: Message[]) => {
    if (!currentUser || !chatId) return

    const unreadMessages = msgs.filter((msg) => msg.senderId !== currentUser.uid && msg.status !== "read")

    for (const msg of unreadMessages) {
      try {
        const messageRef = doc(db, "chats", chatId, "messages", msg.id)
        await updateDoc(messageRef, { status: "read" })
      } catch (error) {
        console.log("Error marking message as read:", error)
      }
    }
  }

  // Update typing status
  const updateTypingStatus = async (isTyping: boolean) => {
    if (!currentUser || !chatId) return

    try {
      const chatRef = doc(db, "chats", chatId)
      const chatDoc = await getDoc(chatRef)

      if (chatDoc.exists()) {
        const data = chatDoc.data()
        const typingUsers = data.typingUsers || {}

        if (isTyping) {
          typingUsers[currentUser.uid] = true
        } else {
          delete typingUsers[currentUser.uid]
        }

        await updateDoc(chatRef, { typingUsers })
      }
    } catch (error) {
      console.log("Error updating typing status:", error)
    }
  }

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      updateTypingStatus(true)
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      updateTypingStatus(false)
    }, 3000)
  }

  // Handle input focus
  const handleInputFocus = () => {
    setShowEmojiPicker(false)
    Animated.timing(inputHeight, {
      toValue: 50,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  // Toggle emoji picker
  const toggleEmojiPicker = () => {
    Keyboard.dismiss()
    setShowEmojiPicker(!showEmojiPicker)
    Animated.timing(inputHeight, {
      toValue: showEmojiPicker ? 50 : 200,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  // Add reaction to message
  const addReaction = async (messageId: string, reaction: string) => {
    if (!currentUser || !chatId) return

    try {
      const messageRef = doc(db, "chats", chatId, "messages", messageId)
      const messageDoc = await getDoc(messageRef)

      if (messageDoc.exists()) {
        const data = messageDoc.data()
        const reactions = data.reactions || {}

        // Toggle reaction
        if (reactions[currentUser.uid] === reaction) {
          delete reactions[currentUser.uid]
        } else {
          reactions[currentUser.uid] = reaction
        }

        await updateDoc(messageRef, { reactions })
      }

      setSelectedMessage(null)
    } catch (error) {
      console.log("Error adding reaction:", error)
    }
  }

  // Sending a new message
  const sendMessage = async () => {
    if (!inputText.trim() || !currentUser || !chatId) return

    try {
      const messagesRef = collection(db, "chats", chatId, "messages")
      await addDoc(messagesRef, {
        text: inputText,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        status: "sent",
      })
      setInputText("")

      // Update typing status
      setIsTyping(false)
      updateTypingStatus(false)

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    } catch (error) {
      console.log("Error sending message:", error)
    }
  }

  // Format timestamp to readable time
  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return ""

    const date = timestamp.toDate()
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Check if we should show the date for this message
  const shouldShowDate = (message: Message, index: number) => {
    if (index === 0) return true

    if (!message.createdAt || !messages[index - 1].createdAt) return false

    const currentDate = message.createdAt.toDate().toDateString()
    const prevDate = messages[index - 1].createdAt.toDate().toDateString()

    return currentDate !== prevDate
  }

  // Format date header
  const formatDateHeader = (timestamp: Timestamp) => {
    if (!timestamp) return ""

    const date = timestamp.toDate()
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    }
  }

  // Check if message is from the same sender as the previous one
  const isFromSameSender = (message: Message, index: number) => {
    if (index === 0) return false
    return message.senderId === messages[index - 1].senderId
  }

  // Render message status indicator
  const renderMessageStatus = (message: Message) => {
    if (message.senderId !== currentUser?.uid) return null

    let iconName = "checkmark"
    let iconColor = "#8E8E93"

    if (message.status === "delivered") {
      iconName = "checkmark-done"
      iconColor = "#8E8E93"
    } else if (message.status === "read") {
      iconName = "checkmark-done"
      iconColor = "#34C759"
    }

    return <Ionicons name={iconName} size={12} color={iconColor} style={styles.statusIcon} />
  }

  // Render reactions for a message
  const renderReactions = (message: Message) => {
    if (!message.reactions || Object.keys(message.reactions).length === 0) return null

    const reactionCounts: { [key: string]: number } = {}

    // Count reactions
    Object.values(message.reactions).forEach((reaction) => {
      reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1
    })

    return (
      <View style={styles.reactionsContainer}>
        {Object.entries(reactionCounts).map(([reaction, count]) => (
          <View key={reaction} style={styles.reactionBubble}>
            <Text style={styles.reactionEmoji}>{reaction}</Text>
            {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
          </View>
        ))}
      </View>
    )
  }

  // Render reaction picker
  const renderReactionPicker = (messageId: string) => {
    if (selectedMessage !== messageId) return null

    const reactions = ["❤️", "👍", "😂", "😮", "😢", "🔥"]

    return (
      <View style={styles.reactionPickerContainer}>
        {reactions.map((reaction) => (
          <TouchableOpacity
            key={reaction}
            style={styles.reactionPickerItem}
            onPress={() => addReaction(messageId, reaction)}
          >
            <Text style={styles.reactionPickerEmoji}>{reaction}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  // Render each message bubble
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === currentUser?.uid
    const showDate = shouldShowDate(item, index)
    const sameSender = isFromSameSender(item, index)

    return (
      <>
        {showDate && item.createdAt && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDateHeader(item.createdAt)}</Text>
          </View>
        )}

        {renderReactionPicker(item.id)}

        <Pressable
          style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}
          onLongPress={() => setSelectedMessage(item.id)}
        >
          {!isMe && !sameSender && (
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{postOwnerName.charAt(0)}</Text>
              </View>
            </View>
          )}

          {!isMe && sameSender && <View style={styles.avatarPlaceholder} />}

          <View
            style={[
              styles.messageBubble,
              isMe ? styles.myMessageBubble : styles.theirMessageBubble,
              sameSender ? (isMe ? styles.myMessageBubbleConnected : styles.theirMessageBubbleConnected) : {},
            ]}
          >
            {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.messageImage} resizeMode="cover" />}

            {item.audioUrl && (
              <View style={styles.audioContainer}>
                <Ionicons name="play" size={20} color={isMe ? "#FFFFFF" : "#000000"} />
                <View style={styles.audioWaveform}>
                  {[...Array(15)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.audioBar,
                        {
                          height: 5 + Math.random() * 15,
                          backgroundColor: isMe ? "#FFFFFF" : "#000000",
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.audioDuration, isMe ? styles.myMessageText : styles.theirMessageText]}>0:12</Text>
              </View>
            )}

            {item.text && (
              <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                {item.text}
              </Text>
            )}

            <View style={styles.messageFooter}>
              {item.createdAt && (
                <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
                  {formatTime(item.createdAt)}
                </Text>
              )}
              {renderMessageStatus(item)}
            </View>
          </View>
        </Pressable>

        {renderReactions(item)}
      </>
    )
  }

  // Render emoji picker
  const renderEmojiPicker = () => {
    if (!showEmojiPicker) return null

    const emojis = ["😀", "😂", "😍", "🥰", "😎", "🤔", "👍", "❤️", "🔥", "👏", "🙏", "🎉"]

    return (
      <Animated.View style={[styles.emojiPicker, { height: inputHeight }]}>
        <View style={styles.emojiGrid}>
          {emojis.map((emoji) => (
            <TouchableOpacity key={emoji} style={styles.emojiItem} onPress={() => setInputText((prev) => prev + emoji)}>
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    )
  }

  // Loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  // Main chat UI
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerContent}
          onPress={() => {
            // Navigate to user profile or item details
          }}
        >
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{postOwnerName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{postOwnerName}</Text>
            <Text style={styles.headerSubtitle}>{otherUserTyping ? "Typing..." : `About: ${itemName}`}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Message list */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(msg) => msg.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Emoji picker */}
        {renderEmojiPicker()}

        {/* Input area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text)
                handleTyping()
              }}
              placeholder="Message"
              multiline
              maxLength={500}
              onFocus={handleInputFocus}
            />
          </View>

          <TouchableOpacity style={styles.emojiButton} onPress={toggleEmojiPicker}>
            <Ionicons name="happy-outline" size={32} color="#1E3765" />
          </TouchableOpacity>

          
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = {
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 5,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E3765",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#8E8E93",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  messagesList: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  messagesContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  dateContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  dateText: {
    fontSize: 12,
    color: "#8E8E93",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: "hidden",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 2,
    maxWidth: "80%",
  },
  myMessageRow: {
    alignSelf: "flex-end",
  },
  theirMessageRow: {
    alignSelf: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: "flex-end",
    width: 28,
    height: 28,
  },
  avatarPlaceholder: {
    width: 28,
    marginRight: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1E3765",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "100%",
  },
  myMessageBubble: {
    backgroundColor: "#rgba(16, 49, 142, 0.5)",
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: "#E5E5EA",
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
  },
  myMessageBubbleConnected: {
    borderTopRightRadius: 4,
  },
  theirMessageBubbleConnected: {
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: "#FFFFFF",
  },
  theirMessageText: {
    color: "#000000",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
  },
  myTimeText: {
    color: "rgba(255,255,255,0.7)",
  },
  theirTimeText: {
    color: "#8E8E93",
  },
  statusIcon: {
    marginLeft: 2,
  },
  reactionsContainer: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: -5,
    marginBottom: 5,
  },
  reactionBubble: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginHorizontal: 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 10,
    marginLeft: 2,
    color: "#8E8E93",
  },
  reactionPickerContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 8,
    marginVertical: 5,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reactionPickerItem: {
    marginHorizontal: 8,
  },
  reactionPickerEmoji: {
    fontSize: 20,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  attachButton: {
    padding: 8,
  },
  emojiButton: {
    padding: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#E5E5EA",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginLeft: 8,
    maxHeight: 100,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E3765",
    justifyContent: "center",
    alignItems: "center",
  },
  micButton: {
    padding: 6,
  },
  attachmentMenu: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    paddingVertical: 10,
    paddingHorizontal: 15,
    overflow: "hidden",
  },
  attachmentOption: {
    alignItems: "center",
    marginRight: 20,
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  attachmentText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  emojiPicker: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    padding: 10,
    overflow: "hidden",
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emojiItem: {
    width: "16.66%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 24,
  },
}

export default ChatScreen

