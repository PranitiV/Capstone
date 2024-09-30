import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, SafeAreaView, TouchableOpacity, Animated, TextInput, ActivityIndicator, StatusBar } from 'react-native';
import { MapPin, Calendar, Search, Plus, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchPosts } from '../services/imageService';

interface LostItem {
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
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await fetchPosts(); // Fetch from Firestore
        setLostItems(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts: ", error); // Log any errors
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

  const ItemCard = ({ item }: { item: LostItem }) => (
    <View style={styles.card}>
      {/* Image */}
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/200' }} // Fallback image
        style={styles.image}
      />
      
      <View style={styles.cardContent}>
        {/* Name */}
        <Text style={styles.title}>{item.name || 'Unknown Item'}</Text>
  
        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>{item.description || 'No description available'}</Text>
  
        {/* Location with Icon */}
        <View style={styles.infoContainer}>
          <MapPin size={16} color="#666" />
          <Text style={styles.infoText}>{item.location || 'Unknown Location'}</Text>
        </View>
  
        {/* Date with Icon */}
        <View style={styles.infoContainer}>
          <Calendar size={16} color="#666" />
          <Text style={styles.infoText}>{new Date(item.date).toLocaleDateString() || 'Unknown Date'}</Text>
        </View>
      </View>
  
      {/* Badge */}
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
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Upload')}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lostBadge: {
    backgroundColor: '#FFD700',
  },
  foundBadge: {
    backgroundColor: '#90EE90',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchBox: {
    backgroundColor: '#f1f1f1',
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
