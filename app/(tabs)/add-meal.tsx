import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, X, Sparkles, Save, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMealData } from '@/hooks/useMealData';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import HamburgerButton from '@/components/HamburgerButton';

export default function AddMealScreen() {
  const { colors } = useTheme();
  const { analyzeImage, analyzeMealLog, isLoading: aiLoading } = useGeminiAI();
  const { addMeal, meals, userSettings, updateUserSettings } = useMealData();

  // State hooks – must be declared before any early returns
  const [mealName, setMealName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiCalories, setAiCalories] = useState<number | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [photoExpanded, setPhotoExpanded] = useState(true);

  // Premium‑only limit – early return before rendering the main UI
  if (!userSettings?.isSubscribed && meals.length >= 3) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <Sparkles size={64} color={colors.accent} style={{ marginBottom: 24 }} />
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 12 }}>Premium Feature</Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 32, paddingHorizontal: 40, lineHeight: 24 }}>
          You've reached your free limit of 3 meals! Subscribe to WellPlus Premium to track unlimited meals, access advanced AI analysis, and reach your goals faster.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, width: '80%', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
          onPress={() => updateUserSettings({ isSubscribed: true })}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Subscribe for $5 / mo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 24, padding: 12 }} onPress={() => router.back()}>
          <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: '600' }}>Maybe Later</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Image selection helpers
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].base64
        ? `data:image/jpeg;base64,${result.assets[0].base64}`
        : result.assets[0].uri;
      setSelectedImage(uri);
      analyzeImageWithAI(uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].base64
        ? `data:image/jpeg;base64,${result.assets[0].base64}`
        : result.assets[0].uri;
      setSelectedImage(uri);
      analyzeImageWithAI(uri);
    }
  };

  const analyzeImageWithAI = async (uri: string) => {
    try {
      const result = await analyzeImage(uri, mealName);
      if (!result.isFood) {
        Alert.alert('Not Food', result.analysis);
        setSelectedImage(null);
        return;
      }
      setAiCalories(result.calories);
      setAiAnalysis(result.analysis);
    } catch (e) {
      console.error('AI analysis error:', e);
    }
  };

  const handleSave = async () => {
    if (!mealName.trim()) return Alert.alert('Required', 'Please enter a meal name.');
    setIsSaving(true);
    try {
      const analysis = await analyzeMealLog(mealName.trim(), notes.trim());
      await addMeal({
        name: mealName.trim(),
        notes: notes.trim() || undefined,
        rating: analysis.rating,
        image: selectedImage || undefined,
        calories: aiCalories ?? analysis.estimatedCalories,
        isHealthy: analysis.isHealthy,
      });
      setMealName('');
      setNotes('');
      setSelectedImage(null);
      setAiCalories(null);
      setAiAnalysis('');
      router.push('/(tabs)');
      setTimeout(() => Alert.alert('✅ Saved', 'Meal added successfully!'), 400);
    } catch {
      Alert.alert('Error', 'Failed to save meal.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <HamburgerButton style={{ marginBottom: 4 }} />
        <Text style={[styles.title, { color: colors.text }]}>Add Meal</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Snap a photo or type it in</Text>
      </View>
      {/* Debug Premium Button */}
      {!userSettings?.isSubscribed && (
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#FFD700' }]} onPress={() => updateUserSettings({ isSubscribed: true })}>
          <Text style={styles.saveTxt}>Activate Premium</Text>
        </TouchableOpacity>
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Photo section */}
          <TouchableOpacity style={[styles.accordionRow, { borderBottomColor: colors.border }]} onPress={() => setPhotoExpanded(v => !v)} activeOpacity={0.7}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>📸  Meal Photo</Text>
            {photoExpanded ? <ChevronUp size={20} color={colors.textSecondary} /> : <ChevronDown size={20} color={colors.textSecondary} />}
          </TouchableOpacity>
          {photoExpanded && (
            <View style={styles.photoArea}>
              {selectedImage ? (
                <View style={styles.imgWrap}>
                  <Image source={{ uri: selectedImage }} style={styles.preview} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => { setSelectedImage(null); setAiCalories(null); setAiAnalysis(''); }}>
                    <X size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoBtns}>
                  <TouchableOpacity style={[styles.photoBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={takePhoto}>
                    <Camera size={22} color={colors.primary} />
                    <Text style={[styles.photoBtnTxt, { color: colors.text }]}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.photoBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={pickImage}>
                    <ImageIcon size={22} color={colors.primary} />
                    <Text style={[styles.photoBtnTxt, { color: colors.text }]}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* AI result chip */}
              {(aiLoading || aiCalories != null) && (
                <View style={[styles.aiChip, { backgroundColor: '#F0EAFF' }]}> 
                  <Sparkles size={16} color={colors.accent} />
                  {aiLoading ? (
                    <ActivityIndicator size="small" color={colors.accent} style={{ marginLeft: 8 }} />
                  ) : (
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.aiCalText, { color: colors.accent }]}>{`~${aiCalories} cal`}</Text>
                      {aiAnalysis ? (
                        <Text style={[styles.aiDescText, { color: colors.textSecondary }]} numberOfLines={3}>{aiAnalysis}</Text>
                      ) : null}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
          {/* Meal name */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Meal Name *</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} value={mealName} onChangeText={setMealName} placeholder="e.g. Avocado Toast" placeholderTextColor={colors.textSecondary} />
          {/* Notes */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Note</Text>
          <TextInput style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} value={notes} onChangeText={setNotes} placeholder="Add a quick note..." placeholderTextColor={colors.textSecondary} multiline numberOfLines={3} />
          <View style={{ height: 90 }} />
        </ScrollView>
        {/* Sticky Save button */}
        <View style={[styles.stickyBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}> 
          <TouchableOpacity style={[styles.saveBtn, isSaving && { opacity: 0.6 }]} onPress={handleSave} disabled={isSaving} activeOpacity={0.8}>
            {isSaving ? <ActivityIndicator size="small" color="#FFF" /> : <Save size={20} color="#FFF" />}
            <Text style={styles.saveTxt}>{isSaving ? 'Saving…' : 'Save Meal'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  accordionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  sectionLabel: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  photoArea: { marginTop: 10 },
  photoBtns: { flexDirection: 'row', gap: 12 },
  photoBtn: { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, borderRadius: 14, borderWidth: 1, gap: 6 },
  photoBtnTxt: { fontSize: 13, fontWeight: '600' },
  imgWrap: { position: 'relative', borderRadius: 14, overflow: 'hidden' },
  preview: { width: '100%', height: 180, borderRadius: 14 },
  removeBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: '#EF4444', borderRadius: 14, padding: 5 },
  aiChip: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 12, borderRadius: 12 },
  aiCalText: { fontSize: 15, fontWeight: '700' },
  aiDescText: { fontSize: 12, marginTop: 2 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginTop: 18, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15 },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  stickyBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#22C55E', paddingVertical: 14, borderRadius: 14, gap: 8 },
  saveTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});