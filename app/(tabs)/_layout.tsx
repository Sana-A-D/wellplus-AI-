import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { SidebarProvider } from '@/components/SidebarContext';
import Sidebar from '@/components/Sidebar';

export default function TabLayout() {
  return (
    <SidebarProvider>
      {/* Root container so Sidebar can overlay the Tabs content */}
      <View style={styles.root}>
        <Tabs
          screenOptions={{
            headerShown: false,
            // Hide the native bottom tab bar — we use the sidebar instead
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="index"     options={{ title: 'Timeline'  }} />
          <Tabs.Screen name="add-meal"  options={{ title: 'Add Meal'  }} />
          <Tabs.Screen name="meal-prep" options={{ title: 'Meal Prep' }} />
          <Tabs.Screen name="hydration" options={{ title: 'Tracking'  }} />
          <Tabs.Screen name="toolkit"   options={{ title: 'Toolkit'   }} />
          <Tabs.Screen name="profile"   options={{ title: 'Profile'   }} />
        </Tabs>

        {/* Sidebar rendered on top of all tab content */}
        <Sidebar />
      </View>
    </SidebarProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});