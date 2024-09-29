import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, TextInput, ScrollView, Button, SafeAreaView, Dimensions } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { storage, db } from '../../FirebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const CAPTURE_SIZE = Math.floor(WINDOW_HEIGHT * 0.08);

export default function CameraComponent() {
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraType, setCameraType] = useState<CameraType>('front');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [itemName, setItemName] = useState('');
    const [itemLocation, setItemLocation] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const cameraRef = useRef<CameraView>();

    const takePicture = async () => {
        if (!cameraRef.current) {
            Alert.alert('Error', 'Camera is not ready');
            return;
        }
        try {
            const photo = await cameraRef.current.takePictureAsync();
            console.log('Photo taken:', photo);
            photo ? setCapturedImage(photo.uri) : null;
        } catch (error) {
            console.error('Failed to take picture:', error);
            Alert.alert('Error', 'Failed to take picture');
        }
    };

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
                createdAt: new Date()
            });

            console.log('Document written with ID: ', docRef.id);
            Alert.alert('Success', 'Image and data uploaded to Firebase!');

            setCapturedImage(null);
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

    const toggleCameraType = () => {
        setCameraType(current =>
            current === 'back' ? 'front' : 'back'
        );
    };

    if (!permission?.granted || permission === null) {
        return (
            <View>
                <Text>No access to camera</Text>
                <Button title="Request Permissions" onPress={() => requestPermission()}></Button>
            </View>
        )

    }
    return (
        <SafeAreaView style={styles.container}>
            {capturedImage ? (
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
                        <TextInput
                            style={styles.input}
                            placeholder="Description"
                            value={itemDescription}
                            onChangeText={setItemDescription}
                            multiline
                        />
                        <TouchableOpacity style={styles.button} onPress={uploadData} disabled={uploading}>
                            <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Upload to Firebase'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => setCapturedImage(null)}>
                            <Text style={styles.buttonText}>Take Another Picture</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.cameraContainer}>
                    <CameraView style={styles.camera} facing={cameraType} ref={cameraRef}>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
                                <Text style={styles.flipText}>Flip</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.captureButtonContainer}>
                            <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                                <View style={styles.captureInner} />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    cameraContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    flipButton: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 50,
        padding: 10,
        paddingHorizontal: 20,
    },
    flipText: {
        color: 'white',
        fontSize: 16,
    },
    captureButtonContainer: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
    },
    captureButton: {
        width: CAPTURE_SIZE,
        height: CAPTURE_SIZE,
        borderRadius: Math.floor(CAPTURE_SIZE / 2),
        borderWidth: 4,
        borderColor: 'white',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureInner: {
        width: CAPTURE_SIZE - 20,
        height: CAPTURE_SIZE - 20,
        borderRadius: Math.floor((CAPTURE_SIZE - 20) / 2),
        backgroundColor: 'white',
    },
    capturedImage: {
        width: '90%',
        height: 300,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    formContainer: {
        width: '90%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: 'white',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});