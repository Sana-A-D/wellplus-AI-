import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Droplets, Plus, Minus, TrendingUp, Trophy, Flame,
} from 'lucide-react-native';
import { useMealData } from '@/hooks/useMealData';
import { useTheme } from '@/hooks/useTheme';
import HamburgerButton from '@/components/HamburgerButton';

export default function HydrationScreen() {
  const { isDark, colors } = useTheme();
  const {
    userSettings, addWaterEntry, removeWaterEntry, updateUserSettings,
    getTodaysWaterEntries, getTodaysCalories,
  } = useMealData();

  const [waterAnim] = useState(new Animated.Value(0));
  const [calAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  const todaysWater = getTodaysWaterEntries();
  const todaysCal = getTodaysCalories();
  const totalMl = todaysWater.reduce((s, e) => s + e.amount, 0);
  const glasses = Math.floor(totalMl / 250);
  const waterPct = Math.min((glasses / userSettings.dailyWaterGoal) * 100, 100);
  const calPct = Math.min((todaysCal / userSettings.dailyCalorieGoal) * 100, 100);

  useEffect(() => {
    Animated.timing(waterAnim, { toValue: waterPct / 100, duration: 800, useNativeDriver: false }).start();
  }, [glasses]);

  useEffect(() => {
    Animated.timing(calAnim, { toValue: calPct / 100, duration: 800, useNativeDriver: false }).start();
  }, [todaysCal]);

  const pulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 120, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const addWater = async () => { await addWaterEntry(250); pulse(); };
  const removeWater = async () => {
    const ok = await removeWaterEntry();
    if (!ok) Alert.alert('Info', 'No water entries to remove today.');
  };

  const adjustWaterGoal = (up: boolean) => {
    updateUserSettings({ dailyWaterGoal: up ? userSettings.dailyWaterGoal + 1 : Math.max(1, userSettings.dailyWaterGoal - 1) });
  };
  const adjustCalGoal = (up: boolean) => {
    updateUserSettings({ dailyCalorieGoal: up ? userSettings.dailyCalorieGoal + 100 : Math.max(500, userSettings.dailyCalorieGoal - 100) });
  };

  const gradientColors: readonly [string, string] = isDark
    ? ['#0C4A6E', '#0F172A'] : ['#F0F9FF', '#FFFFFF'];

  const ProgressBar = ({
    animValue, label, current, goal, unit, color, icon,
  }: {
    animValue: Animated.Value; label: string; current: string;
    goal: string; unit: string; color: string; icon: React.ReactNode;
  }) => (
    <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.progressHeader}>
        {icon}
        <Text style={[styles.progressLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={styles.progressNumbers}>
        <Text style={[styles.bigNumber, { color }]}>{current}</Text>
        <Text style={[styles.goalText, { color: colors.textSecondary }]}>/ {goal} {unit}</Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.barFill, {
          backgroundColor: color,
          width: animValue.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <LinearGradient colors={gradientColors} style={styles.header}>
        <View style={styles.headerRow}>
          <HamburgerButton />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.title, { color: colors.text }]}>Daily Tracking</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Stay on top of hydration & calories
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Water Card ── */}
        <ProgressBar
          animValue={waterAnim}
          label="Hydration"
          current={String(glasses)}
          goal={String(userSettings.dailyWaterGoal)}
          unit="glasses"
          color="#0EA5E9"
          icon={<Droplets size={20} color="#0EA5E9" />}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
            onPress={removeWater}
          >
            <Minus size={20} color="#EF4444" />
            <Text style={[styles.actionTxt, { color: '#EF4444' }]}>Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#0EA5E9' }]}
            onPress={addWater}
          >
            <Plus size={20} color="#FFF" />
            <Text style={[styles.actionTxt, { color: '#FFF' }]}>+250 ml</Text>
          </TouchableOpacity>
        </View>

        {/* Water goal adjuster */}
        <View style={[styles.goalRow, { borderColor: colors.border }]}>
          <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>Daily water goal</Text>
          <View style={styles.goalControls}>
            <TouchableOpacity onPress={() => adjustWaterGoal(false)} style={[styles.goalBtn, { borderColor: colors.border }]}>
              <Minus size={14} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.goalVal, { color: colors.text }]}>{userSettings.dailyWaterGoal}</Text>
            <TouchableOpacity onPress={() => adjustWaterGoal(true)} style={[styles.goalBtn, { borderColor: colors.border }]}>
              <Plus size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Calorie Card ── */}
        <View style={{ marginTop: 24 }}>
          <ProgressBar
            animValue={calAnim}
            label="Calories"
            current={String(todaysCal)}
            goal={String(userSettings.dailyCalorieGoal)}
            unit="cal"
            color="#F59E0B"
            icon={<Flame size={20} color="#F59E0B" />}
          />
        </View>

        {/* Calorie goal adjuster */}
        <View style={[styles.goalRow, { borderColor: colors.border }]}>
          <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>Daily calorie goal</Text>
          <View style={styles.goalControls}>
            <TouchableOpacity onPress={() => adjustCalGoal(false)} style={[styles.goalBtn, { borderColor: colors.border }]}>
              <Minus size={14} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.goalVal, { color: colors.text }]}>{userSettings.dailyCalorieGoal}</Text>
            <TouchableOpacity onPress={() => adjustCalGoal(true)} style={[styles.goalBtn, { borderColor: colors.border }]}>
              <Plus size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats row */}
        <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Droplets size={16} color="#0EA5E9" />
            <Text style={[styles.statNum, { color: colors.text }]}>{totalMl} ml</Text>
            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Total Water</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <TrendingUp size={16} color="#F59E0B" />
            <Text style={[styles.statNum, { color: colors.text }]}>{Math.round(calPct)}%</Text>
            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Cal Progress</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Trophy size={16} color={colors.primary} />
            <Text style={[styles.statNum, { color: colors.text }]}>
              {waterPct >= 100 && calPct >= 100 ? '🏆' : waterPct >= 100 || calPct >= 100 ? '⭐' : '⏳'}
            </Text>
            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Goals</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 2 },
  content: { paddingHorizontal: 20, paddingTop: 8 },

  progressCard: {
    borderRadius: 16, padding: 20, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  progressLabel: { fontSize: 16, fontWeight: '600' },
  progressNumbers: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 12 },
  bigNumber: { fontSize: 36, fontWeight: '800' },
  goalText: { fontSize: 16 },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14, gap: 8, borderWidth: 1, borderColor: 'transparent',
  },
  actionTxt: { fontSize: 15, fontWeight: '600' },

  goalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingVertical: 10, borderBottomWidth: 1,
  },
  goalLabel: { fontSize: 14 },
  goalControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goalBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  goalVal: { fontSize: 16, fontWeight: '700', minWidth: 50, textAlign: 'center' },

  statsRow: {
    flexDirection: 'row', borderRadius: 16, padding: 16, marginTop: 24, borderWidth: 1,
    justifyContent: 'space-around', alignItems: 'center',
  },
  stat: { alignItems: 'center', gap: 4 },
  statNum: { fontSize: 18, fontWeight: '700' },
  statLbl: { fontSize: 11 },
  statDivider: { width: 1, height: 40 },
});