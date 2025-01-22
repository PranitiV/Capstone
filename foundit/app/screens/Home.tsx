import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Home';
import { 
  View, 
  Text, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  StatusBar, 
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { MapPin, Calendar, Search, Plus, User, X } from 'lucide-react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { fetchPosts } from '../services/imageService';
import CachedImage from 'expo-cached-image';
import { InsideTabParamList } from '../../App';

const { height } = Dimensions.get('window');

export interface LostItem {
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
  clarifaiData: string[];
  postedBy: string,
}

export default function LostAndFoundApp() {
  const navigation = useNavigation<NavigationProp<InsideTabParamList>>();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions] = useState<string[]>(["bottle", "keys", "wallet"]);
  
  // Animation values
  const animatedTopPosition = useRef(new Animated.Value(0)).current;
  const animatedTitleOpacity = useRef(new Animated.Value(1)).current;
  const animatedSearchScale = useRef(new Animated.Value(1)).current;
  const animatedFontSize = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    if (hasSearched) {
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

      // Animate search container to top
      Animated.parallel([
        Animated.timing(animatedTopPosition, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(animatedTitleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedSearchScale, {
          toValue: 0.9,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(animatedFontSize, {
          toValue: 16,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();

      loadPosts();
    } else {
      // Reset animations when search is cleared
      Animated.parallel([
        Animated.timing(animatedTopPosition, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(animatedTitleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedSearchScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(animatedFontSize, {
          toValue: 30,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [hasSearched, searchTerm, animatedTopPosition, animatedTitleOpacity, animatedSearchScale, animatedFontSize, inputValue]);

  const handleSearch = () => {
    if (inputValue.trim()) {
      setSearchTerm(inputValue);
      setHasSearched(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setSearchTerm(suggestion);
    setHasSearched(true);
  };

  const clearSearch = () => {
    setInputValue("");
    setSearchTerm("");
    setHasSearched(false);
    setLostItems([]);
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
            <Text style={styles.description} numberOfLines={2}>
              {item.description || 'No description available'}
            </Text>
            <View style={styles.infoContainer}>
              <MapPin size={16} color="#666" />
              <Text style={styles.infoText}>{item.location || 'Unknown Location'}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Calendar size={16} color="#666" />
              <Text style={styles.infoText}>
                {new Date(item.date).toLocaleDateString() || 'Unknown Date'}
              </Text>
            </View>
          </View>

          <View style={[styles.badge, item.type === 'lost' ? styles.lostBadge : styles.foundBadge]}>
            <Text style={styles.badgeText}>{item.type || 'Unknown Type'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  // Calculate the top position based on animation value
  const topPosition = animatedTopPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ['40%', '10%'], // Move from center to top
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <TouchableOpacity 
        style={styles.profileButton} 
        onPress={() => navigation.navigate('Profile')}
      >
        <User size={24} color="#FFF" />
      </TouchableOpacity>
      
      <Animated.View 
        style={[
          styles.searchWrapper,
          {
            top: topPosition,
            backgroundColor: hasSearched ? '#f5f5f5' : 'transparent',
            paddingTop: hasSearched ? 20 : 0,
            paddingBottom: hasSearched ? 20 : 0,
          },
        ]}
      >
        <Animated.View style={[styles.newHeader, { opacity: animatedTitleOpacity }]}>
          <Animated.Text style={[styles.newHeaderTitle, { fontSize: animatedFontSize }]}>
            Find Your Items
          </Animated.Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.searchContainer,
            { transform: [{ scale: animatedSearchScale }] }
          ]}
        >
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.newSearchInput}
              placeholder="Search for an item..."
              placeholderTextColor="#999"
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleSearch}
            />
            {inputValue.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {!hasSearched && suggestions.length > 0 && (
          <View style={styles.filtersContainer}>
            {suggestions.map(suggestion => (
              <TouchableOpacity 
                key={suggestion} 
                style={styles.filterChip}
                onPress={() => handleSuggestionClick(suggestion)}
              >
                <Text style={styles.filterText}>{suggestion}</Text>
                <X size={16} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>
      
      {hasSearched && isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b3b3b" />
          <Text style={styles.loadingText}>Loading items...</Text>
        </View>
      ) : hasSearched ? (
        <View style={styles.resultsContainer}>
          <FlatList
            data={lostItems}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ItemCard item={item} />}
            contentContainerStyle={styles.list}
          />
        </View>
      ) : null}
      
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