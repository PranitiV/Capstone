import React from 'react';
import { View, Text, Image, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import styles from '../styles/Post';
import { MapPin, Calendar, MessageCircle } from 'lucide-react-native';
import { InsideTabParamList } from '../../App';
import { RouteProp } from '@react-navigation/native';

export default function Post() {
  const navigation = useNavigation<NavigationProp<InsideTabParamList>>();
  type PostScreenRouteProp = RouteProp<InsideTabParamList, 'Post'>;
  const route = useRoute<PostScreenRouteProp>();
  const { item } = route.params; 

  const handleChatPress = () => {
    console.log("DEBUG: Full item in Post.tsx =", item);
    console.log("DEBUG: Navigating to Chat with postOwnerId =", item.postedBy);
    console.log("DEBUG: Navigating to Chat with itemId =", item.id);
    navigation.navigate('Chat', {
      postOwnerId: item.postedBy, 
      itemId: item.id,
    });
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
        <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
          <MessageCircle size={24} color="#3b3b3b" />
          <Text style={styles.chatButtonText}>Chat with Reporter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
