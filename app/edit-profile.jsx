import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store'; // 1. Import SecureStore
import { useEffect, useState } from 'react'; // 2. Import useEffect
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from './theme';

export default function EditProfile() {
    const [image, setImage] = useState('https://i.pravatar.cc/300');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null); // Store token for the API call

    // 3. Load user data on mount
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await SecureStore.getItemAsync('userData');
            const userToken = await SecureStore.getItemAsync('userToken');

            if (userData) {
                const user = JSON.parse(userData);
                setName(user.username || '');
                setEmail(user.email || '');
                if (user.avatar) setImage(user.avatar);
            }
            if (userToken) setToken(userToken);

        } catch (error) {
            console.error("Error loading user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.4,
            base64: true,
        });

        if (!result.canceled) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setImage(base64Image);
        }
    };

    const handleSave = async () => {
        if (!token) {
            alert("Session expired. Please log in again.");
            return;
        }

        try {
            const res = await fetch("https://monity.ceekeey.name.ng/api/user/profile", { // Ensure port matches Home screen (5002)
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: name,
                    email,
                    avatar: image,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Update failed");

            // 🔥 UPDATE LOCAL STORAGE so Home screen updates too
            await SecureStore.setItemAsync(
                "userData",
                JSON.stringify(data.user)
            );

            alert("Profile updated!");
            router.back();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Edit Profile</Text>

            <Pressable onPress={pickImage} style={styles.avatarWrap}>
                <Image source={{ uri: image }} style={styles.avatar} />
                <Text style={styles.change}>Change Photo</Text>
            </Pressable>

            <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={COLORS.muted}
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.muted}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
            />

            <Pressable style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save Changes</Text>
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
        paddingTop: hp('4%'),
    },

    title: {
        color: COLORS.text,
        fontSize: wp('6%'),
        fontWeight: '700',
        marginBottom: hp('3%'),
    },

    avatarWrap: {
        alignItems: 'center',
        marginBottom: hp('4%'),
    },

    avatar: {
        width: wp('30%'),
        height: wp('30%'),
        borderRadius: wp('15%'),
        marginBottom: hp('1%'),
    },

    change: {
        color: COLORS.secondary,
    },

    input: {
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        paddingVertical: hp('1.8%'),
        paddingHorizontal: wp('4%'),
        borderRadius: 12,
        marginBottom: hp('2%'),
    },

    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: hp('2%'),
        borderRadius: 14,
        alignItems: 'center',
        marginTop: hp('2%'),
    },

    buttonText: {
        color: COLORS.text,
        fontWeight: '600',
    },
});
