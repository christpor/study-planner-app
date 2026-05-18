import { Goal, Task } from '@/shared/types';

/**
 * User Profile for Personalization
 */
export interface UserProfile {
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredLayout: 'compact' | 'balanced' | 'detailed';
  interactionStyle: 'voice' | 'touch' | 'hybrid';
  accessibilityMode: 'standard' | 'haptic-only' | 'voice-only';
  darkModePreference: 'light' | 'dark' | 'auto';
  lastActiveTime?: number;
  totalGoalsCreated: number;
  totalTasksCompleted: number;
}

/**
 * Personalization Engine
 * 
 * Generates adaptive UI layouts based on user behavior and preferences.
 * Implements generative UI principles for 2026 design.
 */
export class PersonalizationEngine {
  /**
   * Determine user skill level based on activity
   */
  static determineSkillLevel(
    totalGoalsCreated: number,
    totalTasksCompleted: number,
    averageTasksPerGoal: number
  ): 'beginner' | 'intermediate' | 'advanced' {
    if (totalGoalsCreated < 3) return 'beginner';
    if (totalGoalsCreated < 10 || averageTasksPerGoal < 3) return 'intermediate';
    return 'advanced';
  }

  /**
   * Recommend layout based on skill level and screen size
   */
  static recommendLayout(
    skillLevel: 'beginner' | 'intermediate' | 'advanced',
    screenWidth: number
  ): 'compact' | 'balanced' | 'detailed' {
    if (skillLevel === 'beginner') return 'compact';
    if (skillLevel === 'intermediate') return 'balanced';
    return 'detailed';
  }

  /**
   * Predict optimal time for user to work on goals
   * Based on historical activity patterns
   */
  static predictOptimalTime(activityLogs: Array<{ timestamp: number }>): string {
    if (activityLogs.length === 0) return '09:00'; // Default morning

    // Group activities by hour
    const hourCounts: Record<number, number> = {};
    activityLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Find most active hour
    const mostActiveHour = Object.entries(hourCounts).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0];

    return `${String(mostActiveHour).padStart(2, '0')}:00`;
  }

  /**
   * Suggest next goal based on completion patterns
   */
  static suggestNextGoal(
    completedGoals: Goal[],
    userProfile: UserProfile
  ): Partial<Goal> | null {
    if (completedGoals.length === 0) return null;

    // Analyze patterns in completed goals
    const avgDuration = completedGoals.reduce((sum, goal) => {
      if (goal.completedAt && goal.createdAt) {
        return sum + (goal.completedAt - goal.createdAt);
      }
      return sum;
    }, 0) / completedGoals.length;

    // Suggest similar goal
    const lastGoal = completedGoals[completedGoals.length - 1];
    const suggestedTargetDate = new Date(Date.now() + avgDuration);

    return {
      title: `Continue learning: ${lastGoal.title}`,
      description: `Build on your progress from "${lastGoal.title}"`,
      targetDate: suggestedTargetDate.getTime(),
      priority: lastGoal.priority,
    };
  }

  /**
   * Determine if user should see simplified or advanced features
   */
  static shouldShowAdvancedFeatures(userProfile: UserProfile): boolean {
    return (
      userProfile.skillLevel === 'advanced' &&
      userProfile.totalGoalsCreated >= 5
    );
  }

  /**
   * Recommend task ordering based on user preferences
   */
  static orderTasks(
    tasks: Task[],
    userProfile: UserProfile
  ): Task[] {
    const sorted = [...tasks];

    if (userProfile.skillLevel === 'beginner') {
      // Show easy tasks first for beginners
      return sorted.sort((a, b) => {
        const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      });
    }

    if (userProfile.skillLevel === 'advanced') {
      // Show hard tasks first for advanced users
      return sorted.sort((a, b) => {
        const difficultyOrder = { hard: 0, medium: 1, easy: 2 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      });
    }

    // Intermediate: sort by due date
    return sorted.sort((a, b) => a.dueDate - b.dueDate);
  }

  /**
   * Generate personalized dashboard layout
   */
  static generateDashboardLayout(userProfile: UserProfile) {
    const layout = {
      showStreakWidget: true,
      showPredictedOptimalTime: userProfile.skillLevel !== 'beginner',
      showAdvancedMetrics: this.shouldShowAdvancedFeatures(userProfile),
      showGoalTemplates: userProfile.totalGoalsCreated < 3,
      compactMode: userProfile.preferredLayout === 'compact',
      detailedMode: userProfile.preferredLayout === 'detailed',
    };

    return layout;
  }

  /**
   * Determine if haptic feedback should be enabled
   */
  static shouldEnableHaptics(userProfile: UserProfile): boolean {
    return userProfile.accessibilityMode !== 'voice-only';
  }

  /**
   * Determine if voice input should be primary
   */
  static shouldPrioritizeVoice(userProfile: UserProfile): boolean {
    return (
      userProfile.interactionStyle === 'voice' ||
      userProfile.accessibilityMode === 'voice-only'
    );
  }
}
