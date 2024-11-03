import { StyleSheet } from 'react-native'

export default styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
      },
      image: {
        width: '95%',
        height: '40%',
        resizeMode: 'cover',
        alignSelf: 'center',
        borderRadius: 10,
      },
      content: {
        padding: 20,
      },
      descriptionContainer: {
        flexDirection: 'row', 
        marginBottom: 20,
        flexWrap: 'wrap',
      },
      descriptionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      description: {
        fontSize: 16,
        marginBottom: 20,
        flexWrap: 'wrap',
      },
      infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
      },
      infoLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
      },
      infoText: {
        fontSize: 16,
        color: '#666',
      },
      chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        width: '90%',
        alignSelf: 'center',
      },
      chatButtonText: {
        color: '#3b3b3b',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
      },
  });