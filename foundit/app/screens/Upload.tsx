import { Camera } from 'expo-camera'
import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import CameraComponent from './Camera'

const Upload = () => {
    return (
        <View style={styles.container} >
            <CameraComponent />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
export default Upload
