import { StyleSheet, Dimensions } from "react-native";

const WINDOW_HEIGHT = Dimensions.get('window').height;
const CAPTURE_SIZE = Math.floor(WINDOW_HEIGHT * 0.08);

export default styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    cameraContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        top: 12,
        right: 15,
    },
    cancelContainer: {
        position: 'absolute',
        top: 12,
        left: 15,
    },
    flipButton: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 50,
        padding: 10,
        paddingHorizontal: 20,
    },
    captureButtonContainer: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
    },
    captureButton: {
        width: CAPTURE_SIZE,
        height: CAPTURE_SIZE,
        borderRadius: Math.floor(CAPTURE_SIZE / 2),
        borderWidth: 4,
        borderColor: 'white',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureInner: {
        width: CAPTURE_SIZE - 20,
        height: CAPTURE_SIZE - 20,
        borderRadius: Math.floor((CAPTURE_SIZE - 20) / 2),
        backgroundColor: 'white',
    },
    capturedImage: {
        width: '90%',
        height: 300,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    formContainer: {
        width: '90%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: 'white',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});