import { View, TextInput, ActivityIndicator, Button, KeyboardAvoidingView, Alert } from 'react-native';
import React, { useState } from 'react'; 
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import styles from '../styles/Login';

const Login = () => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [loading, setLoading] = useState(false); 

    const auth = FIREBASE_AUTH; 

    const signIn = async () => {
        setLoading(true); 
        try {
            const response = await signInWithEmailAndPassword(auth, email, password); 
            
            if (response.user.emailVerified) {
                console.log("Sign-in successful");
            } else {
                Alert.alert("Email Verification Required", "Please verify your email before signing in. A verification link has been sent to your email.");
                await sendEmailVerification(response.user);
                await auth.signOut();
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Invalid Credentials");
        } finally {
            setLoading(false); 
        }
    }

    const signUp = async () => {
        setLoading(true); 

        // Check if email ends with "utoronto.ca"
        if (!email.endsWith("utoronto.ca")) {
            Alert.alert("Invalid Email", "Please enter a valid University of Toronto email address (ending with utoronto.ca).");
            setLoading(false);
            return;
        }

        try {
            const response = await createUserWithEmailAndPassword(auth, email, password); 
            console.log("Account created:", response);
            Alert.alert("Account Created", "Please check your email to verify your account.");

            // Send email verification
            await sendEmailVerification(response.user);
            await auth.signOut();
            Alert.alert("Verification Email Sent", "A verification link has been sent to your email. Please verify before logging in.");
        } catch (error: any) {
            console.log(error);
            Alert.alert("Signup Failed", error.message);
        } finally {
            setLoading(false); 
        }
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView>
                <TextInput 
                    style={styles.input} 
                    value={email} 
                    placeholder='Email' 
                    autoCapitalize="none" 
                    onChangeText={(text) => setEmail(text)} 
                />
                <TextInput 
                    style={styles.input} 
                    value={password} 
                    placeholder='Password' 
                    secureTextEntry={true} 
                    onChangeText={(text) => setPassword(text)} 
                />
            
                {loading ? 
                    (<ActivityIndicator size='large' color='#007AFF' />)
                    :
                    <>
                        <Button title="Login" onPress={signIn} />
                        <Button title="Create account" onPress={signUp} />
                    </>
                }
            </KeyboardAvoidingView>
        </View>
    );
}

export default Login;
