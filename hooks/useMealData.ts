import React, { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Meal {
  id: string;
  name: string;
  time: string;
  date: string;
  rating: 'great' | 'good' | 'bad' | 'awful';
  calories: number | null;
  notes?: string;
  allergies?: string;
  image?: string;
  isHealthy: boolean;
  createdAt: number;
}

export interface MealPlan {
  id: string;
  name: string;
  meals: PlannedMeal[];
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: number;
}

export interface PlannedMeal {
  id: string;
  name: string;
  time: string;
  calories: number;
  isCompleted: boolean;
  completedAt?: number;
}

export interface WaterEntry {
  id: string;
  amount: number;
  timestamp: number;
}

export interface UserSettings {
  dailyWaterGoal: number;
  dailyCalorieGoal: number;
  notifications: {
    mealReminders: boolean;
    waterReminders: boolean;
    goalAchievements: boolean;
  };
  profile: {
    name: string;
    email: string;
    profileImage?: string;
  };
  geminiApiKey?: string;
  isSubscribed: boolean;
}

const MEALS_STORAGE_KEY = '@wellplus_meals';
const MEAL_PLANS_STORAGE_KEY = '@wellplus_meal_plans';
const WATER_ENTRIES_STORAGE_KEY = '@wellplus_water_entries';
const USER_SETTINGS_STORAGE_KEY = '@wellplus_user_settings';

const DEFAULT_SETTINGS: UserSettings = {
  dailyWaterGoal: 8,
  dailyCalorieGoal: 2000,
  notifications: {
    mealReminders: true,
    waterReminders: true,
    goalAchievements: true,
  },
  profile: {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
  },
  geminiApiKey: '',
  isSubscribed: false,
};

function useMealDataValue() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadMeals(),
        loadMealPlans(),
        loadWaterEntries(),
        loadUserSettings(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMeals = async () => {
    try {
      const storedMeals = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
      if (storedMeals) {
        const parsedMeals = JSON.parse(storedMeals);
        setMeals(parsedMeals.sort((a: Meal, b: Meal) => b.createdAt - a.createdAt));
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const loadMealPlans = async () => {
    try {
      const storedPlans = await AsyncStorage.getItem(MEAL_PLANS_STORAGE_KEY);
      if (storedPlans) {
        setMealPlans(JSON.parse(storedPlans));
      }
    } catch (error) {
      console.error('Error loading meal plans:', error);
    }
  };

  const loadWaterEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem(WATER_ENTRIES_STORAGE_KEY);
      if (storedEntries) {
        setWaterEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Error loading water entries:', error);
    }
  };

  const loadUserSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(USER_SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setUserSettings(JSON.parse(storedSettings));
      }
      const loggedInVal = await AsyncStorage.getItem('@wellplus_logged_in');
      if (loggedInVal !== null) {
        setIsLoggedIn(loggedInVal === 'true');
      } else {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const saveMeals = async (newMeals: Meal[]) => {
    try {
      await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(newMeals));
    } catch (error) {
      console.error('Error saving meals:', error);
    }
  };

  const saveMealPlans = async (plans: MealPlan[]) => {
    try {
      await AsyncStorage.setItem(MEAL_PLANS_STORAGE_KEY, JSON.stringify(plans));
    } catch (error) {
      console.error('Error saving meal plans:', error);
    }
  };

  const saveWaterEntries = async (entries: WaterEntry[]) => {
    try {
      await AsyncStorage.setItem(WATER_ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving water entries:', error);
    }
  };

  const saveUserSettings = async (settings: UserSettings) => {
    try {
      await AsyncStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  };

  const addMeal = async (mealData: Omit<Meal, 'id' | 'createdAt' | 'time' | 'date'>) => {
    const now = new Date();
    const newMeal: Meal = {
      ...mealData,
      id: Date.now().toString(),
      createdAt: now.getTime(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString(),
    };

    const updatedMeals = [newMeal, ...meals];
    setMeals(updatedMeals);
    await saveMeals(updatedMeals);
    return newMeal;
  };

  const deleteMeal = async (mealId: string) => {
    const updatedMeals = meals.filter(meal => meal.id !== mealId);
    setMeals(updatedMeals);
    await saveMeals(updatedMeals);
  };

  const addMealPlan = async (planData: Omit<MealPlan, 'id' | 'createdAt'>) => {
    const newPlan: MealPlan = {
      ...planData,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };

    const updatedPlans = [...mealPlans, newPlan];
    setMealPlans(updatedPlans);
    await saveMealPlans(updatedPlans);
    return newPlan;
  };

  const deleteMealPlan = async (planId: string) => {
    const updatedPlans = mealPlans.filter(plan => plan.id !== planId);
    setMealPlans(updatedPlans);
    await saveMealPlans(updatedPlans);
  };

  const updateMealPlan = async (planId: string, updates: Partial<MealPlan>) => {
    const updatedPlans = mealPlans.map(plan => 
      plan.id === planId ? { ...plan, ...updates } : plan
    );
    setMealPlans(updatedPlans);
    await saveMealPlans(updatedPlans);
  };

  const addWaterEntry = async (amount: number) => {
    const newEntry: WaterEntry = {
      id: Date.now().toString(),
      amount,
      timestamp: Date.now(),
    };

    const updatedEntries = [...waterEntries, newEntry];
    setWaterEntries(updatedEntries);
    await saveWaterEntries(updatedEntries);
    return newEntry;
  };

  const removeWaterEntry = async () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    // Find the last water entry from today
    const todaysEntries = waterEntries.filter(entry => entry.timestamp >= todayStart);
    if (todaysEntries.length === 0) return false;
    
    const lastEntry = todaysEntries[todaysEntries.length - 1];
    const updatedEntries = waterEntries.filter(entry => entry.id !== lastEntry.id);
    
    setWaterEntries(updatedEntries);
    await saveWaterEntries(updatedEntries);
    return true;
  };

  const updateUserSettings = async (updates: Partial<UserSettings>) => {
    const updatedSettings = { ...userSettings, ...updates };
    setUserSettings(updatedSettings);
    await saveUserSettings(updatedSettings);
  };

  const signIn = async (name: string, email: string) => {
    try {
      const updatedSettings = {
        ...userSettings,
        profile: { name, email, profileImage: undefined }
      };
      setUserSettings(updatedSettings);
      await saveUserSettings(updatedSettings);
      
      setIsLoggedIn(true);
      await AsyncStorage.setItem('@wellplus_logged_in', 'true');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    try {
      setMeals([]);
      setMealPlans([]);
      setWaterEntries([]);
      setUserSettings(DEFAULT_SETTINGS);
      setIsLoggedIn(false);

      await Promise.all([
        AsyncStorage.removeItem(MEALS_STORAGE_KEY),
        AsyncStorage.removeItem(MEAL_PLANS_STORAGE_KEY),
        AsyncStorage.removeItem(WATER_ENTRIES_STORAGE_KEY),
        AsyncStorage.removeItem(USER_SETTINGS_STORAGE_KEY),
        AsyncStorage.setItem('@wellplus_logged_in', 'false'),
      ]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getMealsByPeriod = (period: 'day' | 'week' | 'month' | 'all') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return meals.filter(meal => {
      const mealDate = new Date(meal.createdAt);
      
      switch (period) {
        case 'day':
          return mealDate >= today;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return mealDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return mealDate >= monthAgo;
        case 'all':
        default:
          return true;
      }
    });
  };

  const getTodaysWaterEntries = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    return waterEntries.filter(entry => 
      entry.timestamp >= todayStart && entry.timestamp < todayEnd
    );
  };

  const getTodaysCalories = () => {
    const todaysMeals = getMealsByPeriod('day');
    return todaysMeals.reduce((total, meal) => total + (meal.calories || 0), 0);
  };

  const getStats = () => {
    const totalMeals = meals.length;
    const healthyMeals = meals.filter(meal => meal.isHealthy).length;
    const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    
    // Calculate streak (consecutive days with at least one meal)
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    while (streak < 30) {
      const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const hasMealOnDay = meals.some(meal => {
        const mealDate = new Date(meal.createdAt);
        return mealDate >= dayStart && mealDate < dayEnd;
      });
      
      if (hasMealOnDay) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalMeals,
      healthyMeals,
      totalCalories,
      streak,
    };
  };

  return {
    meals,
    mealPlans,
    waterEntries,
    userSettings,
    isLoggedIn,
    loading,
    addMeal,
    deleteMeal,
    addMealPlan,
    deleteMealPlan,
    updateMealPlan,
    addWaterEntry,
    removeWaterEntry,
    updateUserSettings,
    getMealsByPeriod,
    getTodaysWaterEntries,
    getTodaysCalories,
    getStats,
    signIn,
    signOut,
  };
}

const MealDataContext = createContext<ReturnType<typeof useMealDataValue> | undefined>(undefined);

export function MealDataProvider({ children }: { children: React.ReactNode }) {
  const value = useMealDataValue();
  return React.createElement(MealDataContext.Provider, { value }, children);
}

export function useMealData() {
  const context = useContext(MealDataContext);
  if (context === undefined) {
    throw new Error('useMealData must be used within a MealDataProvider');
  }
  return context;
}