import { ScrollView, Text, View, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useStudyPlanner } from '@/lib/study-planner-context';
import { useColors } from '@/hooks/use-colors';
import { AdaptiveCard } from '@/components/ui/adaptive-card';
import { HapticButton } from '@/components/ui/haptic-button';
import { VoiceInput } from '@/components/ui/voice-input';
import { PersonalizationEngine, UserProfile } from '@/lib/personalization-engine';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#22C55E';
    default:
      return '#687076';
  }
};

export default function HomeScreenV2() {
  const router = useRouter();
  const { goals, isLoading, refreshData } = useStudyPlanner();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  // Create user profile for personalization
  const userProfile = useMemo<UserProfile>(() => {
    const totalTasks = goals.reduce((sum, g) => sum + g.tasks.length, 0);
    const completedTasks = goals.reduce((sum, g) => sum + g.completedTasksCount, 0);
    const avgTasksPerGoal = goals.length > 0 ? totalTasks / goals.length : 0;

    return {
      skillLevel: PersonalizationEngine.determineSkillLevel(
        goals.length,
        completedTasks,
        avgTasksPerGoal
      ),
      preferredLayout: 'balanced',
      interactionStyle: 'hybrid',
      accessibilityMode: 'standard',
      darkModePreference: 'auto',
      totalGoalsCreated: goals.length,
      totalTasksCompleted: completedTasks,
    };
  }, [goals]);

  const dashboardLayout = useMemo(
    () => PersonalizationEngine.generateDashboardLayout(userProfile),
    [userProfile]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCreateGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/create-goal');
  };

  const handleVoiceGoalCreated = (text: string) => {
    // In production, parse the voice text and create goal
    // For now, navigate to create goal screen with suggestion
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowVoiceInput(false);
    router.push('/create-goal');
  };

  const handleGoalPress = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/goal-detail/${goalId}`);
  };

  const renderGoalCard = ({ item: goal }: { item: typeof goals[0] }) => (
    <TouchableOpacity
      onPress={() => handleGoalPress(goal.id)}
      activeOpacity={0.7}
    >
      <AdaptiveCard
        glass
        padding="md"
        rounded="lg"
        className="mb-3"
        style={{
          borderLeftWidth: 3,
          borderLeftColor: getPriorityColor(goal.priority),
        }}
      >
        <View style={{ gap: 8 }}>
          {/* Goal Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.foreground,
                  marginBottom: 4,
                }}
                numberOfLines={2}
              >
                {goal.title}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {goal.completedTasksCount}/{goal.totalTasksCount} tasks
              </Text>
            </View>
            <View
              style={{
                backgroundColor: getPriorityColor(goal.priority) + '20',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: getPriorityColor(goal.priority),
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              >
                {goal.priority}
              </Text>
            </View>
          </View>

          {/* Progress Bar with Animation */}
          <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                width: `${goal.progressPercentage}%`,
                backgroundColor: colors.primary,
                borderRadius: 3,
              }}
            />
          </View>

          {/* Progress Text */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              {goal.progressPercentage}% complete
            </Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>
              Due {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>
      </AdaptiveCard>
    </TouchableOpacity>
  );

  const emptyComponent = (
    <AdaptiveCard glass padding="lg" rounded="lg" className="my-8">
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Text style={{ fontSize: 32 }}>📚</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
          No Goals Yet
        </Text>
        <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 18 }}>
          Create your first learning goal to get started with your study journey
        </Text>
      </View>
    </AdaptiveCard>
  );

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {/* Header Section */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
            Study Planner
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted }}>
            {goals.length} goal{goals.length !== 1 ? 's' : ''} • {goals.reduce((sum, g) => sum + g.completedTasksCount, 0)} tasks completed
          </Text>
        </View>

        {/* Voice Input Section (if enabled) */}
        {showVoiceInput && (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <VoiceInput
              placeholder="Say your learning goal"
              onSpeechRecognized={handleVoiceGoalCreated}
            />
          </View>
        )}

        {/* Quick Action Buttons */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16, gap: 8 }}>
          <HapticButton
            label="+ Create Goal"
            variant="primary"
            size="md"
            onPress={handleCreateGoal}
            hapticType="light"
          />
          {PersonalizationEngine.shouldPrioritizeVoice(userProfile) && (
            <HapticButton
              label="🎤 Voice Goal"
              variant="secondary"
              size="md"
              onPress={() => setShowVoiceInput(!showVoiceInput)}
              hapticType="light"
            />
          )}
        </View>

        {/* Goals List */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          <FlatList
            data={goals}
            renderItem={renderGoalCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={emptyComponent}
            contentContainerStyle={{ gap: 0 }}
          />
        </View>
      </ScrollView>

      {/* Floating Action Button (Alternative to button above) */}
      {!showVoiceInput && (
        <TouchableOpacity
          onPress={handleCreateGoal}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 16,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 28, color: '#fff', fontWeight: '300' }}>+</Text>
        </TouchableOpacity>
      )}
    </ScreenContainer>
  );
}
