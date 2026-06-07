import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import { MealDataProvider, useMealData } from '@/hooks/useMealData';

function AppContent() {
  const { isLoggedIn, loading } = useMealData();
  const { colors } = useTheme();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        // Redirect to welcome screen if logged out
        router.replace('/welcome');
      } else {
        // Redirect to tabs screen if logged in
        router.replace('/(tabs)');
      }
    }
  }, [isLoggedIn, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <MealDataProvider>
        <AppContent />
        <StatusBar style="auto" />
      </MealDataProvider>
    </ThemeProvider>
  );
}