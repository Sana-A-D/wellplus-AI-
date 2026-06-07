import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Switch, Alert, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell, Shield, Download,
  CreditCard as Edit3, Target, Activity, Award,
  ChevronRight, LogOut, X, Save,
} from 'lucide-react-native';
import { useMealData } from '@/hooks/useMealData';
import { useTheme } from '@/hooks/useTheme';
import { useNotifications } from '@/hooks/useNotifications';
import * as ImagePicker from 'expo-image-picker';
import HamburgerButton from '@/components/HamburgerButton';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { userSettings, updateUserSettings, getStats, signOut } = useMealData();
  const stats = getStats();
  const { scheduleMealReminders } = useNotifications();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedImage, setEditedImage] = useState<string | undefined>();

  const openEditProfile = () => {
    setEditedName(userSettings.profile.name);
    setEditedEmail(userSettings.profile.email);
    setEditedImage(userSettings.profile.profileImage);
    setShowEditProfile(true);
  };

  const saveProfile = () => {
    updateUserSettings({
      ...userSettings,
      profile: { ...userSettings.profile, name: editedName, email: editedEmail, profileImage: editedImage },
    });
    setShowEditProfile(false);
    Alert.alert('Success', 'Profile updated!');
  };

  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].base64
        ? `data:image/jpeg;base64,${result.assets[0].base64}`
        : result.assets[0].uri;
      setEditedImage(uri);
    }
  };

  const gradientColors: readonly [string, string] = ['#EFF6FF', '#FAFBFD'];

  /* ── Settings list ── */
  type ItemType = { title: string; desc: string; icon: React.ReactNode; action: () => void; right?: React.ReactNode };

  const sections: { heading: string; items: ItemType[] }[] = [
    {
      heading: 'Notifications',
      items: [
        {
          title: 'Meal Reminders',
          desc: 'Get notified at meal times',
          icon: <Bell size={18} color="#F59E0B" />,
          action: () => {},
          right: (
            <Switch
              value={userSettings.notifications.mealReminders}
              onValueChange={v => {
                updateUserSettings({
                  ...userSettings,
                  notifications: { ...userSettings.notifications, mealReminders: v },
                });
                scheduleMealReminders(v);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          ),
        },
        {
          title: 'Goal Achievements',
          desc: 'Celebrate your milestones',
          icon: <Award size={18} color={colors.primary} />,
          action: () => {},
          right: (
            <Switch
              value={userSettings.notifications.goalAchievements}
              onValueChange={v => updateUserSettings({
                ...userSettings,
                notifications: { ...userSettings.notifications, goalAchievements: v },
              })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          ),
        },
      ],
    },
    {
      heading: 'App',
      items: [
        {
          title: 'Goals & Targets',
          desc: `${userSettings.dailyCalorieGoal} cal daily`,
          icon: <Target size={18} color={colors.secondary} />,
          action: () => Alert.alert('Goals', `Calories: ${userSettings.dailyCalorieGoal} cal\nWater: ${userSettings.dailyWaterGoal} glasses`),
        },
        {
          title: 'Privacy & Security',
          desc: 'Your data stays on device',
          icon: <Shield size={18} color="#EF4444" />,
          action: () => Alert.alert('Privacy', 'All data is stored locally and never shared.'),
        },
        {
          title: 'Export Data',
          desc: 'Download meal history',
          icon: <Download size={18} color={colors.success} />,
          action: () => Alert.alert('Export', `Meals: ${stats.totalMeals}\nHealthy: ${stats.healthyMeals}\nStreak: ${stats.streak} days`),
        },
      ],
    },
    {
      heading: '',
      items: [{
        title: 'Sign Out',
        desc: '',
        icon: <LogOut size={18} color="#EF4444" />,
        action: () => Alert.alert('Sign Out', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
        ]),
      }],
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={gradientColors} style={styles.header}>
          <View style={styles.headerTopRow}>
            <HamburgerButton />
          </View>
          <TouchableOpacity style={styles.profileRow} onPress={openEditProfile} activeOpacity={0.7}>
            <Image
              source={{ uri: userSettings.profile.profileImage || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>{userSettings.profile.name}</Text>
              <Text style={[styles.email, { color: colors.textSecondary }]}>{userSettings.profile.email}</Text>
            </View>
            <Edit3 size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.statsRow}>
            {[
              { n: stats.totalMeals, l: 'Meals', icon: <Award size={14} color="#F59E0B" /> },
              { n: stats.healthyMeals, l: 'Healthy', icon: <Activity size={14} color={colors.primary} /> },
              { n: stats.streak, l: 'Streak', icon: <Target size={14} color={colors.secondary} /> },
            ].map((s, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: colors.surface }]}>
                {s.icon}
                <Text style={[styles.statNum, { color: colors.text }]}>{s.n}</Text>
                <Text style={[styles.statLbl, { color: colors.textSecondary }]}>{s.l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Settings Sections */}
        <View style={styles.settingsWrap}>
          {sections.map((sec, si) => (
            <View key={si} style={[styles.section, { backgroundColor: colors.surface }]}>
              {sec.heading ? (
                <Text style={[styles.secHeading, { color: colors.textSecondary }]}>{sec.heading}</Text>
              ) : null}
              {sec.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[styles.row, ii < sec.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                  onPress={item.action}
                  disabled={!!item.right}
                  activeOpacity={0.6}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
                    {item.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: item.title === 'Sign Out' ? '#EF4444' : colors.text }]}>
                      {item.title}
                    </Text>
                    {item.desc ? <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>{item.desc}</Text> : null}
                  </View>
                  {item.right || <ChevronRight size={18} color={colors.textSecondary} />}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <Text style={[styles.footer, { color: colors.textSecondary }]}>
            WellPlus v1.0
          </Text>
        </View>
      </ScrollView>


      {/* ── Edit Profile Modal ── */}
      <Modal visible={showEditProfile} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: colors.background }]}>
          <View style={[styles.modalBar, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}><X size={22} color={colors.textSecondary} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <TouchableOpacity style={styles.avatarEdit} onPress={pickProfileImage}>
              <Image
                source={{ uri: editedImage || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                style={styles.avatarLg}
              />
              <Text style={[styles.changePhoto, { color: colors.secondary }]}>Change Photo</Text>
            </TouchableOpacity>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={editedName} onChangeText={setEditedName}
              placeholder="Full name" placeholderTextColor={colors.textSecondary}
            />
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={editedEmail} onChangeText={setEditedEmail}
              placeholder="Email" placeholderTextColor={colors.textSecondary}
              keyboardType="email-address" autoCapitalize="none"
            />
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={saveProfile}>
              <Save size={18} color="#FFF" />
              <Text style={styles.saveTxt}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  headerTopRow: { marginBottom: 8 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  name: { fontSize: 20, fontWeight: '700' },
  email: { fontSize: 14, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14 },
  statNum: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  statLbl: { fontSize: 11, marginTop: 2 },

  settingsWrap: { paddingHorizontal: 16, paddingTop: 12 },
  section: { borderRadius: 14, marginBottom: 14, overflow: 'hidden' },
  secHeading: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowDesc: { fontSize: 13, marginTop: 1 },
  footer: { textAlign: 'center', fontSize: 13, paddingVertical: 20 },

  modalSafe: { flex: 1 },
  modalBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalBody: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 12 },
  hint: { fontSize: 12, lineHeight: 18, marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4, marginTop: 8 },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 8, marginTop: 12 },
  saveTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },



  avatarEdit: { alignItems: 'center', marginBottom: 20 },
  avatarLg: { width: 100, height: 100, borderRadius: 50 },
  changePhoto: { fontSize: 14, fontWeight: '600', marginTop: 8 },
});