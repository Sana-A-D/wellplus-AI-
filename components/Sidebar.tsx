import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { useSidebar } from './SidebarContext';
import { useTheme } from '@/hooks/useTheme';
import { useMealData } from '@/hooks/useMealData';
import { router, usePathname } from 'expo-router';
import {
  Calendar,
  Plus,
  ChefHat,
  Droplets,
  Wrench,
  User,
  X,
  Sparkles,
} from 'lucide-react-native';

const SIDEBAR_WIDTH = 280;

const navItems = [
  { label: 'Timeline',  route: '/(tabs)',           icon: Calendar,  color: '#22C55E' },
  { label: 'Add Meal',  route: '/(tabs)/add-meal',  icon: Plus,      color: '#3B82F6' },
  { label: 'Meal Prep', route: '/(tabs)/meal-prep', icon: ChefHat,   color: '#F59E0B' },
  { label: 'Tracking',  route: '/(tabs)/hydration', icon: Droplets,  color: '#0EA5E9' },
  { label: 'Toolkit',   route: '/(tabs)/toolkit',   icon: Wrench,    color: '#8B5CF6' },
  { label: 'Profile',   route: '/(tabs)/profile',   icon: User,      color: '#EF4444' },
];

export default function Sidebar() {
  const { isOpen, closeSidebar } = useSidebar();
  const { colors, isDark } = useTheme();
  const { userSettings } = useMealData();
  const pathname = usePathname();

  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayOpacity, {
        toValue: isOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  const navigate = (route: string) => {
    closeSidebar();
    setTimeout(() => router.push(route as any), 150);
  };

  const isActive = (route: string) => {
    if (route === '/(tabs)') return pathname === '/' || pathname === '/index' || pathname === '/(tabs)';
    return pathname.includes(route.replace('/(tabs)', ''));
  };

  const profileImage = userSettings?.profile?.profileImage;
  const userName = userSettings?.profile?.name || 'User';
  const userEmail = userSettings?.profile?.email || '';

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <Animated.View
          style={[styles.overlay, { opacity: overlayOpacity }]}
          pointerEvents={isOpen ? 'auto' : 'none'}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeSidebar} activeOpacity={1} />
        </Animated.View>
      )}

      {/* Drawer Panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: isDark ? '#111827' : '#FFFFFF',
            transform: [{ translateX }],
            borderRightColor: isDark ? '#1F2937' : '#E5E7EB',
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.drawerHeader, { borderBottomColor: isDark ? '#1F2937' : '#F1F5F9' }]}>
          <View style={styles.brandRow}>
            <View style={[styles.brandIcon, { backgroundColor: '#22C55E20' }]}>
              <Sparkles size={20} color="#22C55E" />
            </View>
            <Text style={[styles.brandName, { color: colors.text }]}>WellPlus</Text>
          </View>
          <TouchableOpacity onPress={closeSidebar} style={[styles.closeBtn, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC' }]}>
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* User Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC', borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <Image
            source={{ uri: profileImage || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>{userName}</Text>
            {userEmail ? (
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]} numberOfLines={1}>{userEmail}</Text>
            ) : null}
          </View>
        </View>

        {/* Nav Items */}
        <View style={styles.navList}>
          {navItems.map((item) => {
            const IconComp = item.icon;
            const active = isActive(item.route);
            return (
              <TouchableOpacity
                key={item.route}
                style={[
                  styles.navItem,
                  active && { backgroundColor: item.color + '18', borderLeftColor: item.color },
                  !active && { borderLeftColor: 'transparent' },
                ]}
                onPress={() => navigate(item.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, { backgroundColor: active ? item.color + '20' : isDark ? '#1F2937' : '#F1F5F9' }]}>
                  <IconComp size={20} color={active ? item.color : colors.textSecondary} />
                </View>
                <Text style={[
                  styles.navLabel,
                  { color: active ? item.color : colors.text },
                  active && styles.navLabelActive,
                ]}>
                  {item.label}
                </Text>
                {active && <View style={[styles.activeDot, { backgroundColor: item.color }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={[styles.drawerFooter, { borderTopColor: isDark ? '#1F2937' : '#F1F5F9' }]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>WellPlus v1.0</Text>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 100,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 200,
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  navList: {
    flex: 1,
    paddingTop: 4,
    paddingHorizontal: 10,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 2,
    borderLeftWidth: 3,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  navLabelActive: {
    fontWeight: '700',
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  drawerFooter: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
