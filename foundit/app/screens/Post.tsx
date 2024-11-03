import React from 'react';
import { View, Text, Image, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../styles/Post';
import { MapPin, Calendar, MessageCircle } from 'lucide-react-native';

export default function Post() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params; 

  const handleChatPress = () => {
    //Chat feature implementation
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.name}</Text>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
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
        <TouchableOpacity style={styles.chatButton} onPress={() => console.log('Chat button pressed')}>
          <MessageCircle size={24} color="#3b3b3b" />
          <Text style={styles.chatButtonText}>Chat with Reporter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
