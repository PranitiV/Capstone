import { NavigationProp } from '@react-navigation/native'
import React from 'react'
import { View, StyleSheet, Button } from 'react-native'
import { FIREBASE_AUTH } from '../../FirebaseConfig'

interface RouterProps {
  navigation: NavigationProp<any,any>
}

const LoggedIn = ( {navigation} : RouterProps) => {
  return (
    <View style={styles.container}>
      <Button onPress={()=> FIREBASE_AUTH.signOut()} title='Sign Out' />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  }
})
export default LoggedIn