import { ref, listAll, getDownloadURL, getStorage } from 'firebase/storage';
import { storage, db } from '../../FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// Function to fetch posts from Firestore
export const fetchPosts = async () => {
    const postsCollection = collection(db, 'items'); // Assuming 'posts' is the name of your Firestore collection
    const postsSnapshot = await getDocs(postsCollection);
    
    // Map over the Firestore documents to extract data and convert 'createdAt' to Date
    const posts = postsSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Ensure that the required fields exist
      return {
        id: doc.id || 'Not Found',
        name: data.name || 'Unknown', // Fallback to 'Unknown' if missing
        imageUrl: data.imageUrl || '', // Fallback to empty string if missing
        description: data.description || 'No description available', // Fallback if missing
        location: data.location || 'Unknown location', // Fallback if missing
        date: data.createdAt?.toDate() || new Date(), // Fallback to current date if missing
        type: 'lost',
      };
    });
  
  return posts;
};

export const getImageUrl = async (imagePath: string) => {
  const imageRef = ref(storage, imagePath);
  const imageUrl = await getDownloadURL(imageRef);
  return imageUrl;
};
