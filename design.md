# Study Planner App - Design Document

## Overview

A mobile study planning tool that helps users set learning goals, break them into actionable tasks, and track progress. The app emphasizes simplicity, visual feedback, and one-handed mobile usage.

---

## Screen List

### 1. Home Screen (Goals Overview)
- **Primary Content**: List of all learning goals with progress indicators
- **Functionality**: 
  - Display goals as cards showing title, target completion date, and progress percentage
  - Quick visual indicators (progress bar, completion status)
  - Tap to view goal details and associated tasks
  - Floating action button (FAB) to create new goal

### 2. Create Goal Screen
- **Primary Content**: Form to set up a new learning goal
- **Functionality**:
  - Text input for goal title (e.g., "Learn React Hooks")
  - Text input for goal description
  - Date picker for target completion date
  - Priority selector (Low, Medium, High)
  - Save button to create goal

### 3. Goal Detail Screen
- **Primary Content**: Full view of a single goal with all associated tasks
- **Functionality**:
  - Goal title, description, and progress summary
  - Progress bar showing completion percentage
  - List of all tasks for this goal
  - Ability to add new tasks to the goal
  - Edit/delete goal options
  - Visual breakdown: completed vs. pending tasks

### 4. Task List (within Goal Detail)
- **Primary Content**: All tasks for the selected goal
- **Functionality**:
  - Each task shows title, due date, and completion status (checkbox)
  - Tap to view/edit task details
  - Swipe to delete or mark complete
  - Tasks grouped by status (completed, pending)

### 5. Create/Edit Task Screen
- **Primary Content**: Form to create or modify a task
- **Functionality**:
  - Text input for task title
  - Optional description
  - Due date picker
  - Difficulty selector (Easy, Medium, Hard)
  - Estimated time to complete (in minutes)
  - Save button

### 6. Progress Tracking Screen
- **Primary Content**: Visual summary of overall study progress
- **Functionality**:
  - Total goals created
  - Goals completed
  - Tasks completed this week/month
  - Completion rate percentage
  - Chart showing completion trends over time
  - Motivational streak counter (consecutive days with completed tasks)

---

## Primary Content and Functionality

### Goal Card (Home Screen)
- Title (max 2 lines)
- Progress bar (0-100%)
- Completion status text (e.g., "8/12 tasks")
- Due date badge
- Priority indicator (colored dot)

### Task Item (Goal Detail Screen)
- Checkbox for completion status
- Task title
- Due date
- Difficulty badge (color-coded)
- Estimated time remaining

### Progress Summary
- Large percentage circle showing overall completion
- Breakdown: goals completed / total goals
- Tasks completed this week
- Streak counter with flame icon

---

## Key User Flows

### Flow 1: Create a Goal
1. User taps FAB on Home Screen
2. Create Goal Screen opens
3. User enters goal title, description, target date, and priority
4. User taps "Save"
5. Goal is created and appears on Home Screen
6. User is prompted to add first task

### Flow 2: Add Tasks to a Goal
1. User taps a goal card on Home Screen
2. Goal Detail Screen opens
3. User taps "Add Task" button
4. Create Task Screen opens
5. User enters task title, description, due date, difficulty, and estimated time
6. User taps "Save"
7. Task appears in the task list for that goal
8. Progress bar updates automatically

### Flow 3: Track Progress
1. User taps a task checkbox to mark it complete
2. Task moves to "Completed" section
3. Goal's progress bar updates
4. User can view overall progress on Progress Tracking Screen
5. Streak counter increments if tasks completed today

### Flow 4: Edit or Delete a Goal
1. User taps a goal card
2. Goal Detail Screen opens
3. User taps "Edit" or "Delete" button
4. If edit: Goal edit form opens, user makes changes, saves
5. If delete: Confirmation dialog, goal and associated tasks removed

---

## Color Choices

### Brand Colors
- **Primary Accent**: `#0a7ea4` (Teal) - Used for buttons, progress indicators, and interactive elements
- **Success Green**: `#22C55E` - Used for completed tasks and goals
- **Warning Orange**: `#F59E0B` - Used for high-priority items and due date warnings
- **Error Red**: `#EF4444` - Used for overdue tasks and destructive actions

### Neutral Colors
- **Background**: `#ffffff` (Light) / `#151718` (Dark)
- **Surface**: `#f5f5f5` (Light) / `#1e2022` (Dark) - Card backgrounds
- **Foreground**: `#11181C` (Light) / `#ECEDEE` (Dark) - Primary text
- **Muted**: `#687076` (Light) / `#9BA1A6` (Dark) - Secondary text

### Difficulty Badges
- **Easy**: Light green background with green text
- **Medium**: Light yellow background with orange text
- **Hard**: Light red background with red text

---

## Layout Principles

- **Mobile Portrait (9:16)**: All screens optimized for portrait orientation
- **One-Handed Usage**: Interactive elements placed within thumb reach (bottom half of screen)
- **Safe Area Handling**: Content respects notches and home indicators
- **Tab Bar**: Bottom navigation for quick access to Home and Progress screens
- **Spacing**: Consistent 16px padding and 8px gaps between elements
- **Typography**: Large, readable fonts (18px+ for headings, 14-16px for body text)

---

## Interaction Patterns

- **Tap to Open**: Goal cards and task items open detail views
- **Swipe to Delete**: Swipe left on tasks to reveal delete option
- **Checkbox Toggle**: Tap checkbox to mark tasks complete
- **Floating Action Button**: Always visible on Home and Goal Detail screens for quick actions
- **Pull to Refresh**: Refresh goal list on Home Screen
- **Haptic Feedback**: Light haptic on button press, medium on task completion, success haptic on goal completion

---

## Data Model

### Goal
- `id`: unique identifier
- `title`: string
- `description`: string (optional)
- `targetDate`: date
- `priority`: enum (Low, Medium, High)
- `createdAt`: timestamp
- `completedAt`: timestamp (optional)
- `tasks`: Task[] (related tasks)

### Task
- `id`: unique identifier
- `goalId`: foreign key to Goal
- `title`: string
- `description`: string (optional)
- `dueDate`: date
- `difficulty`: enum (Easy, Medium, Hard)
- `estimatedMinutes`: number
- `completed`: boolean
- `completedAt`: timestamp (optional)
- `createdAt`: timestamp

### Progress Metrics
- `totalGoals`: number
- `completedGoals`: number
- `totalTasks`: number
- `completedTasks`: number
- `streak`: number (consecutive days with completed tasks)
- `lastActivityDate`: date
