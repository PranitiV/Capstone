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
  ListRenderItem,
} from 'react-native';
import storage from 'firebase/storage';
import { ref, getDownloadURL } from 'firebase/storage';


interface LostItem {
  id: string;
  name: string;
  imageUrl: string;
  reportedBy: string;
}

const { width } = Dimensions.get('window');

const mockLostItems: LostItem[] = [
  {
    id: '1',
    name: 'Blue Backpack',
    imageUrl: 'https://via.placeholder.com/300',
    reportedBy: 'john@example.com'
  },
  {
    id: '2',
    name: 'Silver Watch',
    imageUrl: 'https://via.placeholder.com/300',
    reportedBy: 'sarah@example.com'
  },
  {
    id: '3',
    name: 'Textbook',
    imageUrl: 'https://via.placeholder.com/300',
    reportedBy: 'mike@example.com'
  },
  {
    id: '4',
    name: 'Umbrella',
    imageUrl: 'https://via.placeholder.com/300',
    reportedBy: 'emma@example.com'
  },
];

const LostAndFoundApp: React.FC = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [lostItems] = useState<LostItem[]>(mockLostItems);

  const handleContact = (email: string) => {
    Alert.alert(
      'Contact Reporter',
      `Would you like to contact ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => console.log(`Contacting ${email}`) }
      ]
    );
  };

  const renderItem: ListRenderItem<LostItem> = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleContact(item.reportedBy)}
        >
          <Text style={styles.buttonText}>Contact Reporter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FoundIt</Text>
        <Text style={styles.headerSubtitle}>Find your lost items or report found ones</Text>
      </View>
      <FlatList
        data={lostItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
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
});

export default LostAndFoundApp;

