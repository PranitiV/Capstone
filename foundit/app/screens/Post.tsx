import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  Modal,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { MapPin, Calendar, Info, ExternalLink, MessageCircle } from 'lucide-react-native';
import { db } from '../../FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styles from '../styles/Post';
import { InsideTabParamList } from '../../App';

// Type definitions for route params
type PostRouteParams = {
  item: {
    id: string;
    name: string;
    imageUrl: string;
    isValuableItem: boolean;
    description: string;
    location: string;
    locationDescription: string;
    securityQuestion: string;
    securityAnswer: string;
    date: Date;
    type: string;
    postedBy?: string; // Add postedBy for "Chat with Reporter"
  };
};

export default function Post() {
  // Combine navigation & route usage
  const navigation = useNavigation<NavigationProp<InsideTabParamList>>();
  type PostScreenRouteProp = RouteProp<{ params: PostRouteParams }, 'params'>;
  const route = useRoute<PostScreenRouteProp>();
  const { item } = route.params;

  // State for claim logic
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Fetch security details if the item is valuable
  useEffect(() => {
    const fetchSecurityDetails = async () => {
      if (item.isValuableItem) {
        try {
          const docRef = doc(db, 'items', item.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSecurityQuestion(data.securityQuestion);
            setCorrectAnswer(data.securityAnswer);
            setIsClaimed(false);
            setUserAnswer('');
            setIsAnswerCorrect(false);
          } else {
            console.log('No such item exists');
          }
        } catch (error) {
          console.error('Error fetching security details:', error);
        }
      }
    };

    fetchSecurityDetails();
  }, [item.id, item.isValuableItem]);

  // Handle the answer submission for the security question
  const handleAnswerSubmit = () => {
    if (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      setIsAnswerCorrect(true);
      setShowSecurityModal(false);
      setIsClaimed(true);
      handleClaimItem();
    } else {
      Alert.alert('Incorrect Answer', 'The answer you entered is incorrect. Please try again.');
    }
  };

  // If the user tries to claim the item without answering (if valuable)
  const handleClaimPress = () => {
    if (item.isValuableItem && !isAnswerCorrect) {
      setShowSecurityModal(true);
    } else {
      handleClaimItem();
    }
  };

  // Update Firestore to mark item as claimed
  const handleClaimItem = async () => {
    const docRef = doc(db, 'items', item.id);
    await updateDoc(docRef, { type: 'claimed' });
    setIsClaimed(true);
    Alert.alert('Item Claimed', 'You have claimed this item successfully.');
  };

  // Open location in Google Maps if user can view it
  const openInGoogleMaps = () => {
    const [latitude, longitude] = item.location.split(',').map((coord) => coord.trim());
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  // Handle the chat press logic
  const handleChatPress = () => {
    if (!item?.postedBy) {
      Alert.alert('No Reporter Info', 'This item does not have a postedBy field. Cannot chat.');
      return;
    }
    console.log("DEBUG: Full item in Post.tsx =", item);
    console.log("DEBUG: Navigating to Chat with postOwnerId =", item.postedBy);
    console.log("DEBUG: Navigating to Chat with itemId =", item.id);

    navigation.navigate('Chat', {
      postOwnerId: item.postedBy,
      itemId: item.id,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        </View>

        <View style={styles.content}>
          {/* Description Section */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description: </Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          {/* Valuable Item Logic */}
          {item.isValuableItem && securityQuestion && !isAnswerCorrect && !isClaimed && (
            <View style={styles.disclaimerContainer}>
              <View style={styles.disclaimerContent}>
                <Text style={styles.disclaimerText}>
                  This is a valuable item. The location will be revealed once the
                  security question is answered. Click on claim to answer.
                </Text>
                <TouchableOpacity onPress={() => setShowInfo(!showInfo)} style={styles.infoIcon}>
                  <Info size={20} color="#636363" />
                </TouchableOpacity>
              </View>
              {showInfo && (
                <Text style={styles.infoText}>
                  This helps ensure the item is returned safely to its rightful owner.
                </Text>
              )}
            </View>
          )}

          {/* Location Section (if security Q answered or item not valuable) */}
          {isAnswerCorrect && (isClaimed || !item.isValuableItem) && (
            <View style={styles.infoContainer}>
              <MapPin size={20} color="#4a4a4a" />
              <Text style={styles.infoLabel}>Location: </Text>
              <TouchableOpacity onPress={openInGoogleMaps}>
                <Text style={styles.mapLink}>
                  <Text>Open in Google Maps </Text>
                  <ExternalLink size={18} color="#007AFF" />
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Date */}
          <View style={styles.infoContainer}>
            <Calendar size={20} color="#4a4a4a" />
            <Text style={styles.infoLabel}>Date: </Text>
            <Text style={styles.infoText}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>

          {/* Claim Button */}
          {!isClaimed && (
            <TouchableOpacity style={styles.claimButton} onPress={handleClaimPress}>
              <Text style={styles.claimButtonText}>Claim Item</Text>
            </TouchableOpacity>
          )}

          {/* Chat with Reporter Button */}
          <TouchableOpacity style={styles.claimButton} onPress={handleChatPress}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MessageCircle size={24} color="#3b3b3b" />
              <Text style={styles.claimButtonText}>Chat with Reporter</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for security question/answer */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSecurityModal}
        onRequestClose={() => setShowSecurityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.securityQuestion}>{securityQuestion}</Text>
            <TextInput
              style={styles.securityAnswerInput}
              placeholder="Enter your answer"
              value={userAnswer}
              onChangeText={setUserAnswer}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleAnswerSubmit}>
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSecurityModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
