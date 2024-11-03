import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Home';
import * as ImagePicker from 'expo-image-picker';
import UploadForm from './UploadForm';
import { View, Text, FlatList, Image, SafeAreaView, TouchableOpacity, Animated, TextInput, StatusBar, Alert } from 'react-native';
import { MapPin, Calendar, Search, Plus, User, Camera, Image as ImageIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchPosts } from '../services/imageService';

export interface LostItem {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  location: string;
  date: Date;
  type: string;
}

export default function LostAndFoundApp() {
  const navigation = useNavigation();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [pickedImage, setPickedImage] = useState<string | null>();

  const animation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await fetchPosts();
        setLostItems(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    };

    loadPosts();
  }, []);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    Animated.timing(animatedHeight, {
      toValue: isSearchVisible ? 0 : 50,
      duration: 700,
      useNativeDriver: false,
    }).start();
  };

  const toggleFab = () => {
    const toValue = isFabOpen ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setIsFabOpen(!isFabOpen);
  };

  if (pickedImage) {
    navigation.navigate('UploadForm' as never); 
  }

  const ItemCard = ({ item }: { item: LostItem }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/200' }} style={styles.image}
      />

      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name || 'Unknown Item'}</Text>

        <Text style={styles.description} numberOfLines={2}>{item.description || 'No description available'}</Text>

        <View style={styles.infoContainer}>
          <MapPin size={16} color="#666" />
          <Text style={styles.infoText}>{item.location || 'Unknown Location'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Calendar size={16} color="#666" />
          <Text style={styles.infoText}>{new Date(item.date).toLocaleDateString() || 'Unknown Date'}</Text>
        </View>
      </View>

      <View style={[styles.badge, item.type === 'lost' ? styles.lostBadge : styles.foundBadge]}>
        <Text style={styles.badgeText}>{item.type || 'Unknown Type'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>foundIt</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={toggleSearch}>
            <Search size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Profile')}>
            <User size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <Animated.View style={[styles.searchBox, { height: animatedHeight }]}>
        {isSearchVisible && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999"
          />
        )}
      </Animated.View>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={lostItems}
        renderItem={({ item }) => <ItemCard item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
      <View style={styles.reportContainer}>
        <Text style={styles.reportText}>Report a missing item</Text>
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => navigation.navigate('UploadForm')}
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
