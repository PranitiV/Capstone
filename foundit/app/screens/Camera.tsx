import React, { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, Alert, Button, SafeAreaView } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { SwitchCamera as Flip, CircleX as Cancel } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/core';
import styles from '../styles/Camera'
import UploadForm from './UploadForm';

export default function CameraComponent() {
    const navigation = useNavigation();
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraType, setCameraType] = useState<CameraType>('front');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
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

    const toggleCameraType = () => {
        setCameraType(current =>
            current === 'back' ? 'front' : 'back'
        );
    };

    function reloadPage() {
        setCapturedImage(null);
    }

    if (!permission?.granted || permission === null) {
        return (
            <View>
                <Text>No access to camera</Text>
                <Button title="Request Permissions" onPress={() => requestPermission()}></Button>
            </View>
        )

    }

    if (capturedImage) {
        return (
            <UploadForm capturedImage={capturedImage} reloadPage={() => reloadPage()} />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.cameraContainer}>
                <CameraView style={styles.camera} facing={cameraType} ref={cameraRef}>
                    <View style={styles.cancelContainer}>
                        <TouchableOpacity style={styles.flipButton} onPress={() => navigation.goBack()}>
                            <Cancel size={30} color='white' />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
                            <Flip size={30} color='white' />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.captureButtonContainer}>
                        <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
        </SafeAreaView >
    );
}
