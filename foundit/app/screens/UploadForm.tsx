import React, { useState, useRef, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, Switch} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Image as ImageIcon, MapPin, InfoIcon} from 'lucide-react-native';
import { storage, db } from '../../FirebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import styles from '../styles/UploadForm'
import axios from 'axios';

interface Concept {
  name: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export default function ReportLostItem() {
  const [image, setImage] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemLocation, setItemLocation] = useState('');
  const [itemLocationDescription, setItemLocationDescription] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isValuableItem, setIsValuableItem] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchCaption = async () => {
      if (!image) return;

      try {
        const response = await fetch(image);
        const blob = await response.blob();
        const filename = `lost_item_${Date.now()}`;
        const storageRef = ref(storage, `images/${filename}`);

        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        // Caption generation API call
        const SECOND_PAT = 'f1a8c1317b514ccab0d2c118360a39c5';
        const SECOND_USER_ID = 'salesforce';       
        const SECOND_APP_ID = 'blip';
        const SECOND_MODEL_ID = 'general-english-image-caption-blip';
        const SECOND_MODEL_VERSION_ID = 'cdb690f13e62470ea6723642044f95e4';

        const secondApiResponse = await fetch("https://api.clarifai.com/v2/models/" + SECOND_MODEL_ID + "/versions/" + SECOND_MODEL_VERSION_ID + "/outputs", {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + SECOND_PAT
          },
          body: JSON.stringify({
            "user_app_id": {
              "user_id": SECOND_USER_ID,
              "app_id": SECOND_APP_ID
            },
            "inputs": [
              {
                "data": {
                  "image": {
                    "url": downloadURL
                  }
                }
              }
            ]
          })
        });

        const secondApiData = await secondApiResponse.json();
        const caption = secondApiData.outputs[0].data.text.raw;
        setItemDescription(caption);
      } catch (error) {
        console.error('Error fetching caption:', error);
      }
    };

    fetchCaption();

  }, [image]); 

  useEffect(() => {
    if (currentLocation) {
      getCurrentLocation();
    }
  }, [currentLocation]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
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
      mediaTypes: "images",
      allowsEditing: false,
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

      // Reverse geocoding to get the name of the closest building
      const apiKey = 'AIzaSyAyefh9BC1ct6tgi0YAtEs3iPqp_ZxnCD0';
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLocation.latitude},${newLocation.longitude}&key=${apiKey}`);
      
      if (response.data.status === 'OK') {
        const addressComponents = response.data.results[0].address_components;
        
        // Check for multiple possible location types
        const buildingName = addressComponents.find(component =>
          component.types.includes('premise') || 
          component.types.includes('establishment') ||
          component.types.includes('point_of_interest') ||
          component.types.includes('street_address')
        )?.long_name || response.data.results[0]?.formatted_address || 'Unknown location';

        setItemLocation(buildingName);
      } else {
        Alert.alert('Error', 'Unable to fetch location details');
      }

      setShowMap(true);
    } catch (error) {
      Alert.alert('Error getting location', error.message);
    }
  };


  const handleMarkerDrag = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCurrentLocation({ latitude, longitude });
    
    try {
      // Reverse geocoding for the new marker position
      const apiKey = 'AIzaSyAyefh9BC1ct6tgi0YAtEs3iPqp_ZxnCD0';
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      
      if (response.data.status === 'OK') {
        const addressComponents = response.data.results[0].address_components;
        
        // Check for multiple possible location types
        const buildingName = addressComponents.find(component =>
          component.types.includes('premise') || 
          component.types.includes('establishment') ||
          component.types.includes('point_of_interest') ||
          component.types.includes('street_address')
        )?.long_name || response.data.results[0]?.formatted_address || 'Unknown location';

        setItemLocation(buildingName);
      } else {
        setItemLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (error) {
      // Fallback to coordinates if geocoding fails
      setItemLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      console.error('Error fetching location details:', error);
    }
  };

  const handleSubmit = async () => {
    if (!image || !itemName || !itemLocation || !itemDescription || !itemLocationDescription) {
      Alert.alert('Error', 'Please fill in all fields and upload an image');
      return;
    }

    if (isValuableItem && (!securityQuestion || !securityAnswer)) {
      Alert.alert('Error', 'Please provide a security question and answer for valuable items');
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

      // First API call to Clarifai
      const MODEL_ID = 'general-image-recognition';
      const MODEL_VERSION_ID = 'aa7f35c01e0642fda5cf400f543e7c40';
      const USER_ID = 'clarifai';       
      const APP_ID = 'main';
      const PAT = '3ac3c51554d84b4b8fd79f1c32a6d1d9';

      const clarifaiResponse = await fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Key ' + PAT
        },
        body: JSON.stringify({
          "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
          },
          "inputs": [
            {
              "data": {
                "image": {
                  "url": downloadURL
                }
              }
            }
          ]
        })
      });

      const clarifaiData = await clarifaiResponse.json();
      const concepts = clarifaiData.outputs[0].data.concepts;
      const conceptNames: string[] = concepts.map((concept: Concept) => concept.name);

      // Append Clarifai response to Firestore
      await addDoc(collection(db, "items"), {
        name: itemName,
        location: itemLocation,
        locationDescription: itemLocationDescription,
        description: itemDescription,
        imageUrl: downloadURL,
        createdAt: new Date(),
        postedBy: currentUser.uid,
        isValuableItem,
        securityQuestion: isValuableItem ? securityQuestion : null,
        securityAnswer: isValuableItem ? securityAnswer : null,
        clarifaiData: conceptNames
      });

      Alert.alert('Success', 'Item reported successfully!');
      
      // Reset form
      setImage(null);
      setItemName('');
      setItemLocation('');
      setItemLocationDescription('');
      setItemDescription('');
      setCurrentLocation(null);
      setIsValuableItem(false);
      setSecurityQuestion('');
      setSecurityAnswer('');
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

      <Text style={styles.label}>Location Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={itemLocationDescription}
        onChangeText={setItemLocationDescription}
        placeholder="Provide more details about the location (e.g., near which building, which floor, etc.)"
        multiline
      />

      <Text style={styles.label}>Item Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={itemDescription}
        onChangeText={setItemDescription}
        placeholder="Enter item description"
        multiline
      />

        <View style={styles.switchContainer}>
        <Text style={styles.label}>Is this a valuable item?</Text>
        <View style={styles.switchWrapper}>
          <Switch
            value={isValuableItem}
            onValueChange={setIsValuableItem}
            trackColor={{ false: "#767577", true: "#d4d4d4" }}
            thumbColor={isValuableItem ? "#636363" : "#b4b4b4"}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
        </View>

      {isValuableItem && (
        <View>
          <View style={styles.securityInfoContainer}>
            <Text style={styles.securityInfoText}>
              Consider adding a security question. A person who claims this item will need to answer this question correctly before the location is revealed to them.
            </Text>
            <TouchableOpacity onPress={() => setShowInfo(!showInfo)} style={styles.infoIcon}>
              <InfoIcon size={20} color="#636363" />
            </TouchableOpacity>
          </View>
          {showInfo && (
            <Text style={styles.securityInfoDetails}>
              This helps ensure that the item is returned to its rightful owner. Choose a question that only the true owner would know the answer to.
            </Text>
          )}
          <Text style={styles.label}>Security Question</Text>
          <TextInput
            style={styles.input}
            value={securityQuestion}
            onChangeText={setSecurityQuestion}
            placeholder="Enter a security question"
          />

          <Text style={styles.label}>Security Answer</Text>
          <TextInput
            style={styles.input}
            value={securityAnswer}
            onChangeText={setSecurityAnswer}
            placeholder="Enter the answer to your security question"
            secureTextEntry
          />
        </View>
      )}

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