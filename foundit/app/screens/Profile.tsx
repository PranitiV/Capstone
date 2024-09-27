import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, Image, Button, Alert, Modal, TextInput } from 'react-native'
import { FIREBASE_AUTH } from '../../FirebaseConfig'
import { User } from 'firebase/auth'
import { getAuth, signOut } from 'firebase/auth';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'


const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      {user && (
        <>
          <Text style={styles.text}>Email: {user.email}</Text>
          <Button title="Change Password" onPress={() => setModalVisible(true)} />
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
                  secureTextEntry={true}
                  value={currentPassword}
                  placeholderTextColor="#333333"
                  onChangeText={setCurrentPassword}
                />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  secureTextEntry={true}
                  value={newPassword}
                  placeholderTextColor="#333333"
                  onChangeText={setNewPassword}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  secureTextEntry={true}
                  value={confirmPassword}
                  placeholderTextColor="#333333"
                  onChangeText={setConfirmPassword}
                />
                <Button title="Submit" onPress={changePassword} />
                <Button title="Cancel" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </Modal>
          <Button title="Log Out" onPress={logOut} />
        </>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 4,
  },
});

export default Profile