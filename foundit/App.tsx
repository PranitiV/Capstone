import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, StyleSheet } from 'react-native';
import Home from './app/screens/Home';
import LoginSceen from './app/screens/LoginScreen';
import LogoutScreen from './app/screens/LogoutScreen';
import Upload from './app/screens/Upload';
import Profile from './app/screens/Profile';
import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';

const Stack = createNativeStackNavigator();
const InsideStack = createBottomTabNavigator();

function InsideLayout() {
  return (
    <InsideStack.Navigator initialRouteName="Details">
      <InsideStack.Screen name="Details" component={Home} />
      <InsideStack.Screen name="Upload" component={Upload} />
      <InsideStack.Screen name="Profile" component={Profile} />
      <InsideStack.Screen
        name="LOG OUT"
        component={LogoutScreen}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            Alert.alert("LOG OUT", "Are you sure you want to log out?", [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              { text: 'Log out', onPress: () => FIREBASE_AUTH.signOut() },
            ]);
          }
        }}
      />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

