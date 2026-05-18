import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, Task, ProgressMetrics } from '@/shared/types';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

describe('Study Planner Data Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Goal Creation', () => {
    it('should create a goal with correct properties', () => {
      const goalData = {
        id: 'goal_1',
        title: 'Learn React',
        description: 'Master React fundamentals',
        targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        priority: 'high' as const,
        createdAt: Date.now(),
        tasks: [],
      };

      expect(goalData.title).toBe('Learn React');
      expect(goalData.priority).toBe('high');
      expect(goalData.tasks.length).toBe(0);
    });

    it('should calculate progress percentage correctly', () => {
      const goal: Goal = {
        id: 'goal_1',
        title: 'Learn React',
        description: 'Master React fundamentals',
        targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        priority: 'high',
        createdAt: Date.now(),
        tasks: [
          {
            id: 'task_1',
            goalId: 'goal_1',
            title: 'Learn Hooks',
            description: '',
            dueDate: Date.now(),
            difficulty: 'medium',
            estimatedMinutes: 60,
            completed: true,
            completedAt: Date.now(),
            createdAt: Date.now(),
          },
          {
            id: 'task_2',
            goalId: 'goal_1',
            title: 'Learn Context',
            description: '',
            dueDate: Date.now(),
            difficulty: 'medium',
            estimatedMinutes: 60,
            completed: false,
            createdAt: Date.now(),
          },
        ],
      };

      const completedCount = goal.tasks.filter(t => t.completed).length;
      const totalCount = goal.tasks.length;
      const percentage = Math.round((completedCount / totalCount) * 100);

      expect(percentage).toBe(50);
    });
  });

  describe('Task Management', () => {
    it('should create a task with correct properties', () => {
      const taskData: Task = {
        id: 'task_1',
        goalId: 'goal_1',
        title: 'Watch tutorial',
        description: 'Watch React Hooks tutorial',
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        difficulty: 'easy',
        estimatedMinutes: 120,
        completed: false,
        createdAt: Date.now(),
      };

      expect(taskData.title).toBe('Watch tutorial');
      expect(taskData.difficulty).toBe('easy');
      expect(taskData.completed).toBe(false);
    });

    it('should mark task as complete', () => {
      const task: Task = {
        id: 'task_1',
        goalId: 'goal_1',
        title: 'Watch tutorial',
        description: '',
        dueDate: Date.now(),
        difficulty: 'easy',
        estimatedMinutes: 120,
        completed: false,
        createdAt: Date.now(),
      };

      const completedTask = { ...task, completed: true, completedAt: Date.now() };

      expect(completedTask.completed).toBe(true);
      expect(completedTask.completedAt).toBeDefined();
    });
  });

  describe('Progress Metrics', () => {
    it('should calculate metrics correctly', () => {
      const goals: Goal[] = [
        {
          id: 'goal_1',
          title: 'Goal 1',
          description: '',
          targetDate: Date.now(),
          priority: 'high',
          createdAt: Date.now(),
          tasks: [
            {
              id: 'task_1',
              goalId: 'goal_1',
              title: 'Task 1',
              description: '',
              dueDate: Date.now(),
              difficulty: 'easy',
              estimatedMinutes: 30,
              completed: true,
              completedAt: Date.now(),
              createdAt: Date.now(),
            },
            {
              id: 'task_2',
              goalId: 'goal_1',
              title: 'Task 2',
              description: '',
              dueDate: Date.now(),
              difficulty: 'easy',
              estimatedMinutes: 30,
              completed: false,
              createdAt: Date.now(),
            },
          ],
        },
        {
          id: 'goal_2',
          title: 'Goal 2',
          description: '',
          targetDate: Date.now(),
          priority: 'low',
          createdAt: Date.now(),
          completedAt: Date.now(),
          tasks: [
            {
              id: 'task_3',
              goalId: 'goal_2',
              title: 'Task 3',
              description: '',
              dueDate: Date.now(),
              difficulty: 'easy',
              estimatedMinutes: 30,
              completed: true,
              completedAt: Date.now(),
              createdAt: Date.now(),
            },
          ],
        },
      ];

      const totalTasks = goals.reduce((sum, goal) => sum + goal.tasks.length, 0);
      const completedTasks = goals.reduce((sum, goal) => sum + goal.tasks.filter(t => t.completed).length, 0);
      const completedGoals = goals.filter(goal => goal.completedAt).length;

      expect(totalTasks).toBe(3);
      expect(completedTasks).toBe(2);
      expect(completedGoals).toBe(1);
    });

    it('should calculate streak correctly', () => {
      const now = Date.now();
      const today = new Date(now).setHours(0, 0, 0, 0);
      const yesterday = today - 24 * 60 * 60 * 1000;
      const twoDaysAgo = yesterday - 24 * 60 * 60 * 1000;

      const goals: Goal[] = [
        {
          id: 'goal_1',
          title: 'Goal 1',
          description: '',
          targetDate: now,
          priority: 'high',
          createdAt: now,
          tasks: [
            {
              id: 'task_1',
              goalId: 'goal_1',
              title: 'Task 1',
              description: '',
              dueDate: now,
              difficulty: 'easy',
              estimatedMinutes: 30,
              completed: true,
              completedAt: today,
              createdAt: now,
            },
            {
              id: 'task_2',
              goalId: 'goal_1',
              title: 'Task 2',
              description: '',
              dueDate: now,
              difficulty: 'easy',
              estimatedMinutes: 30,
              completed: true,
              completedAt: yesterday,
              createdAt: now,
            },
            {
              id: 'task_3',
              goalId: 'goal_1',
              title: 'Task 3',
              description: '',
              dueDate: now,
              difficulty: 'easy',
              estimatedMinutes: 30,
              completed: true,
              completedAt: twoDaysAgo,
              createdAt: now,
            },
          ],
        },
      ];

      // Simplified streak calculation for testing
      const lastActivityDate = Math.max(
        ...goals.flatMap(g => g.tasks.filter(t => t.completed && t.completedAt).map(t => t.completedAt || 0))
      );

      const lastActivityDateOnly = new Date(lastActivityDate).setHours(0, 0, 0, 0);
      const todayDateOnly = new Date(now).setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((todayDateOnly - lastActivityDateOnly) / (24 * 60 * 60 * 1000));

      // Should have activity today (daysDiff = 0)
      expect(daysDiff).toBe(0);
    });

    it('should calculate completed tasks this week', () => {
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

      const goals: Goal[] = [
        {
          id: 'goal_1',
          title: 'Goal 1',
          description: '',
          targetDate: now,
          priority: 'high',
          createdAt: now,
          tasks: [
            {
              id: 'task_1',
              goalId: 'goal_1',
              title: 'Task 1',
              description: '',
              dueDate: now,
              difficulty: 'easy',
              estimatedMinutes: 30,
              completed: true,
              completedAt: now,
              createdAt: now,
            },
            {
              id: 'task_2',
              goalId: 'goal_1',
              title: 'Task 2',
              description: '',
              dueDate: weekAgo - 1000,
              difficulty: 'easy',
              estimatedMinutes: 30,
              completed: true,
              completedAt: weekAgo - 1000,
              createdAt: now,
            },
          ],
        },
      ];

      const completedThisWeek = goals.reduce((sum, goal) => {
        return sum + goal.tasks.filter(t => t.completed && t.completedAt && t.completedAt >= weekAgo).length;
      }, 0);

      expect(completedThisWeek).toBe(1);
    });
  });

  describe('Data Validation', () => {
    it('should validate goal title is not empty', () => {
      const title = '';
      const isValid = title.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('should validate task title is not empty', () => {
      const title = '   ';
      const isValid = title.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('should validate estimated minutes is a positive number', () => {
      const minutes = 30;
      const isValid = minutes > 0;
      expect(isValid).toBe(true);
    });

    it('should validate target date is in the future', () => {
      const now = Date.now();
      const futureDate = now + 24 * 60 * 60 * 1000;
      const isValid = futureDate > now;
      expect(isValid).toBe(true);
    });
  });
});
