import {View, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView} from 'react-native';
import React, {useState} from 'react'; 
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

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
