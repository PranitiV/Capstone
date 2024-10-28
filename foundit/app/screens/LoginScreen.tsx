import {View, TextInput, ActivityIndicator, Button, KeyboardAvoidingView} from 'react-native';
import React, {useState} from 'react'; 
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import styles from '../styles/Login';

const Login = () => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [loading, setLoading] = useState(false); 

    const auth = FIREBASE_AUTH; 

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
                </>
            }
        </KeyboardAvoidingView>
    </View>
  )
}

export default Login
