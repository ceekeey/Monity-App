import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store'; // 1. Import SecureStore
import { useEffect, useState } from 'react'; // 2. Import useEffect
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from './theme';

export default function Landing() {
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');

      if (token) {
        // 3. If token exists, redirect to home (tabs) immediately
        router.replace('/(tabs)');
      }
    } catch (e) {
      console.error("Auth check failed", e);
    } finally {
      setCheckingAuth(false);
    }
  };

  // 4. Show a loader while checking so the user doesn't see the landing page flash
  if (checkingAuth) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Center Content */}
      <View style={styles.center}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.appName}>MONITY</Text>
        <Text style={styles.tagline}>
          Smart budgeting, simple tracking, total control.
        </Text>
      </View>

      {/* CTA */}
      <Pressable
        style={styles.button}
        onPress={() => router.push('/(auth)/auth')} // Or wherever your login is
      >
        <Text style={styles.buttonText}>Get Started</Text>
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
    justifyContent: 'space-between',
    paddingBottom: hp('6%'),
  },

  center: {
    alignItems: 'center',
    marginTop: hp('18%'),
  },

  image: {
    width: wp('55%'),
    height: hp('28%'),
    marginBottom: hp('4%'),
  },

  appName: {
    color: COLORS.text,
    fontSize: wp('9%'),
    fontWeight: '800',
    letterSpacing: 2,
  },

  tagline: {
    color: COLORS.muted,
    fontSize: wp('4%'),
    textAlign: 'center',
    marginTop: hp('1.5%'),
    maxWidth: wp('80%'),
    lineHeight: 22,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp('2%'),
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: COLORS.text,
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
});
