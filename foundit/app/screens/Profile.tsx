"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  FlatList,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native"
import { FIREBASE_AUTH, db, storage } from "../../FirebaseConfig"
import type { User } from "firebase/auth"
import { signOut } from "firebase/auth"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import type { LostItem } from "./Home"
import { doc, setDoc, getDoc } from "firebase/firestore"
import * as ImagePicker from "expo-image-picker"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Ionicons } from "@expo/vector-icons"

import styles from "../styles/Profile"

const { width } = Dimensions.get("window")

const Profile = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [userItems, setUserItems] = useState<LostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [settingsModalVisible, setSettingsModalVisible] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser
    if (currentUser) {
      setUser(currentUser)
      fetchUserData(currentUser.uid)
      fetchUserItems(currentUser.uid)
    }
  }, [])

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setName(userData.name || "")
        setUsername(userData.username || "")
        setImage(userData.profilePicture || null)
      }
    } catch (error) {
      console.error("Error fetching user data: ", error)
    }
  }

  const fetchUserItems = async (uid: string) => {
    setLoading(true)
    try {
      const q = query(collection(db, "items"), where("postedBy", "==", uid))
      const querySnapshot = await getDocs(q)
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LostItem[]
      setUserItems(items)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      const uri = result.assets[0].uri
      setImage(uri)
      uploadImage(uri)
    }
  }

  const uploadImage = async (uri: string) => {
    try {
      const response = await fetch(uri)
      const blob = await response.blob()
      const userId = FIREBASE_AUTH.currentUser?.uid

      if (userId) {
        const storageRef = ref(storage, `users/${userId}/profilePicture.jpg`)
        await uploadBytes(storageRef, blob)
        const url = await getDownloadURL(storageRef)
        const userRef = doc(db, "users", userId)
        await setDoc(userRef, { profilePicture: url }, { merge: true })
        Alert.alert("Success", "Profile picture uploaded successfully.")
      } else {
        Alert.alert("Error", "User not authenticated.")
      }
    } catch (error) {
      console.error("Error uploading image: ", error)
      Alert.alert("Upload Error", "There was an error uploading your image.")
    }
  }

  const handleSaveProfile = async () => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid)
        await setDoc(
          userRef,
          {
            name: name,
            username: username,
          },
          { merge: true },
        )
        Alert.alert("Success", "Profile updated successfully.")
        setEditModalVisible(false)
      } catch (error) {
        console.error("Error updating profile: ", error)
        Alert.alert("Error", "Failed to update profile. Please try again.")
      }
    }
  }

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!")
      return
    }

    const user = FIREBASE_AUTH.currentUser
    if (user && currentPassword) {
      const credentials = EmailAuthProvider.credential(user.email!, currentPassword)
      try {
        await reauthenticateWithCredential(user, credentials)
        await updatePassword(user, newPassword)
        Alert.alert("Success", "Your password has been changed.")
        setPasswordModalVisible(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } catch (error) {
        console.error("Password Change Error", error)
        Alert.alert("Error", "Password change failed. Make sure your current password is correct.")
      }
    }
  }

  const logOut = () => {
    Alert.alert("LOG OUT", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log out",
        onPress: async () => {
          try {
            await signOut(FIREBASE_AUTH)
            navigation.replace("Login")
          } catch (error) {
            console.error("Sign Out Error", error)
          }
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerButtons}>
        <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.iconButton}>
          <Ionicons name="pencil" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSettingsModalVisible(true)} style={styles.iconButton}>
          <Ionicons name="settings" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image source={image ? { uri: image } : require("../../assets/placeholder.png")} style={styles.avatar} />
          <View style={styles.cameraButton}>
            <Ionicons name="camera" size={20} color="#ffffff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.username}>@{username}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{name}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.postedItemsSection}>
        <Text style={styles.sectionTitle}>Your Posted Items</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : userItems.length > 0 ? (
          <FlatList
            data={userItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <View style={styles.itemLocationWrapper}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.itemLocation}>{item.location}</Text>
                </View>
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#4F46E5" />
            <Text style={styles.emptyStateText}>You have not posted any items yet.</Text>
            <TouchableOpacity style={styles.createPostButton}>
              <Text style={styles.createPostButtonText}>Report a missing item?</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#4F46E5" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#444444"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor="#444444"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#4F46E5" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingsOptions}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => {
                  setSettingsModalVisible(false)
                  setPasswordModalVisible(true)
                }}
              >
                <Ionicons name="key-outline" size={24} color="#4F46E5" style={styles.settingsIcon} />
                <Text style={styles.settingsButtonText}>Change Password</Text>
                <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.settingsButton, styles.logoutButton]} onPress={logOut}>
                <Ionicons name="log-out-outline" size={24} color="#e74c3c" style={styles.settingsIcon} />
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color="#4F46E5" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor="#444444"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#444444"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor="#444444"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={changePassword} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

export default Profile


