import React, { useState, useRef } from 'react';
import {View,Text, TextInput, TouchableOpacity, Image, ScrollView, Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Image as ImageIcon, MapPin } from 'lucide-react-native';
import { storage, db } from '../../FirebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import styles from '../styles/UploadForm'

export default function ReportLostItem() {
  const [image, setImage] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemLocation, setItemLocation] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(newLocation);
      setItemLocation(`${newLocation.latitude.toFixed(6)}, ${newLocation.longitude.toFixed(6)}`);
      setShowMap(true);
    } catch (error) {
      Alert.alert('Error getting location', error.message);
    }
  };

  const handleMarkerDrag = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCurrentLocation({ latitude, longitude });
    setItemLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
  };

  const handleSubmit = async () => {
    if (!image || !itemName || !itemLocation || !itemDescription) {
      Alert.alert('Error', 'Please fill in all fields and upload an image');
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

      const response = await fetch(image);
      const blob = await response.blob();
      const filename = `lost_item_${Date.now()}`;
      const storageRef = ref(storage, `images/${filename}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "items"), {
        name: itemName,
        location: itemLocation,
        description: itemDescription,
        imageUrl: downloadURL,
        createdAt: new Date(),
        postedBy: currentUser.uid
      });

      Alert.alert('Success', 'Item reported successfully!');
      
      // Reset form
      setImage(null);
      setItemName('');
      setItemLocation('');
      setItemDescription('');
      setCurrentLocation(null);
    } catch (error) {
      console.error('Error uploading data:', error);
      Alert.alert('Error', 'Failed to upload data');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {image ? (
          <View>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <ImageIcon color="#9CA3AF" size={48} />
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>Upload a file</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Text style={styles.imageButtonText}>Take a picture</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.imagePlaceholderText}>PNG, JPG, GIF up to 10MB</Text>
          </View>
        )}
      </View>

      <Text style={styles.label}>Item Name</Text>
      <TextInput
        style={styles.input}
        value={itemName}
        onChangeText={setItemName}
        placeholder="Enter item name"
      />

      <Text style={styles.label}>Where did you find this item?</Text>
      <View style={styles.locationContainer}>
        <TextInput
          style={[styles.input, styles.locationInput]}
          value={itemLocation}
          onChangeText={setItemLocation}
          placeholder="Enter location"
          placeholderTextColor="#A0A0A0"
        />
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={getCurrentLocation}
        >
          <MapPin color="#3b3b3b" size={18} />
          <Text style={styles.locationButtonText}>Use Current Location</Text>
        </TouchableOpacity>
      </View>

      {showMap && currentLocation && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              ...currentLocation,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={currentLocation}
              draggable
              onDragEnd={handleMarkerDrag}
            />
          </MapView>
          <Text style={styles.mapHint}>Drag the marker to adjust location</Text>
        </View>
      )}


      <Text style={styles.label}>Item Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={itemDescription}
        onChangeText={setItemDescription}
        placeholder="Enter item description"
        multiline
      />

      <TouchableOpacity
        style={[styles.submitButton, uploading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={uploading}
      >
        <Text style={styles.submitButtonText}>
          {uploading ? 'Uploading...' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}