// ios 290251917885-0fjhcln1d1a1fj7rn3vvle31mi3cbd0b.apps.googleusercontent.com
// android 290251917885-9jggnk1r5e0uj6qejvm1rlr4df6h71lu.apps.googleusercontent.com

import {View, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView, Platform, Alert} from 'react-native';
import React, {useEffect, useState} from 'react'; 
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const Login = () => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [loading, setLoading] = useState(false); 

    const auth = FIREBASE_AUTH; 

    const androidClientId = '290251917885-9jggnk1r5e0uj6qejvm1rlr4df6h71lu.apps.googleusercontent.com';
    const iosClientId = '290251917885-0fjhcln1d1a1fj7rn3vvle31mi3cbd0b.apps.googleusercontent.com';

    const clientId = Platform.select({
        ios: iosClientId,
        android: androidClientId,
    });


    const redirectUri = 'https://auth.expo.io/@jayshah2111/foundit';

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: clientId,
        redirectUri: redirectUri,
    });

    useEffect(() => {
        if (response?.type === 'success') {
          const { authentication } = response;
          console.log('Google Sign-In successful:', authentication);
          Alert.alert('Login Successful!', 'You are now logged in with Google.');
        }
    }, [response]);
    
    const handleGoogleSignIn = () => {
        promptAsync();
    };

    const signIn = async () => {
        setLoading(true); 
        try{
            const response = await signInWithEmailAndPassword(auth, email,password); 
            console.log(response)
        } catch (error){
            console.log(error)
            alert("Invalid Credentials")
        } finally {
            setLoading(false); 
        }
    }

    const signUp = async () => {
        setLoading(true); 
        try{
            const response = await createUserWithEmailAndPassword(auth, email,password); 
            alert("Check your email!")
            console.log(response)
        } catch (error : any){
            console.log(error)
            alert("Signup failed: " + error.message)
        } finally {
            setLoading(false); 
        }
    }

  return (
    <View style={styles.container}>
        <KeyboardAvoidingView>
            <TextInput style={styles.input} value={email} placeholder='Email' autoCapitalize="none" onChangeText={(text)=> setEmail(text)} />
            <TextInput style={styles.input} value={password} placeholder='Password' secureTextEntry={true} onChangeText={(text)=> setPassword(text)} />
        
            {loading ? 
                (<ActivityIndicator size='large' color='#007AFF'x/>)
                :
                <>
                    <Button title = "Login" onPress={signIn} />
                    <Button title = "Create account" onPress={signUp}/>
                    <Button
                        title='Sign In with Google'
                        disabled={!request}
                        onPress={handleGoogleSignIn}
                    />
                </>
            }
        </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20, 
        flex: 1, 
        justifyContent: 'center'
    }, 
    input: {
        marginVertical: 4, 
        borderWidth: 1.5, 
        borderRadius: 5, 
        padding: 10, 
        height: 50, 
        backgroundColor: '#fff'
    }, 
    button: {
        padding: 30,
    }
})
export default Login
