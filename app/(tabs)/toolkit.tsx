import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Brain, Dumbbell, Coffee, Moon, Sparkles, Play, Clock, Target, MessageCircle, X, CircleCheck as CheckCircle, Send } from 'lucide-react-native';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { useTheme } from '@/hooks/useTheme';
import HamburgerButton from '@/components/HamburgerButton';

interface WellnessTip {
  id: string;
  category: 'yoga' | 'remedy' | 'workout' | 'stress';
  title: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image: string;
  isAiGenerated: boolean;
  instructions: string[];
}

const wellnessTips: WellnessTip[] = [
  {
    id: '1',
    category: 'yoga',
    title: 'Morning Sun Salutation',
    description: 'Energize your body and mind with this gentle morning flow',
    duration: '10 min',
    difficulty: 'Easy',
    image: 'https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAiGenerated: true,
    instructions: [
      'Stand tall with feet hip-width apart',
      'Inhale, sweep arms overhead',
      'Exhale, fold forward from hips',
      'Inhale, lift halfway up',
      'Exhale, step back to plank',
      'Lower down with control',
      'Inhale, cobra pose',
      'Exhale, downward dog',
      'Hold for 5 breaths',
      'Step forward and rise up'
    ]
  },
  {
    id: '2',
    category: 'remedy',
    title: 'Ginger Tea for Digestion',
    description: 'Soothe your stomach and aid digestion naturally',
    duration: '5 min',
    difficulty: 'Easy',
    image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAiGenerated: true,
    instructions: [
      'Slice 1 inch of fresh ginger root',
      'Boil 2 cups of water',
      'Add ginger slices to boiling water',
      'Simmer for 10-15 minutes',
      'Strain the tea',
      'Add honey and lemon to taste',
      'Drink warm after meals',
      'Best consumed 30 minutes after eating'
    ]
  },
  {
    id: '3',
    category: 'workout',
    title: 'Quick Cardio Burst',
    description: 'Boost your metabolism with this high-energy workout',
    duration: '15 min',
    difficulty: 'Medium',
    image: 'https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAiGenerated: false,
    instructions: [
      'Warm up with light jogging (2 min)',
      'Jumping jacks - 30 seconds',
      'Rest 15 seconds',
      'High knees - 30 seconds',
      'Rest 15 seconds',
      'Burpees - 30 seconds',
      'Rest 15 seconds',
      'Mountain climbers - 30 seconds',
      'Repeat circuit 3 times',
      'Cool down with stretching (3 min)'
    ]
  },
  {
    id: '4',
    category: 'stress',
    title: 'Breathing Meditation',
    description: 'Calm your mind and reduce stress with mindful breathing',
    duration: '8 min',
    difficulty: 'Easy',
    image: 'https://images.pexels.com/photos/3758056/pexels-photo-3758056.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAiGenerated: true,
    instructions: [
      'Find a comfortable seated position',
      'Close your eyes gently',
      'Take a deep breath in for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly for 6 counts',
      'Focus only on your breathing',
      'If mind wanders, gently return focus',
      'Continue for 8 minutes',
      'End with 3 deep breaths'
    ]
  },
];

const categories = [
  { key: 'all', label: 'All', icon: Heart, color: '#EF4444' },
  { key: 'yoga', label: 'Yoga', icon: Brain, color: '#8B5CF6' },
  { key: 'remedy', label: 'Remedies', icon: Coffee, color: '#10B981' },
  { key: 'workout', label: 'Workouts', icon: Dumbbell, color: '#F59E0B' },
  { key: 'stress', label: 'Stress Relief', icon: Moon, color: '#3B82F6' },
];

export default function ToolkitScreen() {
  const { isDark } = useTheme();
  const { generateResponse, isLoading } = useGeminiAI();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTip, setSelectedTip] = useState<WellnessTip | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, isUser: boolean, suggestions?: string[]}>>([]);
  const [chatInput, setChatInput] = useState('');

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

  const filteredTips = selectedCategory === 'all' 
    ? wellnessTips 
    : wellnessTips.filter(tip => tip.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'yoga':
        return <Brain size={16} color="#8B5CF6" />;
      case 'remedy':
        return <Coffee size={16} color="#10B981" />;
      case 'workout':
        return <Dumbbell size={16} color="#F59E0B" />;
      case 'stress':
        return <Moon size={16} color="#3B82F6" />;
      default:
        return <Heart size={16} color="#EF4444" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#22C55E';
      case 'Medium':
        return '#F59E0B';
      case 'Hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const startActivity = (tip: WellnessTip) => {
    setSelectedTip(tip);
    setCompletedSteps(new Set());
    setShowInstructions(true);
  };

  const toggleStep = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);

    if (selectedTip && newCompleted.size === selectedTip.instructions.length) {
      setTimeout(() => {
        Alert.alert(
          '🎉 Congratulations!',
          `You've completed ${selectedTip.title}! Great job taking care of your wellness.`,
          [
            { text: 'Awesome!', onPress: () => setShowInstructions(false) }
          ]
        );
      }, 500);
    }
  };

  const openAIChat = () => {
    setShowChat(true);
    if (chatMessages.length === 0) {
      setChatMessages([{
        id: '1',
        text: "Hello! I'm your wellness coach. I can help you with personalized yoga routines, natural remedies, workout suggestions, stress relief techniques, and nutrition advice. What would you like help with today?",
        isUser: false,
        suggestions: [
          "I feel bloated after eating",
          "I'm feeling stressed",
          "I need an energy boost",
          "Help me sleep better"
        ]
      }]);
    }
  };

  const sendMessage = async (message?: string) => {
    const messageText = message || chatInput.trim();
    if (!messageText) return;

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    try {
      const response = await generateResponse(messageText);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        suggestions: response.suggestions
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const gradientColors: readonly [string, string] = isDark ? ['#F59E0B', '#000000'] : ['#FFEAA7', '#FFFFFF'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradientColors}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <HamburgerButton />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.title, { color: colors.text }]}>Wellness Toolkit</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Smart wellness recommendations</Text>
          </View>
          <TouchableOpacity style={[styles.chatButton, { backgroundColor: colors.surface }]} onPress={openAIChat}>
            <MessageCircle size={20} color="#F59E0B" />
          </TouchableOpacity>
        </View>

        <View style={[styles.aiInsight, { backgroundColor: isDark ? '#2D1B69' : '#F3E8FF' }]}>
          <Sparkles size={18} color="#8B5CF6" />
          <Text style={[styles.aiInsightText, { color: isDark ? '#C4B5FD' : '#7C3AED' }]}>
            Based on your recent meals, try some gentle yoga to aid digestion
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScrollView}
          >
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    selectedCategory === category.key && {
                      backgroundColor: isDark ? category.color + '30' : category.color + '20',
                      borderColor: category.color,
                    }
                  ]}
                  onPress={() => setSelectedCategory(category.key)}
                >
                  <IconComponent 
                    size={20} 
                    color={selectedCategory === category.key ? category.color : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.categoryText,
                    { color: colors.textSecondary },
                    selectedCategory === category.key && { color: category.color }
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory === 'all' ? 'All Recommendations' : `${categories.find(c => c.key === selectedCategory)?.label} Recommendations`}
          </Text>
          
          {filteredTips.map((tip) => (
            <View key={tip.id} style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Image source={{ uri: tip.image }} style={styles.tipImage} />
              
              <View style={styles.tipContent}>
                <View style={styles.tipHeader}>
                  <View style={styles.tipMeta}>
                    {getCategoryIcon(tip.category)}
                    {tip.isAiGenerated && (
                      <View style={[styles.aiTag, { backgroundColor: isDark ? '#2D1B69' : '#F3E8FF' }]}>
                        <Sparkles size={10} color="#8B5CF6" />
                        <Text style={[styles.aiTagText, { color: isDark ? '#C4B5FD' : '#8B5CF6' }]}>AI</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.playButton}
                    onPress={() => startActivity(tip)}
                  >
                    <Play size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.tipTitle, { color: colors.text }]}>{tip.title}</Text>
                <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>{tip.description}</Text>

                <View style={styles.tipFooter}>
                  <View style={styles.tipStats}>
                    <View style={styles.tipStat}>
                      <Clock size={14} color={colors.textSecondary} />
                      <Text style={[styles.tipStatText, { color: colors.textSecondary }]}>{tip.duration}</Text>
                    </View>
                    <View style={styles.tipStat}>
                      <Target size={14} color={getDifficultyColor(tip.difficulty)} />
                      <Text style={[styles.tipStatText, { color: getDifficultyColor(tip.difficulty) }]}>
                        {tip.difficulty}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.startButton}
                    onPress={() => startActivity(tip)}
                  >
                    <Text style={styles.startButtonText}>Start</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.chatSection}>
          <View style={[styles.chatCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Sparkles size={24} color="#8B5CF6" />
            <View style={styles.chatContent}>
              <Text style={[styles.chatTitle, { color: colors.text }]}>Need Personalized Help?</Text>
              <Text style={[styles.chatDescription, { color: colors.textSecondary }]}>
                Chat with our wellness coach for custom recommendations based on your meals and mood
              </Text>
              <TouchableOpacity style={styles.chatActionButton} onPress={openAIChat}>
                <MessageCircle size={16} color="#FFFFFF" />
                <Text style={styles.chatActionText}>Start Wellness Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Instructions Modal */}
      <Modal
        visible={showInstructions}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedTip?.title}</Text>
            <TouchableOpacity onPress={() => setShowInstructions(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={[styles.activityInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.activityDuration, { color: colors.text }]}>Duration: {selectedTip?.duration}</Text>
              <Text style={[styles.activityDifficulty, { color: colors.textSecondary }]}>
                Difficulty: <Text style={{ color: getDifficultyColor(selectedTip?.difficulty || 'Easy') }}>
                  {selectedTip?.difficulty}
                </Text>
              </Text>
            </View>

            <Text style={[styles.instructionsTitle, { color: colors.text }]}>Instructions</Text>
            {selectedTip?.instructions.map((instruction, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.instructionItem,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  completedSteps.has(index) && [styles.completedInstruction, { backgroundColor: isDark ? '#16A34A30' : '#F0FDF4', borderColor: '#22C55E' }]
                ]}
                onPress={() => toggleStep(index)}
              >
                <View style={[styles.instructionNumber, { backgroundColor: colors.background }]}>
                  {completedSteps.has(index) ? (
                    <CheckCircle size={20} color="#22C55E" />
                  ) : (
                    <Text style={[styles.instructionNumberText, { color: colors.textSecondary }]}>{index + 1}</Text>
                  )}
                </View>
                <Text style={[
                  styles.instructionText,
                  { color: colors.text },
                  completedSteps.has(index) && styles.completedInstructionText
                ]}>
                  {instruction}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.progressSection}>
              <Text style={[styles.progressText, { color: colors.text }]}>
                Progress: {completedSteps.size} / {selectedTip?.instructions.length || 0} steps completed
              </Text>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${((completedSteps.size / (selectedTip?.instructions.length || 1)) * 100)}%` 
                    }
                  ]} 
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* AI Chat Modal */}
      <Modal
        visible={showChat}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Wellness Coach</Text>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.chatContainer}>
            <ScrollView style={styles.chatMessages} showsVerticalScrollIndicator={false}>
              {chatMessages.map((message) => (
                <View key={message.id} style={styles.messageContainer}>
                  <View style={[
                    styles.chatMessage,
                    message.isUser ? [styles.userMessage, { backgroundColor: colors.primary }] : [styles.aiMessage, { backgroundColor: isDark ? '#2D1B69' : '#F3E8FF' }]
                  ]}>
                    <Text style={[
                      styles.chatMessageText,
                      { color: message.isUser ? '#FFFFFF' : (isDark ? '#C4B5FD' : '#7C3AED') }
                    ]}>
                      {message.text}
                    </Text>
                  </View>
                  
                  {!message.isUser && message.suggestions && (
                    <View style={styles.chatSuggestions}>
                      {message.suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[styles.suggestionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                          onPress={() => sendMessage(suggestion)}
                        >
                          <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              
              {isLoading && (
                <View style={[styles.chatMessage, styles.aiMessage, { backgroundColor: isDark ? '#2D1B69' : '#F3E8FF' }]}>
                  <ActivityIndicator size="small" color="#8B5CF6" />
                  <Text style={[styles.chatMessageText, { color: isDark ? '#C4B5FD' : '#7C3AED', marginLeft: 8 }]}>
                    Thinking...
                  </Text>
                </View>
              )}
            </ScrollView>
            
            <View style={[styles.chatInputContainer, { borderTopColor: colors.border }]}>
              <TextInput
                style={[styles.chatTextInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Ask me anything about wellness..."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: chatInput.trim() ? colors.primary : colors.border }]}
                onPress={() => sendMessage()}
                disabled={!chatInput.trim() || isLoading}
              >
                <Send size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  chatButton: {
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
  aiInsight: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiInsightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  categoriesScrollView: {
    flexDirection: 'row',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipsContainer: {
    marginBottom: 32,
  },
  tipCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  tipImage: {
    width: '100%',
    height: 160,
  },
  tipContent: {
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  tipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipStats: {
    flexDirection: 'row',
    gap: 16,
  },
  tipStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tipStatText: {
    fontSize: 12,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatSection: {
    marginBottom: 32,
  },
  chatCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    borderWidth: 1,
  },
  chatContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  chatDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  chatActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    alignSelf: 'flex-start',
  },
  chatActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  activityInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  activityDuration: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDifficulty: {
    fontSize: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    gap: 12,
  },
  completedInstruction: {},
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  completedInstructionText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  progressSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  chatContainer: {
    flex: 1,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  chatMessage: {
    borderRadius: 16,
    padding: 16,
    maxWidth: '80%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginLeft: '20%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    marginRight: '20%',
  },
  chatMessageText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  chatSuggestions: {
    marginTop: 12,
    gap: 8,
  },
  suggestionButton: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chatInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
    alignItems: 'flex-end',
  },
  chatTextInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});