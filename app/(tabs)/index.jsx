import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router'; // 1. Added useFocusEffect
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react'; // 2. Added useCallback, removed useEffect
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '../theme';

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [user, setUser] = useState(null);

    // 3. This hook runs EVERY TIME the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadUserFromStorage();
            fetchData();
        }, [])
    );

    const loadUserFromStorage = async () => {
        const userData = await SecureStore.getItemAsync('userData');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    };

    const fetchData = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const userData = await SecureStore.getItemAsync('userData');

            if (userData) setUser(JSON.parse(userData));

            const response = await fetch('https://monity-api.onrender.com/api/expensive/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            // Ensure we set an array to avoid the .filter crash
            setExpenses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Dynamic Calculations (Safe Version)
    // We use (expenses || []) to guarantee we are always filtering an array
    const expensesList = Array.isArray(expenses) ? expenses : [];

    const totalIncome = expensesList
        .filter(item => item && item.type === 'income')
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const totalExpenses = expensesList
        .filter(item => item && item.type === 'expense')
        .reduce((sum, item) => sum + Math.abs(Number(item.amount) || 0), 0);

    const balance = totalIncome - totalExpenses;

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Good evening 👋</Text>
                <Text style={styles.name}>{user?.username || 'Ceekeey'}</Text>
            </View>

            {/* BALANCE CARD */}
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balance}>₦ {balance.toLocaleString()}</Text>
            </View>

            {/* STATS */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { borderColor: COLORS.secondary }]}>
                    <Text style={styles.statLabel}>Income</Text>
                    <Text style={[styles.statValue, { color: COLORS.secondary }]}>
                        ₦ {totalIncome.toLocaleString()}
                    </Text>
                </View>

                <View style={[styles.statCard, { borderColor: COLORS.error }]}>
                    <Text style={styles.statLabel}>Expenses</Text>
                    <Text style={[styles.statValue, { color: COLORS.error }]}>
                        ₦ {totalExpenses.toLocaleString()}
                    </Text>
                </View>
            </View>

            {/* RECENT TRANSACTIONS */}
            <Text style={styles.sectionTitle}>Recent Activity</Text>

            <FlatList
                data={expenses}
                keyExtractor={(item) => item._id} // Changed to _id as per your API res
                contentContainerStyle={{ paddingBottom: hp('14%') }}
                refreshing={loading}
                onRefresh={fetchData} // Pull to refresh
                ListEmptyComponent={
                    <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 20 }}>
                        No expenses yet
                    </Text>
                }
                renderItem={({ item }) => (
                    <View style={styles.transactionItem}>
                        <View>
                            <Text style={styles.transactionTitle}>{item.title}</Text>
                            <Text style={{ fontSize: 12, color: COLORS.muted }}>
                                {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                        <Text
                            style={[
                                styles.transactionAmount,
                                { color: item.type === 'expense' ? COLORS.error : COLORS.secondary },
                            ]}
                        >
                            {item.type === 'expense' ? '-' : '+'} ₦ {Math.abs(item.amount).toLocaleString()}
                        </Text>
                    </View>
                )}
            />

            {/* FAB */}
            <Pressable style={styles.fab} onPress={() => router.push('/add-expense')}>
                <Ionicons name="add" size={28} color={COLORS.text} />
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

    header: {
        marginBottom: hp('3%'),
    },

    greeting: {
        color: COLORS.muted,
        fontSize: wp('4%'),
    },

    name: {
        color: COLORS.text,
        fontSize: wp('6.5%'),
        fontWeight: '700',
    },

    balanceCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        padding: wp('6%'),
        marginBottom: hp('4%'),
    },

    balanceLabel: {
        color: COLORS.text,
        opacity: 0.85,
    },

    balance: {
        color: COLORS.text,
        fontSize: wp('8%'),
        fontWeight: '800',
        marginTop: hp('1%'),
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp('4%'),
    },

    statCard: {
        width: '48%',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: wp('4%'),
        borderWidth: 1,
    },

    statLabel: {
        color: COLORS.muted,
    },

    statValue: {
        fontSize: wp('5.2%'),
        fontWeight: '700',
        marginTop: hp('1%'),
    },

    chartCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: wp('4%'),
        marginBottom: hp('3%'),
    },

    chartPlaceholder: {
        height: hp('16%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: COLORS.background,
        marginTop: hp('1.5%'),
    },

    chartText: {
        color: COLORS.muted,
    },

    sectionTitle: {
        color: COLORS.text,
        fontSize: wp('4.5%'),
        fontWeight: '600',
        marginBottom: hp('1.5%'),
    },

    transactionItem: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: wp('4%'),
        marginBottom: hp('1.5%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    transactionTitle: {
        color: COLORS.text,
    },

    transactionAmount: {
        fontWeight: '600',
    },

    fab: {
        position: 'absolute',
        bottom: hp('3%'),
        right: wp('6%'),
        backgroundColor: COLORS.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
    },
});
