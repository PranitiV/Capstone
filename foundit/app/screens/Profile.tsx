import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, Image, Button, Alert, Modal, TextInput, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native'
import { FIREBASE_AUTH, db } from '../../FirebaseConfig'
import { User } from 'firebase/auth'
import { getAuth, signOut } from 'firebase/auth';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore';
import {LostItem} from "./Home"
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import { Ionicons } from '@expo/vector-icons';


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

  const [userItems, setUserItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (currentUser) {
      // console.log('Current user:', currentUser);
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
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };
  useEffect(() => {
    const fetchUserItems = async () => {
      if (!user) return;
      // console.log('User in fetchUserItems:', user.uid);
      setLoading(true);
      try {
        const q = query(collection(db, 'items'), where('postedBy', '==', user.uid));
        const querySnapshot = await getDocs(q);
        // console.log('Query Snapshot: ', querySnapshot.docs);
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
        {username && <Text style={styles.username}>@{username}</Text>}
        {name ? (
          <Text style={styles.text}>
            <Text style={styles.label}>Name: </Text>
            {name}
          </Text>
        ) : null}
        {/* Display the email label in bold and the email in regular */}
        <Text style={styles.text}>
          <Text style={styles.label}>Email: </Text>
          {user.email}
        </Text>  
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  username: {
    fontSize: 32, 
    fontWeight: 'bold',
    marginBottom: 10, 
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold', 
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, // Add horizontal padding for modal content
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20, // Increased padding inside the modal
    borderRadius: 8,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10, // Added more vertical spacing between input fields
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#ccc',
  },
  editButton: {
    position: 'absolute',
    top: 50,
    right: 50,
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 10,
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 15, // More padding for each item in the list
    width: '100%',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5, // Small space between title and description
  },
  itemLocation: {
    fontSize: 14,
    color: '#555',
  },
  noItemsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20, // Added space between the message and the rest of the content
  },
});

export default Profile;
