import { StyleSheet } from 'react-native'

export default styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
      marginBottom: 15,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    imageContainer: {
      borderWidth: 2,
      borderColor: '#E5E7EB',
      borderStyle: 'dashed',
      borderRadius: 8,
      padding: 20,
      marginBottom: 20,
    },
    image: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
      borderRadius: 8,
    },
    removeImageButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeImageText: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
    },
    imagePlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    imageButton: {
      marginHorizontal: 5,
    },
    imageButtonText: {
      color: '#4F46E5',
      fontWeight: '600',
    },
    imagePlaceholderText: {
      color: '#9CA3AF',
      marginTop: 10,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 5,
      color: '#3b3b3b',
    },
    input: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8,
      padding: 12,
      marginBottom: 15,
      fontSize: 16,
    },
    locationContainer: {
      marginBottom: 16,
    },
    locationInput: {
      marginBottom: 8,
    },
    locationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
    },
    locationButtonText: {
      color: '#3b3b3b',
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 8,
    },
    map: {
      height: 200,
      marginBottom: 15,
      borderRadius: 8,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    submitButton: {
      backgroundColor: '#4F46E5',
      borderRadius: 8,
      padding: 15,
      alignItems: 'center',
      marginBottom: 25
    },
    disabledButton: {
      opacity: 0.5,
    },
    submitButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    mapContainer: {
      marginBottom: 16,
    },
    mapHint: {
      color: '#6B7280',
      fontSize: 12,
      textAlign: 'center',
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    securityInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      backgroundColor: '#f0f0f0',
      padding: 10,
      borderRadius: 5,
    },
    securityInfoText: {
      flex: 1,
      fontSize: 14,
      color: '#333',
    },
    infoIcon: {
      marginLeft: 10,
    },
    securityInfoDetails: {
      fontSize: 12,
      color: '#666',
      marginBottom: 10,
      fontStyle: 'italic',
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    switchWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 40, // Adjust this value as needed
    },
});