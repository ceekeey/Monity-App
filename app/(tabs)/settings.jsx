import { router, useFocusEffect } from 'expo-router'; // 1. Added useFocusEffect
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react'; // 2. Added useCallback
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '../theme';

export default function Settings() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 3. This runs every time you click the Settings tab or come back from Editing
    useFocusEffect(
        useCallback(() => {
            getUserData();
        }, [])
    );

    const getUserData = async () => {
        try {
            const userData = await SecureStore.getItemAsync('userData');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error("Error fetching settings user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        router.replace('/(auth)/auth');
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
            <Text style={styles.title}>Settings</Text>

            {/* PROFILE CARD */}
            <View style={styles.profileCard}>
                <Image
                    source={{
                        // Added a "key" or timestamp if needed to force image refresh
                        uri: user?.avatar || 'https://i.pravatar.cc/300',
                    }}
                    style={styles.avatar}
                />

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{user?.username || 'User'}</Text>
                    <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
                </View>

                <Pressable
                    style={styles.editBtn}
                    onPress={() => router.push('/edit-profile')}
                >
                    <Text style={styles.editText}>Edit</Text>
                </Pressable>
            </View>

            {/* REST OF YOUR UI REMAINS THE SAME */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.item}>
                    <Text style={styles.itemText}>Currency</Text>
                    <Text style={styles.itemValue}>NGN (₦)</Text>
                </View>
                <View style={styles.item}>
                    <Text style={styles.itemText}>Notifications</Text>
                    <Text style={styles.itemValue}>On</Text>
                </View>
            </View>

            <Pressable style={styles.logout} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
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
        fontSize: wp('6.5%'),
        fontWeight: '700',
        marginBottom: hp('3%'),
    },

    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 18,
        padding: wp('4%'),
        marginBottom: hp('4%'),
    },

    avatar: {
        width: wp('14%'),
        height: wp('14%'),
        borderRadius: wp('7%'),
        marginRight: wp('4%'),
    },

    name: {
        color: COLORS.text,
        fontSize: wp('4.5%'),
        fontWeight: '600',
    },

    email: {
        color: COLORS.muted,
        fontSize: wp('3.5%'),
    },

    editBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('0.8%'),
        borderRadius: 10,
    },

    editText: {
        color: COLORS.text,
        fontWeight: '600',
    },

    section: {
        marginBottom: hp('4%'),
    },

    sectionTitle: {
        color: COLORS.muted,
        marginBottom: hp('1.5%'),
    },

    item: {
        backgroundColor: COLORS.surface,
        padding: wp('4%'),
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp('1.5%'),
    },

    itemText: {
        color: COLORS.text,
    },

    itemValue: {
        color: COLORS.muted,
    },

    logout: {
        backgroundColor: COLORS.error,
        paddingVertical: hp('1.8%'),
        borderRadius: 14,
        alignItems: 'center',
    },

    logoutText: {
        color: COLORS.text,
        fontWeight: '600',
    },
});
