import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ExpenseProvider } from './context/ExpenseContext';
import { COLORS } from './theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <ExpenseProvider>

        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: COLORS.background,
          }}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />

            {/* MODAL */}
            <Stack.Screen
              name="add-expense"
              options={{ presentation: 'modal' }}
            />
          </Stack>
          <Toast />
        </SafeAreaView>
      </ExpenseProvider>
    </SafeAreaProvider>
  );
}
