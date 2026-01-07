import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react'; // Added useEffect
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { COLORS } from '../theme';

const API_URL = "https://monity.ceekeey.name.ng/api/auth";

export default function Auth() {
    const [mode, setMode] = useState('login');
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true); // Added loading state for check

    // Form States
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 1. Check if user is already logged in when this screen mounts
    useEffect(() => {
        const checkExistingAuth = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                router.replace('/(tabs)');
            } else {
                setCheckingAuth(false);
            }
        };
        checkExistingAuth();
    }, []);

    const handleSubmit = async () => {
        if (!username || !password || (mode === 'register' && !email)) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        const endpoint = mode === 'login' ? '/login' : '/register';
        const payload = mode === 'login'
            ? { username, password }
            : { username, email, password };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                await SecureStore.setItemAsync('userToken', data.token);
                await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
                router.replace('/(tabs)');
            } else {
                Alert.alert("Failed", data.error || "Something went wrong");
            }
        } catch (error) {
            Alert.alert("Network Error", "Could not connect to server.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Show spinner while checking SecureStore
    if (checkingAuth) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/images/auth.png')} style={styles.image} resizeMode="contain" />

            <Text style={styles.title}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</Text>
            <Text style={styles.subtitle}>
                {mode === 'login' ? 'Login to manage your finances' : 'Start tracking your expenses today'}
            </Text>

            <View style={styles.form}>
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor={COLORS.muted}
                    style={styles.input}
                    autoCapitalize="none"
                />

                {mode === 'register' && (
                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor={COLORS.muted}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                )}

                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor={COLORS.muted}
                    style={styles.input}
                    secureTextEntry
                />

                <Pressable
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.text} />
                    ) : (
                        <Text style={styles.buttonText}>{mode === 'login' ? 'Login' : 'Register'}</Text>
                    )}
                </Pressable>
            </View>

            <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
                <Text style={styles.toggleText}>
                    {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Login'}
                </Text>
            </Pressable>
        </View>
    );
}

// ... styles remain the same
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: wp('6%'),
        justifyContent: 'center',
    },

    image: {
        width: wp('60%'),
        height: hp('22%'),
        alignSelf: 'center',
        marginBottom: hp('2%'),
    },

    title: {
        color: COLORS.text,
        fontSize: wp('7%'),
        fontWeight: '700',
        textAlign: 'center',
    },

    subtitle: {
        color: COLORS.muted,
        fontSize: wp('4%'),
        textAlign: 'center',
        marginTop: hp('1%'),
        marginBottom: hp('3%'),
    },

    form: {
        marginBottom: hp('3%'),
    },

    input: {
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        paddingVertical: hp('1.8%'),
        paddingHorizontal: wp('4%'),
        borderRadius: 12,
        marginBottom: hp('2%'),
        fontSize: wp('4%'),
    },

    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: hp('2%'),
        borderRadius: 14,
        alignItems: 'center',
        marginTop: hp('1%'),
    },

    buttonText: {
        color: COLORS.text,
        fontSize: wp('4.5%'),
        fontWeight: '600',
    },

    toggleText: {
        color: COLORS.secondary,
        fontSize: wp('3.8%'),
        textAlign: 'center',
    },
});
