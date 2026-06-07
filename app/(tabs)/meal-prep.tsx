import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChefHat, 
  Calendar, 
  Clock, 
  Plus, 
  Sparkles, 
  Bell, 
  CircleCheck as CheckCircle,
  Trash2,
  X,
  Save
} from 'lucide-react-native';
import { useMealData, PlannedMeal, MealPlan } from '@/hooks/useMealData';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { useTheme } from '@/hooks/useTheme';
import HamburgerButton from '@/components/HamburgerButton';

export default function MealPrepScreen() {
  const { isDark } = useTheme();
  const { generateResponse, generateMealPlan, isLoading } = useGeminiAI();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanMeals, setNewPlanMeals] = useState<Omit<PlannedMeal, 'id'>[]>([]);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderNote, setReminderNote] = useState('Time for your healthy meal!');

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

  const { 
    mealPlans, 
    addMealPlan, 
    deleteMealPlan, 
    updateMealPlan, 
    getStats,
    userSettings,
    updateUserSettings
  } = useMealData();
  
  const stats = getStats();
  const activePlan = mealPlans.find(plan => plan.isActive);

  const toggleMealCompletion = async (planId: string, mealId: string) => {
    const plan = mealPlans.find(p => p.id === planId);
    if (!plan) return;

    const updatedMeals = plan.meals.map(meal => 
      meal.id === mealId 
        ? { ...meal, isCompleted: !meal.isCompleted, completedAt: !meal.isCompleted ? Date.now() : undefined }
        : meal
    );

    await updateMealPlan(planId, { meals: updatedMeals });
  };

  const deletePlannedMeal = async (planId: string, mealId: string) => {
    const plan = mealPlans.find(p => p.id === planId);
    if (!plan) return;

    const updatedMeals = plan.meals.filter(meal => meal.id !== mealId);
    await updateMealPlan(planId, { meals: updatedMeals });
  };

  const createCustomPlan = async () => {
    if (!newPlanName.trim()) {
      Alert.alert('Error', 'Please enter a plan name');
      return;
    }

    if (newPlanMeals.length === 0) {
      Alert.alert('Error', 'Please add at least one meal to your plan');
      return;
    }

    const mealsWithIds = newPlanMeals.map(meal => ({
      ...meal,
      id: Date.now().toString() + Math.random().toString(),
    }));

    // Deactivate other plans
    for (const plan of mealPlans) {
      if (plan.isActive) {
        await updateMealPlan(plan.id, { isActive: false });
      }
    }

    await addMealPlan({
      name: newPlanName,
      meals: mealsWithIds,
      period: selectedPeriod,
      startDate: new Date().toISOString(),
      endDate: selectedPeriod === 'custom' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      isActive: true,
    });

    setNewPlanName('');
    setNewPlanMeals([]);
    setShowCreatePlan(false);
    Alert.alert('Success', 'Your custom meal plan has been created and activated!');
  };

  const addMealToPlan = () => {
    setNewPlanMeals([...newPlanMeals, {
      name: '',
      time: '12:00',
      calories: 300,
      isCompleted: false,
    }]);
  };

  const updatePlanMeal = (index: number, field: keyof Omit<PlannedMeal, 'id'>, value: any) => {
    const updatedMeals = [...newPlanMeals];
    updatedMeals[index] = { ...updatedMeals[index], [field]: value };
    setNewPlanMeals(updatedMeals);
  };

  const removePlanMeal = (index: number) => {
    setNewPlanMeals(newPlanMeals.filter((_, i) => i !== index));
  };

  const setupReminders = () => {
    if (!reminderDate.trim()) {
      Alert.alert('Error', 'Please enter a reminder date (YYYY-MM-DD)');
      return;
    }

    updateUserSettings({
      ...userSettings,
      notifications: {
        ...userSettings.notifications,
        mealReminders: true,
      }
    });
    
    Alert.alert(
      'Reminders Set!', 
      `You'll receive meal reminders on ${reminderDate} at ${reminderTime} with the note: "${reminderNote}". Note: Actual push notifications require additional setup in a production app.`,
      [{ text: 'Got it!' }]
    );
    setShowReminders(false);
  };

  const createAISuggestedPlan = async () => {
    try {
      // Deactivate other plans
      for (const plan of mealPlans) {
        if (plan.isActive) {
          await updateMealPlan(plan.id, { isActive: false });
        }
      }

      const result = await generateMealPlan(selectedPeriod);
      
      const mealsWithIds = result.meals.map(meal => ({
        ...meal,
        isCompleted: false,
        id: Date.now().toString() + Math.random().toString(),
      }));

      await addMealPlan({
        name: result.planName,
        meals: mealsWithIds,
        period: selectedPeriod,
        startDate: new Date().toISOString(),
        isActive: true,
      });

      Alert.alert('Success', `${result.planName} created and activated!`);
    } catch (error) {
      console.error('Error generating AI plan:', error);
      Alert.alert('Error', 'Failed to create AI meal plan. Please try again.');
    }
  };

  const generateMealPlanTable = () => {
    if (!activePlan) return null;

    const today = new Date();
    const dates = [];
    
    switch (selectedPeriod) {
      case 'daily':
        dates.push(today);
        break;
      case 'weekly':
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          dates.push(date);
        }
        break;
      case 'monthly':
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          dates.push(date);
        }
        break;
      default:
        dates.push(today);
    }

    return (
      <View style={[styles.mealPlanTable, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.tableTitle, { color: colors.text }]}>
          {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Meal Plan
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header */}
            <View style={styles.tableHeader}>
              <View style={[styles.tableCell, styles.dateColumn]}>
                <Text style={[styles.tableCellText, { color: colors.text, fontWeight: '600' }]}>Date</Text>
              </View>
              {activePlan.meals.map((meal, index) => (
                <View key={index} style={[styles.tableCell, styles.mealColumn]}>
                  <Text style={[styles.tableCellText, { color: colors.text, fontWeight: '600' }]}>
                    {meal.time}
                  </Text>
                  <Text style={[styles.tableCellSubtext, { color: colors.textSecondary }]}>
                    {meal.name}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Rows */}
            {dates.map((date, dateIndex) => (
              <View key={dateIndex} style={[styles.tableRow, { borderTopColor: colors.border }]}>
                <View style={[styles.tableCell, styles.dateColumn]}>
                  <Text style={[styles.tableCellText, { color: colors.text }]}>
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={[styles.tableCellSubtext, { color: colors.textSecondary }]}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                </View>
                {activePlan.meals.map((meal, mealIndex) => (
                  <View key={mealIndex} style={[styles.tableCell, styles.mealColumn]}>
                    <TouchableOpacity
                      style={[
                        styles.mealCheckbox,
                        { borderColor: colors.border },
                        dateIndex === 0 && meal.isCompleted && styles.checkedMeal
                      ]}
                      onPress={() => dateIndex === 0 && toggleMealCompletion(activePlan.id, meal.id)}
                      disabled={dateIndex !== 0}
                    >
                      {dateIndex === 0 && meal.isCompleted && (
                        <CheckCircle size={16} color="#22C55E" />
                      )}
                    </TouchableOpacity>
                    <Text style={[styles.tableMealCalories, { color: colors.textSecondary }]}>
                      {meal.calories} cal
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderTodaySection = () => {
    if (!activePlan) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Active Meal Plan</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Create a meal plan to start tracking your daily nutrition goals</Text>
          <TouchableOpacity 
            style={[styles.createPlanButton, isLoading && { opacity: 0.7 }]} 
            onPress={createAISuggestedPlan}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Sparkles size={20} color="#FFFFFF" />
            )}
            <Text style={styles.createPlanButtonText}>
              {isLoading ? 'Generating Plan...' : 'Create Smart Meal Plan'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    const completedCount = activePlan.meals.filter(meal => meal.isCompleted).length;
    const totalCalories = activePlan.meals
      .filter(meal => meal.isCompleted)
      .reduce((sum, meal) => sum + meal.calories, 0);

    return (
      <>
        <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Today's Progress</Text>
            <Text style={[styles.progressSubtitle, { color: colors.textSecondary }]}>{activePlan.name}</Text>
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={[styles.progressNumber, { color: colors.primary }]}>{completedCount}</Text>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Completed</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={[styles.progressNumber, { color: colors.warning }]}>{activePlan.meals.length - completedCount}</Text>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Remaining</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={[styles.progressNumber, { color: colors.secondary }]}>{totalCalories}</Text>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Calories</Text>
            </View>
          </View>
        </View>

        {generateMealPlanTable()}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Planned Meals</Text>
          <TouchableOpacity 
            style={[styles.reminderButton, { backgroundColor: isDark ? '#451A03' : '#FEF3C7' }]}
            onPress={() => setShowReminders(true)}
          >
            <Bell size={16} color="#F59E0B" />
            <Text style={[styles.reminderButtonText, { color: isDark ? '#FCD34D' : '#F59E0B' }]}>Reminders</Text>
          </TouchableOpacity>
        </View>

        {activePlan.meals.map((meal) => (
          <View key={meal.id} style={[styles.mealItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.mealTime}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={[styles.mealTimeText, { color: colors.textSecondary }]}>{meal.time}</Text>
            </View>
            <View style={styles.mealDetails}>
              <Text style={[
                styles.mealName, 
                { color: colors.text },
                meal.isCompleted && styles.completedMeal
              ]}>
                {meal.name}
              </Text>
              <Text style={[styles.mealCalories, { color: colors.textSecondary }]}>{meal.calories} cal</Text>
            </View>
            <View style={styles.mealActions}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePlannedMeal(activePlan.id, meal.id)}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.checkButton,
                  { borderColor: colors.border },
                  meal.isCompleted && styles.checkedButton
                ]}
                onPress={() => toggleMealCompletion(activePlan.id, meal.id)}
              >
                {meal.isCompleted && (
                  <CheckCircle size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </>
    );
  };

  const gradientColors: readonly [string, string] = isDark ? ['#92400E', '#000000'] : ['#FEF3C7', '#FFFFFF'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradientColors}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <HamburgerButton />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.title, { color: colors.text }]}>Meal Planning</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Smart nutrition planning</Text>
          </View>
        </View>

        <View style={[styles.periodSelector, { backgroundColor: isDark ? '#374151' : '#F1F5F9' }]}>
          {(['daily', 'weekly', 'monthly', 'custom'] as const).map((period) => (
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
                  selectedPeriod === period && { color: colors.warning }
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTodaySection()}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Create Your Plan</Text>
        </View>

        <View style={styles.planOptions}>
          <TouchableOpacity 
            style={[styles.planOption, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => setShowCreatePlan(true)}
          >
            <View style={[styles.planOptionIcon, { backgroundColor: isDark ? '#374151' : '#F8FAFC' }]}>
              <Plus size={24} color="#22C55E" />
            </View>
            <View style={styles.planOptionContent}>
              <Text style={[styles.planOptionTitle, { color: colors.text }]}>Custom Plan</Text>
              <Text style={[styles.planOptionDescription, { color: colors.textSecondary }]}>
                Create your own meal plan with your favorite foods and schedule
              </Text>
            </View>
          </TouchableOpacity>

           <TouchableOpacity 
            style={[styles.planOption, { backgroundColor: colors.surface, borderColor: colors.border }, isLoading && { opacity: 0.7 }]} 
            onPress={createAISuggestedPlan}
            disabled={isLoading}
          >
            <View style={[styles.planOptionIcon, { backgroundColor: isDark ? '#374151' : '#F8FAFC' }]}>
              {isLoading ? (
                <ActivityIndicator color="#8B5CF6" size="small" />
              ) : (
                <Sparkles size={24} color="#8B5CF6" />
              )}
            </View>
            <View style={styles.planOptionContent}>
              <Text style={[styles.planOptionTitle, { color: colors.text }]}>
                {isLoading ? 'Generating Plan...' : 'Smart Meal Plan'}
              </Text>
              <Text style={[styles.planOptionDescription, { color: colors.textSecondary }]}>
                Let our assistant create a healthy meal plan based on your preferences
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {mealPlans.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Meal Plans</Text>
            {mealPlans.map((plan) => (
              <View key={plan.id} style={[styles.planCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.planHeader}>
                  <View>
                    <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                    <Text style={[styles.planDetails, { color: colors.textSecondary }]}>
                      {plan.period} • {plan.meals.length} meals
                      {plan.isActive && <Text style={[styles.activeBadge, { color: colors.primary }]}> • Active</Text>}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deletePlanButton}
                    onPress={() => {
                      Alert.alert(
                        'Delete Plan',
                        'Are you sure you want to delete this meal plan?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteMealPlan(plan.id) }
                        ]
                      );
                    }}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Create Plan Modal */}
      <Modal
        visible={showCreatePlan}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Custom Plan</Text>
            <TouchableOpacity onPress={() => setShowCreatePlan(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Plan Name</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={newPlanName}
                onChangeText={setNewPlanName}
                placeholder="e.g., My Weekly Meal Plan"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Period: {selectedPeriod}</Text>
            </View>

            <View style={styles.mealsSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Meals</Text>
                <TouchableOpacity style={[styles.addMealButton, { backgroundColor: isDark ? '#16A34A30' : '#DCFCE7' }]} onPress={addMealToPlan}>
                  <Plus size={16} color="#22C55E" />
                  <Text style={[styles.addMealButtonText, { color: colors.primary }]}>Add Meal</Text>
                </TouchableOpacity>
              </View>

              {newPlanMeals.map((meal, index) => (
                <View key={index} style={[styles.mealInputCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.mealInputHeader}>
                    <Text style={[styles.mealInputTitle, { color: colors.text }]}>Meal {index + 1}</Text>
                    <TouchableOpacity onPress={() => removePlanMeal(index)}>
                      <X size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={meal.name}
                    onChangeText={(text) => updatePlanMeal(index, 'name', text)}
                    placeholder="Meal name"
                    placeholderTextColor={colors.textSecondary}
                  />
                  
                  <View style={styles.mealInputRow}>
                    <View style={styles.mealInputHalf}>
                      <Text style={[styles.inputLabel, { color: colors.text }]}>Time</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                        value={meal.time}
                        onChangeText={(text) => updatePlanMeal(index, 'time', text)}
                        placeholder="HH:MM"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>
                    <View style={styles.mealInputHalf}>
                      <Text style={[styles.inputLabel, { color: colors.text }]}>Calories</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                        value={meal.calories.toString()}
                        onChangeText={(text) => updatePlanMeal(index, 'calories', parseInt(text) || 0)}
                        placeholder="300"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.createButton} onPress={createCustomPlan}>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Plan</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Reminders Modal */}
      <Modal
        visible={showReminders}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Meal Reminders</Text>
            <TouchableOpacity onPress={() => setShowReminders(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Reminder Date</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={reminderDate}
                onChangeText={setReminderDate}
                placeholder="YYYY-MM-DD (e.g., 2024-12-25)"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Reminder Time</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="08:00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Reminder Note</Text>
              <TextInput
                style={[styles.textInput, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={reminderNote}
                onChangeText={setReminderNote}
                placeholder="Time for your healthy meal!"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.createButton} onPress={setupReminders}>
              <Bell size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Set Reminders</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
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
    marginBottom: 24,
    lineHeight: 24,
  },
  createPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createPlanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  mealPlanTable: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    paddingBottom: 12,
  },
  tableCell: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateColumn: {
    width: 80,
  },
  mealColumn: {
    width: 100,
  },
  tableCellText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  tableCellSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  mealCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkedMeal: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  tableMealCalories: {
    fontSize: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  reminderButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mealItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
  },
  mealTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 80,
  },
  mealTimeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mealDetails: {
    flex: 1,
    marginLeft: 16,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
  },
  completedMeal: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  mealCalories: {
    fontSize: 14,
    marginTop: 2,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedButton: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  planOptions: {
    gap: 16,
    marginBottom: 32,
  },
  planOption: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  planOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  planOptionContent: {
    flex: 1,
  },
  planOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  planOptionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  planCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
  },
  planDetails: {
    fontSize: 14,
    marginTop: 4,
  },
  activeBadge: {
    fontWeight: '600',
  },
  deletePlanButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  mealsSection: {
    marginBottom: 24,
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addMealButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mealInputCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  mealInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealInputTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  mealInputHalf: {
    flex: 1,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 20,
  },
});