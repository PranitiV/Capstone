import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Alert, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../styles/Post';
import { MapPin, Calendar, MessageCircle } from 'lucide-react-native';
import { db } from '../../FirebaseConfig';  
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { BlurView } from 'expo-blur';

export default function Post() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params; 

  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  
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

  const handleAnswerSubmit = () => {
    if (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      setIsAnswerCorrect(true);  
    } else {
      Alert.alert('Incorrect Answer', 'The answer you entered is incorrect. Please try again.');
    }
  };

  const handleClaimPress = async () => {
      const docRef = doc(db, 'items', item.id);
      await updateDoc(docRef, { type: 'claimed' });
      Alert.alert('Item Claimed', 'You have claimed this item successfully.');
  };

  const handleChatPress = () => {
    console.log('Chat button pressed');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          {item.isValuableItem && !isAnswerCorrect && (
            <BlurView intensity={80} style={[StyleSheet.absoluteFill, styles.blurView]}>
              <View style={styles.securityQuestionContainer}>
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
              </View>
            </BlurView>
          )}
        </View>

        {(!item.isValuableItem || isAnswerCorrect) && (
          <View style={styles.content}>
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description: </Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            <View style={styles.infoContainer}>
              <MapPin size={20} color="#666" />
              <Text style={styles.infoLabel}>Location: </Text>
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Calendar size={20} color="#666" />
              <Text style={styles.infoLabel}>Date: </Text>
              <Text style={styles.infoText}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity style={styles.claimButton} onPress={handleClaimPress}>
                <Text style={styles.claimButtonText}>Claim Item</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChatPress}>
                <Text style={styles.chatLink}>Chat with Reporter</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


