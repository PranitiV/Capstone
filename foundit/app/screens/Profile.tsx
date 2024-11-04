import React, { useState, useEffect } from 'react';
import { Text, View, Button, Alert, Modal, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Image } from 'react-native';
import { FIREBASE_AUTH, db, storage } from '../../FirebaseConfig';
import { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {LostItem} from "./Home";
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from '../styles/Profile';
import placeholder from '../../assets/placeholder.png';


const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false); 
  const [image, setImage] = useState<string | null>(null);

  const [userItems, setUserItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchUserData(currentUser.uid); 
    }
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.name || '');
        setUsername(userData.username || '');
        setImage(userData.profilePicture || null);
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };
  useEffect(() => {
    const fetchUserItems = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(collection(db, 'items'), where('postedBy', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as LostItem[];
        
        setUserItems(items);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserItems();
  }, [user]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri); 

      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const userId = FIREBASE_AUTH.currentUser?.uid;

        if (userId) {
          const storageRef = ref(storage, `users/${userId}/profilePicture.jpg`);
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);
          const userRef = doc(db, 'users', userId);
          await setDoc(userRef, { profilePicture: url }, { merge: true });
          Alert.alert("Success", "Profile picture uploaded successfully.");
        } else {
          Alert.alert("Error", "User not authenticated.");
        }
      } catch (error) {
        console.error("Error uploading image: ", error);
        Alert.alert("Upload Error", "There was an error uploading your image.");
      }
    }
  };

  const logOut = () => {
    Alert.alert("LOG OUT", "Are you sure you want to log out?", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Log out',
        onPress: async () => {
          try {
            await signOut(FIREBASE_AUTH);
          } catch (error) {
            console.error("Sign Out Error", error);
          }
        },
      },
    ]);
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    const user = FIREBASE_AUTH.currentUser;
    if (user && currentPassword) {
      const credentials = EmailAuthProvider.credential(user.email!, currentPassword);
      try {
        await reauthenticateWithCredential(user, credentials);
        await updatePassword(user, newPassword);
        Alert.alert("Success", "Your password has been changed.");
        setModalVisible(false);
      } catch (error) {
        console.error("Password Change Error", error);
        Alert.alert("Error", "Password change failed. Make sure your current password is correct.");
      }
    }
  };

  const handleSaveProfile = async () => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          name: name,
          username: username,
          profilePicture: image,
        }, { merge: true });
        Alert.alert("Success", "Profile updated successfully.");
        setEditModalVisible(false);
      } catch (error) {
        console.error("Error updating profile: ", error);
        Alert.alert("Error", "Failed to update profile. Please try again.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {user && (
        <>
        <TouchableOpacity onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.profilePicture} />
            ) : (
              <Image source={placeholder} style={styles.profilePicture} />
            )}
        </TouchableOpacity>
        {username && <Text style={styles.username}>@{username}</Text>}
        {name && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Name: </Text>
              <Text style={styles.text}>{name}</Text>
            </View>
          )}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email: </Text>
            <Text style={styles.text}>{user.email}</Text>
          </View> 
          <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editButton}>
            <Ionicons name="pencil" size={24} color="black" />
          </TouchableOpacity>

          <Modal
            transparent={true}
            animationType="slide"
            visible={editModalVisible}
            onRequestClose={() => setEditModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#A9A9A9"
                  value={name}
                  onChangeText={setName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor="#A9A9A9"
                  value={username}
                  onChangeText={setUsername}
                />
                <Button title="Save" onPress={handleSaveProfile} />
                <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
              </View>
            </View>
          </Modal>


          <TouchableOpacity onPress={() => setSettingsModalVisible(true)} style={styles.settingsButton}>
            <Ionicons name="settings" size={24} color="black" />
          </TouchableOpacity>


          <Modal
            transparent={true}
            animationType="slide"
            visible={settingsModalVisible}
            onRequestClose={() => setSettingsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Button title="Change Password" onPress={() => {
                  setSettingsModalVisible(false);
                  setModalVisible(true);
                }} />
                <Button title="Log Out" onPress={() => {
                  setSettingsModalVisible(false);
                  logOut();
                }} />
                <Button title="Cancel" onPress={() => setSettingsModalVisible(false)} />
              </View>
            </View>
          </Modal>


          <Modal
            transparent={true}
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current Password"
                  placeholderTextColor="#A9A9A9"
                  secureTextEntry={true}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#A9A9A9"
                  secureTextEntry={true}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#A9A9A9"
                  secureTextEntry={true}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Button title="Submit" onPress={changePassword} />
                <Button title="Cancel" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </Modal>
        </>
      )}

<Text style={styles.header}>Your Posted Items</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text>Error fetching items: {error}</Text>
      ) : userItems.length > 0 ? (
        <FlatList
          data={userItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemLocation}>{item.location}</Text>
              {/* <Text style={styles.itemTimestamp}>Posted on: {new Date(item.timestamp?.seconds * 1000).toLocaleDateString()}</Text> */}
            </View>
          )}
        />
      ) : (
        <Text style={styles.noItemsText}>You have not posted any items yet.</Text>
      )}
    </View>
  );
};

export default Profile;
