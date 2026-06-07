import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Filter, TrendingUp, Smile, Meh, Frown, Trash2 } from 'lucide-react-native';
import { useMealData } from '@/hooks/useMealData';
import { useTheme } from '@/hooks/useTheme';
import HamburgerButton from '@/components/HamburgerButton';

const getRatingIcon = (rating: string) => {
  switch (rating) {
    case 'great':
      return <Smile size={20} color="#22C55E" />;
    case 'good':
      return <Smile size={20} color="#84CC16" />;
    case 'bad':
      return <Meh size={20} color="#F59E0B" />;
    case 'awful':
      return <Frown size={20} color="#EF4444" />;
    default:
      return <Meh size={20} color="#6B7280" />;
  }
};

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'great':
      return '#22C55E';
    case 'good':
      return '#84CC16';
    case 'bad':
      return '#F59E0B';
    case 'awful':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

export default function TimelineScreen() {
  const { isDark } = useTheme();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { meals, loading, deleteMeal, getMealsByPeriod, getStats } = useMealData();

  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#1F1F1F' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1F2937',
    textSecondary: isDark ? '#A1A1AA' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    primary: '#22C55E',
    secondary: '#3B82F6',
    warning: '#F59E0B',
    danger: '#EF4444',
    success: '#10B981',
  };

  const filteredMeals = getMealsByPeriod(selectedPeriod);
  const stats = getStats();

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDeleteMeal = async (mealId: string) => {
    await deleteMeal(mealId);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading your meals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const gradientColors: readonly [string, string] = isDark ? ['#16A34A', '#000000'] : ['#F0FDF4', '#FFFFFF'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradientColors}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <HamburgerButton />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.greeting, { color: colors.text }]}>Your Journey</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>Track your nutrition progress</Text>
          </View>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.surface }]}>
            <Filter size={20} color="#22C55E" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <TrendingUp size={16} color="#22C55E" />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalCalories}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Cal</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Smile size={16} color="#22C55E" />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.healthyMeals}/{stats.totalMeals}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Healthy</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Calendar size={16} color="#22C55E" />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
          </View>
        </View>

        <View style={[styles.periodSelector, { backgroundColor: isDark ? '#374151' : '#F1F5F9' }]}>
          {(['day', 'week', 'month', 'all'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && [styles.periodButtonActive, { backgroundColor: colors.surface }]
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  { color: colors.textSecondary },
                  selectedPeriod === period && { color: colors.primary }
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredMeals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No meals yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Start tracking your nutrition by adding your first meal!
            </Text>
          </View>
        ) : (
          <>
             <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedPeriod === 'day' ? "Today's Meals" : 
               selectedPeriod === 'week' ? "This Week's Meals" : 
               selectedPeriod === 'month' ? "This Month's Meals" :
               "All Meals"} ({filteredMeals.length})
             </Text>
            
            {filteredMeals.map((meal) => (
              <View key={meal.id} style={[styles.mealCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealInfo}>
                    <Text style={[styles.mealName, { color: colors.text }]}>{meal.name}</Text>
                    <Text style={[styles.mealTime, { color: colors.textSecondary }]}>
                      {formatDate(meal.createdAt)} at {meal.time}
                    </Text>
                  </View>
                  <View style={styles.mealActions}>
                    <View style={[styles.ratingContainer, { backgroundColor: isDark ? '#374151' : '#F8FAFC' }]}>
                      {getRatingIcon(meal.rating)}
                      <Text style={[styles.ratingText, { color: getRatingColor(meal.rating) }]}>
                        {meal.rating.charAt(0).toUpperCase() + meal.rating.slice(1)}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteMeal(meal.id)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {meal.image && (
                  <Image source={{ uri: meal.image }} style={styles.mealImage} />
                )}

                <View style={[styles.mealFooter, { borderTopColor: colors.border }]}>
                  <View style={styles.mealStats}>
                    <Text style={[styles.calories, { color: colors.text }]}>
                      {meal.calories ? `${meal.calories} cal` : 'Calories not tracked'}
                    </Text>
                    <View style={[
                      styles.healthyBadge,
                      { backgroundColor: meal.isHealthy ? (isDark ? '#16A34A30' : '#DCFCE7') : (isDark ? '#DC262630' : '#FEF2F2') }
                    ]}>
                      <Text style={[
                        styles.healthyText,
                        { color: meal.isHealthy ? '#16A34A' : '#DC2626' }
                      ]}>
                        {meal.isHealthy ? 'Healthy' : 'Unhealthy'}
                      </Text>
                    </View>
                  </View>
                  
                  {meal.notes && (
                    <Text style={[styles.mealNotes, { color: colors.textSecondary }]}>"{meal.notes}"</Text>
                  )}
                  
                  {meal.allergies && (
                    <Text style={[styles.allergies, { color: colors.danger }]}>
                      <Text style={styles.allergiesLabel}>Allergies: </Text>
                      {meal.allergies}
                    </Text>
                  )}
                </View>

                {(meal.rating === 'bad' || meal.rating === 'awful') && (
                  <View style={[styles.aiSuggestion, { backgroundColor: isDark ? '#451A03' : '#FEF3C7' }]}>
                    <Text style={[styles.aiTitle, { color: isDark ? '#FCD34D' : '#92400E' }]}>💡 Wellness Suggestion</Text>
                    <Text style={[styles.aiText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                      {meal.rating === 'awful' 
                        ? "Consider some ginger tea to help with digestion and try lighter meals for the rest of the day."
                        : "Try drinking more water and consider a short walk to help with digestion."
                      }
                    </Text>
                    <TouchableOpacity style={styles.aiButton}>
                      <Text style={styles.aiButtonText}>Get More Tips</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
  },
  date: {
    fontSize: 16,
    marginTop: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  mealCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
  },
  mealTime: {
    fontSize: 14,
    marginTop: 4,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  mealFooter: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  mealStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calories: {
    fontSize: 16,
    fontWeight: '600',
  },
  healthyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  healthyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mealNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  allergies: {
    fontSize: 12,
  },
  allergiesLabel: {
    fontWeight: '600',
  },
  aiSuggestion: {
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  aiText: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  aiButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 20,
  },
});