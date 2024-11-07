import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Home';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Animated, TextInput, StatusBar, ActivityIndicator } from 'react-native';
import { MapPin, Calendar, Search, Plus, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchPosts } from '../services/imageService';
import CachedImage from 'expo-cached-image';

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
  const [searchTerm, setSearchTerm] = useState("");
  const searchInput = useRef("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const fetchedPosts = await fetchPosts(searchTerm);
        setLostItems(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [searchTerm]);

  const handleSearchChange = (text: string) => {
    searchInput.current = text;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      setSearchTerm(searchInput.current);
    }, 400); // Debounce delay
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    Animated.timing(animatedHeight, {
      toValue: isSearchVisible ? 0 : 50,
      duration: 700,
      useNativeDriver: false,
    }).start();
  };
  
  const ItemCard = React.memo(({ item }: { item: LostItem }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <TouchableOpacity onPress={() => navigation.navigate('Post', { item })} style={styles.card}>
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            {!imageLoaded && (
              <View style={styles.imagePlaceholder}>
                <ActivityIndicator size="small" color="#0000ff" />
              </View>
            )}
            <CachedImage 
              source={{uri: item.imageUrl || 'https://via.placeholder.com/200'}}
              cacheKey={`${item.id}-thumb`}
              style={[styles.image, !imageLoaded && styles.hiddenImage]}
              onLoad={() => setImageLoaded(true)}
            />
          </View>

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
      </TouchableOpacity>
    );
  });

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
            onChangeText={handleSearchChange}
          />
        )}
      </Animated.View>
      <StatusBar barStyle="dark-content" />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b3b3b" />
          <Text style={styles.loadingText}>Loading items...</Text>
        </View>
      ) : (
        <FlatList
          data={lostItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ItemCard item={item} />}
          contentContainerStyle={styles.list}
        />
      )}
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