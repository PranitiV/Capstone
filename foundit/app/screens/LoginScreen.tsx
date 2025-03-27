"use client"

import {
  View,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Alert,
  Image,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native"
import { useState } from "react"
import { FIREBASE_AUTH } from "../../FirebaseConfig"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const auth = FIREBASE_AUTH

  const signIn = async () => {
    setLoading(true)
    try {
      const response = await signInWithEmailAndPassword(auth, email, password)

      if (response.user.emailVerified) {
        console.log("Sign-in successful")
      } else {
        Alert.alert(
          "Email Verification Required",
          "Please verify your email before signing in. A verification link has been sent to your email.",
        )
        await sendEmailVerification(response.user)
        await auth.signOut()
      }
    } catch (error) {
      console.log(error)
      Alert.alert("Error", "Invalid Credentials")
    } finally {
      setLoading(false)
    }
  }

  const signUp = async () => {
    setLoading(true)

    // Check if email ends with "utoronto.ca"
    if (!email.endsWith("utoronto.ca")) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid University of Toronto email address (ending with utoronto.ca).",
      )
      setLoading(false)
      return
    }

    try {
      const response = await createUserWithEmailAndPassword(auth, email, password)
      console.log("Account created:", response)
      Alert.alert("Account Created", "Please check your email to verify your account.")

      // Send email verification
      await sendEmailVerification(response.user)
      await auth.signOut()
      Alert.alert(
        "Verification Email Sent",
        "A verification link has been sent to your email. Please verify before logging in.",
      )
    } catch (error: any) {
      console.log(error)
      Alert.alert("Signup Failed", error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          <View style={styles.logoContainer}>
            <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appSubtitle}>{isLogin ? "Sign in to your account" : "Create a new account"}</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                placeholder="your.name@utoronto.ca"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={(text) => setEmail(text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  onChangeText={(text) => setPassword(text)}
                />
                <TouchableOpacity 
                  style={styles.eyeButton} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#002A5C" style={styles.loader} />
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={isLogin ? signIn : signUp}>
                  <Text style={styles.primaryButtonText}>{isLogin ? "Sign In" : "Create Account"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={toggleAuthMode}>
                  <Text style={styles.secondaryButtonText}>
                    {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 240,
    height: 240,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4F46E5", // UofT blue
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "#002A5C", // UofT blue
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    padding: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#002A5C",
    fontSize: 14,
    fontWeight: "500",
  },
  loader: {
    marginTop: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
}

export default Login

