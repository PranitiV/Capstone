import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { fetchPosts } from '../services/imageService';
interface LostItem {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  location: string;
  createdAt: Date;
  //reportedBy: string; need to add this into database
}

const { width } = Dimensions.get('window');

const LostAndFoundApp: React.FC = () => {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const fetchedPosts = await fetchPosts(); // Fetch from Firestore
      setLostItems(fetchedPosts);
      setLoading(false);
    };

    loadPosts();
  }, []);

  const handleContact = (email: string) => {
    Alert.alert(
      'Contact Reporter',
      `Would you like to contact ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => console.log(`Contacting ${email}`) },
      ]
    );
  };

  const renderItem = ({ item }: { item: LostItem }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/300' }}  // Fallback to a placeholder image
        style={styles.image}
      />
      <View style={styles.cardContent}>
        {/* Wrap text content within <Text> components to avoid errors */}
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>Description: {item.description}</Text>
        <Text style={styles.location}>Location: {item.location}</Text>
        <Text style={styles.date}>
          Reported on: {item.createdAt.toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleContact('contact@example.com')}  // Replace with actual contact logic
        >
          <Text style={styles.buttonText}>Contact Reporter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={lostItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 8,
    marginBottom: 6,
  },
});

export default LostAndFoundApp;
