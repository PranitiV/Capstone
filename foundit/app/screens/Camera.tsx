import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Button, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { storage } from '../../FirebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function CameraComponent() {
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraType, setCameraType] = useState<CameraType>('back');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const cameraRef = useRef<CameraView>();

    const takePicture = async () => {
        if (!cameraRef.current) {
            Alert.alert('Error', 'Camera is not ready');
            return;
        }
        try {
            const photo = await cameraRef.current.takePictureAsync();
            console.log('Photo taken:', photo);
            setCapturedImage(photo?.uri);
        } catch (error) {
            console.error('Failed to take picture:', error);
            Alert.alert('Error', 'Failed to take picture');
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

    const uploadImage = async () => {
        if (!capturedImage) {
            Alert.alert('Error', 'No image to upload');
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

            console.log('File uploaded successfully');
            Alert.alert('Success', 'Image uploaded to Firebase!');
            console.log('Download URL:', downloadURL);

            // Here you can save the downloadURL to your database if needed
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            {capturedImage ? (
                <View style={styles.capturedImageContainer}>
                    <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
                    <TouchableOpacity style={styles.button} onPress={() => setCapturedImage(null)}>
                        <Text style={styles.buttonText}>Take Another Picture</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={uploadImage} disabled={uploading}>
                        <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Upload to Firebase'}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <CameraView style={styles.camera} facing={cameraType} ref={cameraRef}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
                            <Text style={styles.buttonText}>Flip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={takePicture}>
                            <Text style={styles.buttonText}>Click!</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-around',
        margin: 20,
    },
    button: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 15,
        borderRadius: 15,
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
    },
    capturedImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    capturedImage: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },
});
