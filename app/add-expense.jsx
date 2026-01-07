import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store'; // 1. Import SecureStore
import { ActivityIndicator, Alert } from 'react-native'; // For feedback

import { router } from 'expo-router';
import { useState } from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useExpenses } from './context/ExpenseContext';
import { COLORS } from './theme';

export default function AddExpense() {
    const { addExpense } = useExpenses();

    // FORM STATE
    const [type, setType] = useState('expense'); // expense | income
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('General');
    const [date, setDate] = useState(new Date());
    const [showDate, setShowDate] = useState(false);

    const [isSaving, setIsSaving] = useState(false); // Add loading state

    const handleSave = async () => {
        if (!title || !amount) {
            Alert.alert("Missing Info", "Please provide a title and amount");
            return;
        }

        setIsSaving(true);

        try {
            // 2. Get the token for authorization
            const token = await SecureStore.getItemAsync('userToken');

            // 3. Prepare the payload exactly as your API expects
            // Note: Your API example shows amount as a string "800000"
            const payload = {
                title: title,
                amount: amount.toString(),
                type: type, // "income" or "expense" (matches your enum)
                date: date.toISOString(), // Standard date format
            };

            // 4. Send to your local API
            const response = await fetch('https://monity.ceekeey.name.ng/api/expensive/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Include the token
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                // 5. Update local context if needed
                addExpense(data);
                router.back();
            } else {
                Alert.alert("Error", data.message || "Failed to save transaction");
            }
        } catch (err) {
            console.log('API error:', err);
            Alert.alert("Network Error", "Check if your server is running");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>Add Transaction</Text>
                <Pressable onPress={() => router.back()}>
                    <Text style={styles.close}>Close</Text>
                </Pressable>
            </View>

            {/* TYPE SWITCH */}
            <View style={styles.switch}>
                <Pressable
                    style={[
                        styles.switchBtn,
                        type === 'expense' && styles.activeExpense,
                    ]}
                    onPress={() => setType('expense')}
                >
                    <Text style={styles.switchText}>Expense</Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.switchBtn,
                        type === 'income' && styles.activeIncome,
                    ]}
                    onPress={() => setType('income')}
                >
                    <Text style={styles.switchText}>Income</Text>
                </Pressable>
            </View>

            {/* FORM */}
            <View style={styles.form}>
                <TextInput
                    placeholder="Title"
                    placeholderTextColor={COLORS.muted}
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                />

                <TextInput
                    placeholder="Amount"
                    placeholderTextColor={COLORS.muted}
                    style={styles.input}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />

                <TextInput
                    placeholder="Category"
                    placeholderTextColor={COLORS.muted}
                    style={styles.input}
                    value={category}
                    onChangeText={setCategory}
                />

                {/* DATE PICKER */}
                <Pressable
                    style={styles.dateBtn}
                    onPress={() => setShowDate(true)}
                >
                    <Text style={styles.dateText}>
                        {date.toDateString()}
                    </Text>
                </Pressable>

                {showDate && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(e, selectedDate) => {
                            setShowDate(false);
                            if (selectedDate) setDate(selectedDate);
                        }}
                    />
                )}

                <Pressable
                    style={[styles.button, isSaving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color={COLORS.text} />
                    ) : (
                        <Text style={styles.buttonText}>
                            Save {type === 'expense' ? 'Expense' : 'Income'}
                        </Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: wp('6%'),
        paddingTop: hp('4%'),
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('4%'),
    },

    title: {
        color: COLORS.text,
        fontSize: wp('6%'),
        fontWeight: '700',
    },

    close: {
        color: COLORS.secondary,
        fontSize: wp('4%'),
    },

    form: {
        marginTop: hp('2%'),
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
        marginTop: hp('2%'),
    },

    buttonText: {
        color: COLORS.text,
        fontSize: wp('4.5%'),
        fontWeight: '600',
    },
    switch: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        marginBottom: hp('3%'),
    },

    switchBtn: {
        flex: 1,
        paddingVertical: hp('1.6%'),
        alignItems: 'center',
        borderRadius: 14,
    },

    activeExpense: {
        backgroundColor: COLORS.error,
    },

    activeIncome: {
        backgroundColor: COLORS.secondary,
    },

    switchText: {
        color: COLORS.text,
        fontWeight: '600',
    },

    dateBtn: {
        backgroundColor: COLORS.surface,
        paddingVertical: hp('1.8%'),
        borderRadius: 12,
        marginBottom: hp('2%'),
    },

    dateText: {
        color: COLORS.text,
        textAlign: 'center',
    },

});
