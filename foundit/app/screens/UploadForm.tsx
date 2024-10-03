import React, { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, Image, Alert, TextInput, ScrollView, Button, SafeAreaView, Dimensions } from 'react-native';
import { storage, db } from '../../FirebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/core';
import styles from '../styles/Camera';
import { CircleX as Cancel } from 'lucide-react-native';
import { getAuth } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';


export default function UploadForm({ capturedImage, reloadPage }: { capturedImage: any, reloadPage: () => void }) {
    const navigation = useNavigation();
    const [uploading, setUploading] = useState(false);
    const [itemName, setItemName] = useState('');
    const [itemLocation, setItemLocation] = useState('');
    const [itemDescription, setItemDescription] = useState('');

    if (capturedImage.capturedImage) {
        capturedImage = capturedImage.capturedImage;
    }
    const uploadData = async () => {
        if (!capturedImage) {
            Alert.alert('Error', 'No image to upload');
            return;
        }

        if (!itemName || !itemLocation || !itemDescription) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setUploading(true);

        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                Alert.alert('Error', 'You must be logged in to post an item');
                return;
            }

            const response = await fetch(capturedImage);
            const blob = await response.blob();
            const filename = capturedImage.substring(capturedImage.lastIndexOf('/') + 1);
            const storageRef = ref(storage, `images/${filename}`);

            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            const docRef = await addDoc(collection(db, "items"), {
                name: itemName,
                location: itemLocation,
                description: itemDescription,
                imageUrl: downloadURL,
                createdAt: new Date(),
                postedBy: currentUser.uid
            });

            console.log('Document written with ID: ', docRef.id);
            Alert.alert('Item reported', 'Thank you for reporting a missing item', [{ text: 'OK', onPress: () => reloadPage() }]);

            setItemName('');
            setItemLocation('');
            setItemDescription('');
        } catch (error) {
            console.error('Error uploading data:', error);
            Alert.alert('Error', 'Failed to upload data');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.cancelContainer}>
                <TouchableOpacity style={styles.flipButton} onPress={() => navigation.goBack()}>
                    <Cancel size={30} color='white' />
                </TouchableOpacity>
            </View>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Item Name"
                    value={itemName}
                    onChangeText={setItemName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Where did you find it?"
                    value={itemLocation}
                    onChangeText={setItemLocation}
                />
                <Text style={styles.label}>Where did you find it?</Text>
                        <Picker
                            selectedValue={itemLocation}
                            onValueChange={(itemValue) => setItemLocation(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Bahen" value="Bahen" />
                            <Picker.Item label="Sanford Fleming" value="Sanford Fleming" />
                            <Picker.Item label="Myhall" value="Myhall" />
                            <Picker.Item label="Other" value="Other" />
                        </Picker>
                <TextInput
                    style={styles.input}
                    placeholder="Description"
                    value={itemDescription}
                    onChangeText={setItemDescription}
                    multiline
                />
                <TouchableOpacity style={styles.button} onPress={uploadData} disabled={uploading}>
                    <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Upload'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Upload')}>
                    <Text style={styles.buttonText}>Take Another Picture</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}
