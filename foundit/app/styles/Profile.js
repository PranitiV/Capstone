import { StyleSheet } from 'react-native'

export default styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    profilePicture: {
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        borderWidth: 1, 
        marginBottom: 5, 
        marginTop: 70,
      },
    fieldContainer: {
        flexDirection:'row',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#f8f8f8',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 30,
    },
    username: {
        fontSize: 32, 
        fontWeight: 'bold',
        marginBottom: 40, 
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold', 
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20, 
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20, 
        borderRadius: 8,
    },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 10, 
        borderWidth: 1,
        borderRadius: 4,
        borderColor: '#ccc',
    },
    editButton: {
        position: 'absolute',
        top: 50,
        right: 50,
    },
    settingsButton: {
        position: 'absolute',
        top: 50,
        right: 10,
    },
    itemContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 15, 
        width: '100%',
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5, 
    },
    itemLocation: {
        fontSize: 14,
        color: '#555',
    },
    noItemsText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        marginTop: 20, 
    },
});