import { db } from '../../FirebaseConfig';
import { collection, getDocs, query, orderBy} from 'firebase/firestore';
import cache from 'memory-cache';

const CACHE_DURATION = 5 * 60 * 1000;

export const fetchPosts = async (searchTerm = "") => {
  const cacheKey = 'posts';
  const lowerSearchTerm = searchTerm.trim().toLowerCase();

  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    if (lowerSearchTerm === "") {
      return cachedResult;
    } else {
      const filteredPosts = cachedResult.filter((post: { name: string; description: string; clarifaiData: string[] }) =>
        post.name.trim().toLowerCase().includes(lowerSearchTerm) ||
        post.description.trim().toLowerCase().includes(lowerSearchTerm) ||
        post.clarifaiData.some((concept: string) => concept.toLowerCase().includes(lowerSearchTerm))
      );
      return filteredPosts;
    }
  }

  // If no cached result, query Firestore
  const postsQuery = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
  const postsSnapshot = await getDocs(postsQuery);

  // Map and structure the posts data
  const posts = postsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
        id: doc.id || 'Not Found',
        name: data.name || 'Unknown',
        imageUrl: data.imageUrl || '',
        isValuableItem: data.isValuableItem || "Unknown", 
        description: data.description || 'No description available',
        location: data.location || 'Unknown location',
        locationDescription: data.locationDescription || "no description available",
        date: data.createdAt?.toDate() || new Date(),
        type: 'lost',
        securityQuestion: data.securityQuestion || "no security question",
        securityAnswer: data.securityAnswer || "no security answer",
        clarifaiData: data.clarifaiData || [],
        postedBy: data.postedBy,
    };
  });

  // Store the structured data in cache
  cache.put(cacheKey, posts, CACHE_DURATION);

  // Return the structured posts data
  return posts;
};
