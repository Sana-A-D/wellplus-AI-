import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMealData } from '@/hooks/useMealData';
import { useTheme } from '@/hooks/useTheme';
import { Sparkles, User, Mail, ArrowRight } from 'lucide-react-native';

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { signIn } = useMealData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    if (!name.trim()) {
      return Alert.alert('Required', 'Please enter your name.');
    }
    if (!email.trim() || !email.includes('@')) {
      return Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }

    setIsLoading(true);
    try {
      await signIn(name.trim(), email.trim());
    } catch (e) {
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerArea}>
            <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
              <Sparkles size={40} color="#22C55E" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Welcome to WellPlus</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your AI-powered wellness journey starts here. Let's get to know you!
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Your Name</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Sarah Johnson"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="sarah.johnson@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#22C55E' }, isLoading && { opacity: 0.7 }]}
              onPress={handleGetStarted}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Get Started</Text>
              <ArrowRight size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.privacyNotice, { color: colors.textSecondary }]}>
            By continuing, you agree that your data is stored securely and privately on your device.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  formCard: {
    width: '100%',
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  btn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 8,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  privacyNotice: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 30,
  },
});
