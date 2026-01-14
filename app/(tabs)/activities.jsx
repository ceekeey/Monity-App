import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from 'expo-router'; // 1. Import this
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text, View
} from 'react-native';
import { BarChart } from "react-native-chart-kit";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '../theme';

export default function Activities() {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('All');

    const months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    useEffect(() => {
        fetchActivities();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchActivities();
        }, [])
    );

    // Handle Filtering Logic
    useEffect(() => {
        if (selectedMonth === 'All') {
            setFilteredExpenses(expenses);
        } else {
            const monthIndex = months.indexOf(selectedMonth) - 1;
            const filtered = expenses.filter(item => {
                const itemDate = new Date(item.date || item.createdAt);
                return itemDate.getMonth() === monthIndex;
            });
            setFilteredExpenses(filtered);
        }
    }, [selectedMonth, expenses]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await fetch('https://monity.ceekeey.name.ng/api/expensive/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setExpenses(sortedData);
            setFilteredExpenses(sortedData);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteExpense = async (id) => {
        Alert.alert(
            "Delete Expense",
            "Are you sure you want to delete this item?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await SecureStore.getItemAsync('userToken');

                            const res = await fetch(
                                `http://192.168.42.46:5002/api/expensive/delete/${id}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                    },
                                }
                            );

                            const data = await res.json();
                            console.log("Delete response:", data);
                            if (!res.ok) {
                                throw new Error(data.message || "Delete failed");
                            }

                            // 🔄 Refetch activities after delete
                            fetchActivities();
                        } catch (error) {
                            console.error("Delete error:", error);
                            Alert.alert("Error", "Could not delete expense");
                        }
                    },
                },
            ]
        );
    };


    // 1. Prepare Data for the Chart
    const chartData = {
        labels: ["Income", "Expenses"],
        datasets: [
            {
                data: [
                    filteredExpenses.filter(i => i.type === 'income').reduce((sum, i) => sum + Number(i.amount), 0),
                    filteredExpenses.filter(i => i.type === 'expense').reduce((sum, i) => sum + Math.abs(Number(i.amount)), 0)
                ]
            }
        ]
    };

    const chartConfig = {
        backgroundColor: COLORS.surface,
        backgroundGradientFrom: COLORS.surface,
        backgroundGradientTo: COLORS.surface,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White text/lines
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: { borderRadius: 16 },
        fillShadowGradientOpacity: 1,
    };


    const exportToCSV = async () => {
        if (filteredExpenses.length === 0) {
            Alert.alert("No data", "Nothing to export for this month");
            return;
        }

        let csvHeader = "Title,Amount,Type,Date\n";
        let csvRows = filteredExpenses.map(item => {
            const date = new Date(item.date || item.createdAt).toLocaleDateString();
            // Clean title to avoid CSV breaking if there are commas in the title
            const cleanTitle = item.title.replace(/,/g, '');
            return `${cleanTitle},${item.amount},${item.type},${date}`;
        }).join("\n");

        const csvString = csvHeader + csvRows;
        const fileName = `Expenses_${selectedMonth}_${new Date().getTime()}.csv`;

        // Ensure there is a slash between directory and filename
        const filePath = FileSystem.documentDirectory + fileName;

        try {
            // This works with the /legacy import
            await FileSystem.writeAsStringAsync(filePath, csvString, {
                encoding: 'utf8'
            });

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(filePath, {
                    mimeType: 'text/csv',
                    dialogTitle: 'Export Expense Data',
                });
            } else {
                Alert.alert("Error", "Sharing is not available on this device");
            }
        } catch (err) {
            console.error("Export error:", err);
            Alert.alert("Export Failed", "Could not create CSV file.");
        }
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.title}>Activities</Text>
                    <Text style={styles.subtitle}>All your transactions</Text>
                </View>
                <Pressable style={styles.exportBtn} onPress={exportToCSV}>
                    <Ionicons name="download-outline" size={20} color={COLORS.text} />
                </Pressable>
            </View>

            {/* MONTH FILTER DROPDOWN/CHIPS */}
            <View style={{ marginBottom: hp('2%') }}>
                <ScrollView horizontal showsHorizotalScrollIndicator={false}>
                    {months.map((m) => (
                        <Pressable
                            key={m}
                            onPress={() => setSelectedMonth(m)}
                            style={[
                                styles.filterChip,
                                selectedMonth === m && styles.activeChip
                            ]}
                        >
                            <Text style={[
                                styles.chipText,
                                selectedMonth === m && { color: COLORS.text }
                            ]}>{m}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {filteredExpenses.length > 0 && (
                <View style={styles.chartContainer}>
                    <BarChart
                        data={chartData}
                        width={wp('88%')}
                        height={220}
                        yAxisLabel="₦"
                        chartConfig={{
                            ...chartConfig,
                            fillShadowGradient: COLORS.secondary, // Bars color
                        }}
                        verticalLabelRotation={0}
                        style={{ borderRadius: 16, marginVertical: 8 }}
                        showValuesOnTopOfBars={true}
                    />
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredExpenses}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={fetchActivities} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={<Text style={styles.empty}>No activity for {selectedMonth}</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <View>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemDate}>
                                    {new Date(item.date || item.createdAt).toLocaleDateString()}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <Text
                                    style={[
                                        styles.amount,
                                        { color: item.type === 'expense' ? COLORS.error : COLORS.secondary },
                                    ]}
                                >
                                    {item.type === 'expense' ? '-' : '+'} ₦
                                    {Math.abs(item.amount).toLocaleString()}
                                </Text>

                                {/* 🗑 Delete Icon */}
                                <Pressable onPress={() => deleteExpense(item._id)}>
                                    <Ionicons
                                        name="trash-outline"
                                        size={22}
                                        color={COLORS.error}
                                    />
                                </Pressable>
                            </View>
                        </View>
                    )}

                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: wp('6%'),
        paddingTop: hp('6%'),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exportBtn: {
        backgroundColor: COLORS.surface,
        padding: 10,
        borderRadius: 10,
    },
    title: {
        color: COLORS.text,
        fontSize: wp('6.5%'),
        fontWeight: '700',
    },
    subtitle: {
        color: COLORS.muted,
        marginBottom: hp('1%'),
    },
    filterChip: {
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1%'),
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        marginRight: wp('2%'),
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        color: COLORS.muted,
        fontSize: wp('3.5%'),
        fontWeight: '600',
    },
    item: {
        backgroundColor: COLORS.surface,
        padding: wp('4%'),
        borderRadius: 14,
        marginBottom: hp('1.8%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemTitle: { color: COLORS.text, fontSize: wp('4.2%'), fontWeight: '500' },
    itemDate: { color: COLORS.muted, fontSize: wp('3.4%') },
    amount: { fontSize: wp('4.5%'), fontWeight: '600' },
    empty: { color: COLORS.muted, textAlign: 'center', marginTop: hp('20%') },
    chartContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: hp('2%'),
    }
});