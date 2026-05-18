import { describe, it, expect } from 'vitest';
import { PersonalizationEngine, type UserProfile } from '../lib/personalization-engine';
import type { Goal } from '../shared/types';

describe('PersonalizationEngine', () => {
  describe('Skill Level Determination', () => {
    it('should classify beginner users correctly', () => {
      const skillLevel = PersonalizationEngine.determineSkillLevel(2, 5, 2);
      expect(skillLevel).toBe('beginner');
    });

    it('should classify intermediate users correctly', () => {
      const skillLevel = PersonalizationEngine.determineSkillLevel(5, 15, 3);
      expect(skillLevel).toBe('intermediate');
    });

    it('should classify advanced users correctly', () => {
      const skillLevel = PersonalizationEngine.determineSkillLevel(15, 100, 6);
      expect(skillLevel).toBe('advanced');
    });
  });

  describe('Layout Recommendation', () => {
    it('should recommend compact layout for beginners', () => {
      const layout = PersonalizationEngine.recommendLayout('beginner', 375);
      expect(layout).toBe('compact');
    });

    it('should recommend balanced layout for intermediate users', () => {
      const layout = PersonalizationEngine.recommendLayout('intermediate', 375);
      expect(layout).toBe('balanced');
    });

    it('should recommend detailed layout for advanced users', () => {
      const layout = PersonalizationEngine.recommendLayout('advanced', 375);
      expect(layout).toBe('detailed');
    });
  });

  describe('Optimal Time Prediction', () => {
    it('should predict optimal time based on activity logs', () => {
      const logs = [
        { timestamp: new Date('2026-05-15 09:00').getTime() },
        { timestamp: new Date('2026-05-15 09:30').getTime() },
        { timestamp: new Date('2026-05-16 14:00').getTime() },
      ];

      const optimalTime = PersonalizationEngine.predictOptimalTime(logs);
      expect(optimalTime).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should return default time for empty logs', () => {
      const optimalTime = PersonalizationEngine.predictOptimalTime([]);
      expect(optimalTime).toBe('09:00');
    });
  });

  describe('Goal Suggestions', () => {
    it('should suggest next goal based on completion patterns', () => {
      const completedGoals: Goal[] = [
        {
          id: 'goal_1',
          title: 'Learn React',
          description: '',
          targetDate: Date.now(),
          priority: 'high',
          createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
          completedAt: Date.now(),
          tasks: [],
        },
      ];

      const userProfile: UserProfile = {
        skillLevel: 'intermediate',
        preferredLayout: 'balanced',
        interactionStyle: 'hybrid',
        accessibilityMode: 'standard',
        darkModePreference: 'auto',
        totalGoalsCreated: 1,
        totalTasksCompleted: 5,
      };

      const suggestion = PersonalizationEngine.suggestNextGoal(completedGoals, userProfile);
      expect(suggestion).not.toBeNull();
      expect(suggestion?.title).toContain('Continue learning');
    });

    it('should return null when no goals completed', () => {
      const userProfile: UserProfile = {
        skillLevel: 'beginner',
        preferredLayout: 'compact',
        interactionStyle: 'touch',
        accessibilityMode: 'standard',
        darkModePreference: 'auto',
        totalGoalsCreated: 0,
        totalTasksCompleted: 0,
      };

      const suggestion = PersonalizationEngine.suggestNextGoal([], userProfile);
      expect(suggestion).toBeNull();
    });
  });

  describe('Advanced Features Visibility', () => {
    it('should show advanced features for advanced users with history', () => {
      const userProfile: UserProfile = {
        skillLevel: 'advanced',
        preferredLayout: 'detailed',
        interactionStyle: 'hybrid',
        accessibilityMode: 'standard',
        darkModePreference: 'auto',
        totalGoalsCreated: 10,
        totalTasksCompleted: 50,
      };

      const shouldShow = PersonalizationEngine.shouldShowAdvancedFeatures(userProfile);
      expect(shouldShow).toBe(true);
    });

    it('should not show advanced features for beginners', () => {
      const userProfile: UserProfile = {
        skillLevel: 'beginner',
        preferredLayout: 'compact',
        interactionStyle: 'touch',
        accessibilityMode: 'standard',
        darkModePreference: 'auto',
        totalGoalsCreated: 1,
        totalTasksCompleted: 2,
      };

      const shouldShow = PersonalizationEngine.shouldShowAdvancedFeatures(userProfile);
      expect(shouldShow).toBe(false);
    });
  });

  describe('Task Ordering', () => {
    it('should order tasks by difficulty for beginners (easy first)', () => {
      const tasks = [
        { id: '1', difficulty: 'hard', dueDate: Date.now() } as any,
        { id: '2', difficulty: 'easy', dueDate: Date.now() } as any,
        { id: '3', difficulty: 'medium', dueDate: Date.now() } as any,
      ];

      const userProfile: UserProfile = {
        skillLevel: 'beginner',
        preferredLayout: 'compact',
        interactionStyle: 'touch',
        accessibilityMode: 'standard',
        darkModePreference: 'auto',
        totalGoalsCreated: 1,
        totalTasksCompleted: 2,
      };

      const ordered = PersonalizationEngine.orderTasks(tasks, userProfile);
      expect(ordered[0].difficulty).toBe('easy');
      expect(ordered[1].difficulty).toBe('medium');
      expect(ordered[2].difficulty).toBe('hard');
    });

    it('should order tasks by difficulty for advanced users (hard first)', () => {
      const tasks = [
        { id: '1', difficulty: 'easy', dueDate: Date.now() } as any,
        { id: '2', difficulty: 'hard', dueDate: Date.now() } as any,
        { id: '3', difficulty: 'medium', dueDate: Date.now() } as any,
      ];

      const userProfile: UserProfile = {
        skillLevel: 'advanced',
        preferredLayout: 'detailed',
        interactionStyle: 'hybrid',
        accessibilityMode: 'standard',
        darkModePreference: 'auto',
        totalGoalsCreated: 10,
        totalTasksCompleted: 50,
      };

      const ordered = PersonalizationEngine.orderTasks(tasks, userProfile);
      expect(ordered[0].difficulty).toBe('hard');
      expect(ordered[1].difficulty).toBe('medium');
      expect(ordered[2].difficulty).toBe('easy');
    });
  });

  describe('Dashboard Layout Generation', () => {
    it('should generate appropriate layout for beginner', () => {
      const userProfile: UserProfile = {
        skillLevel: 'beginner',
        preferredLayout: 'compact',
        interactionStyle: 'touch',
        accessibilityMode: 'standard',
        darkModePreference: 'auto',
        totalGoalsCreated: 1,
        totalTasksCompleted: 2,
      };

      const layout = PersonalizationEngine.generateDashboardLayout(userProfile);
      expect(layout.compactMode).toBe(true);
      expect(layout.showGoalTemplates).toBe(true);
      expect(layout.showAdvancedMetrics).toBe(false);
    });

    it('should generate appropriate layout for advanced user', () => {
      const userProfile: UserProfile = {
        skillLevel: 'advanced',
        preferredLayout: 'detailed',
        interactionStyle: 'hybrid',
        accessibilityMode: 'standard',
        darkModePreference: 'auto',
        totalGoalsCreated: 10,
        totalTasksCompleted: 50,
      };

      const layout = PersonalizationEngine.generateDashboardLayout(userProfile);
      expect(layout.detailedMode).toBe(true);
      expect(layout.showAdvancedMetrics).toBe(true);
      expect(layout.showGoalTemplates).toBe(false);
    });
  });

  describe('Accessibility Features', () => {
    it('should enable haptics for standard mode', () => {
      const userProfile: UserProfile = {
        skillLevel: 'intermediate',
        preferredLayout: 'balanced',
        interactionStyle: 'hybrid',
        accessibilityMode: 'standard',
        darkModePreference: 'auto',
        totalGoalsCreated: 5,
        totalTasksCompleted: 15,
      };

      const shouldEnable = PersonalizationEngine.shouldEnableHaptics(userProfile);
      expect(shouldEnable).toBe(true);
    });

    it('should disable haptics for voice-only mode', () => {
      const userProfile: UserProfile = {
        skillLevel: 'intermediate',
        preferredLayout: 'balanced',
        interactionStyle: 'voice',
        accessibilityMode: 'voice-only',
        darkModePreference: 'auto',
        totalGoalsCreated: 5,
        totalTasksCompleted: 15,
      };

      const shouldEnable = PersonalizationEngine.shouldEnableHaptics(userProfile);
      expect(shouldEnable).toBe(false);
    });

    it('should prioritize voice for voice-first users', () => {
      const userProfile: UserProfile = {
        skillLevel: 'intermediate',
        preferredLayout: 'balanced',
        interactionStyle: 'voice',
        accessibilityMode: 'standard',
        darkModePreference: 'auto',
        totalGoalsCreated: 5,
        totalTasksCompleted: 15,
      };

      const shouldPrioritize = PersonalizationEngine.shouldPrioritizeVoice(userProfile);
      expect(shouldPrioritize).toBe(true);
    });
  });
});
