import Home from './app/screens/Home';
import LoginSceen from './app/screens/LoginScreen';
import Profile from './app/screens/Profile';
import UploadForm from './app/screens/UploadForm';
import Post from './app/screens/Post';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { ChevronLeft as Back } from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const InsideStack = createBottomTabNavigator();

function InsideLayout() {
  const navigation = useNavigation();
  return (
    <InsideStack.Navigator initialRouteName="Details">
      <InsideStack.Screen name="Home" component={Home} options={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
      <InsideStack.Screen name="UploadForm" component={UploadForm as React.ComponentType<object>} options={{ 
        headerShown: true,
        headerLeft: () => (
          <Back
            onPress={() => navigation.goBack()}
            title="<"
            color="#000"
            size={32}
          />
        ),
        headerTitle: 'Report Lost Item', 
        tabBarStyle: { display: 'none' } 
      }} 
      />
      <InsideStack.Screen name="Profile" component={Profile} options={{
        headerShown: true,
        headerLeft: () => (
          <Back
            onPress={() => navigation.goBack()}
            title="<"
            color="#000"
            size={32}
          />
        ),
        headerTitle: '',
        tabBarStyle: { display: 'none' }
      }} />
      <InsideStack.Screen name="Post" component={Post} options={{
        headerShown: true,
        title: '', 
        headerLeft: () => (
          <Back
            onPress={() => navigation.goBack()}
            title="<"
            color="#000"
            size={32}
          />
        ),
        tabBarStyle: { display: 'none' } 
      }} />
    </InsideStack.Navigator>
  )
}

export default function App() {

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    })
  }, [])

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {user ?
          (<Stack.Screen name="InsideLayout" component={InsideLayout} options={{ headerShown: false }} />)
          : <Stack.Screen name="Login" component={LoginSceen} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}

