/**
 * Gamification Service
 * Manages achievements, points, badges, and user progression
 */

export enum AchievementType {
  FIRST_BUDGET = 'first_budget',
  BUDGET_STREAK_7 = 'budget_streak_7',
  BUDGET_STREAK_30 = 'budget_streak_30',
  BUDGET_STREAK_100 = 'budget_streak_100',
  SAVINGS_GOAL_MET = 'savings_goal_met',
  EXPENSE_LOGGED_10 = 'expense_logged_10',
  EXPENSE_LOGGED_50 = 'expense_logged_50',
  EXPENSE_LOGGED_100 = 'expense_logged_100',
  EXPENSE_LOGGED_500 = 'expense_logged_500',
  UNDER_BUDGET = 'under_budget',
  UNDER_BUDGET_STREAK = 'under_budget_streak',
  CATEGORY_MASTER = 'category_master',
  RECEIPT_SCANNER = 'receipt_scanner',
  INVESTMENT_TRACKER = 'investment_tracker',
  CRYPTO_TRADER = 'crypto_trader',
  FINANCIAL_GURU = 'financial_guru',
  MONEY_SAVER = 'money_saver',
  DEBT_FREE = 'debt_free',
  EMERGENCY_FUND = 'emergency_fund',
  MILLIONAIRE = 'millionaire',
}

export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  points: number;
  tier: BadgeTier;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  requirement: string;
}

export interface UserProgress {
  userId: string;
  totalPoints: number;
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  achievements: Achievement[];
  badges: Badge[];
  streaks: Streaks;
  stats: UserStats;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  earnedAt: Date;
  rare: boolean;
}

export interface Streaks {
  currentBudgetStreak: number;
  longestBudgetStreak: number;
  currentUnderBudgetStreak: number;
  longestUnderBudgetStreak: number;
  lastActivityDate: Date;
}

export interface UserStats {
  totalExpenses: number;
  totalBudgets: number;
  totalSavings: number;
  receiptsScanned: number;
  goalsCompleted: number;
  daysActive: number;
  categoriesTracked: number;
}

export interface LevelInfo {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  rewards: string[];
}

/**
 * Points system configuration
 */
const POINTS = {
  CREATE_BUDGET: 50,
  LOG_EXPENSE: 10,
  SCAN_RECEIPT: 20,
  COMPLETE_GOAL: 100,
  UNDER_BUDGET: 75,
  DAILY_LOGIN: 5,
  WEEKLY_LOGIN: 25,
  MONTHLY_LOGIN: 100,
  CATEGORIZE_EXPENSE: 5,
  ADD_INVESTMENT: 30,
  TRACK_CRYPTO: 25,
  SHARE_ACHIEVEMENT: 15,
} as const;

/**
 * Level thresholds and names
 */
const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Beginner', minPoints: 0, maxPoints: 100, rewards: ['Basic dashboard access'] },
  { level: 2, name: 'Novice', minPoints: 100, maxPoints: 250, rewards: ['Expense categories unlocked'] },
  { level: 3, name: 'Learner', minPoints: 250, maxPoints: 500, rewards: ['Budget templates unlocked'] },
  { level: 4, name: 'Saver', minPoints: 500, maxPoints: 1000, rewards: ['Savings goals feature'] },
  { level: 5, name: 'Tracker', minPoints: 1000, maxPoints: 2000, rewards: ['Receipt scanner unlocked'] },
  { level: 6, name: 'Analyst', minPoints: 2000, maxPoints: 3500, rewards: ['Advanced analytics'] },
  { level: 7, name: 'Investor', minPoints: 3500, maxPoints: 5500, rewards: ['Investment tracking'] },
  { level: 8, name: 'Expert', minPoints: 5500, maxPoints: 8000, rewards: ['Crypto portfolio tracker'] },
  { level: 9, name: 'Master', minPoints: 8000, maxPoints: 12000, rewards: ['AI budget suggestions'] },
  { level: 10, name: 'Guru', minPoints: 12000, maxPoints: Infinity, rewards: ['All premium features'] },
];

/**
 * Achievement definitions
 */
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progress' | 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'ach_first_budget',
    type: AchievementType.FIRST_BUDGET,
    name: 'Getting Started',
    description: 'Create your first budget',
    icon: '🎯',
    points: 50,
    tier: BadgeTier.BRONZE,
    maxProgress: 1,
    requirement: 'Create 1 budget',
  },
  {
    id: 'ach_streak_7',
    type: AchievementType.BUDGET_STREAK_7,
    name: 'Week Warrior',
    description: 'Stay under budget for 7 days straight',
    icon: '🔥',
    points: 150,
    tier: BadgeTier.SILVER,
    maxProgress: 7,
    requirement: '7-day streak',
  },
  {
    id: 'ach_streak_30',
    type: AchievementType.BUDGET_STREAK_30,
    name: 'Monthly Master',
    description: 'Stay under budget for 30 days straight',
    icon: '⭐',
    points: 500,
    tier: BadgeTier.GOLD,
    maxProgress: 30,
    requirement: '30-day streak',
  },
  {
    id: 'ach_streak_100',
    type: AchievementType.BUDGET_STREAK_100,
    name: 'Century Champion',
    description: 'Stay under budget for 100 days straight',
    icon: '👑',
    points: 2000,
    tier: BadgeTier.DIAMOND,
    maxProgress: 100,
    requirement: '100-day streak',
  },
  {
    id: 'ach_expense_10',
    type: AchievementType.EXPENSE_LOGGED_10,
    name: 'Expense Tracker',
    description: 'Log 10 expenses',
    icon: '📝',
    points: 100,
    tier: BadgeTier.BRONZE,
    maxProgress: 10,
    requirement: 'Log 10 expenses',
  },
  {
    id: 'ach_expense_50',
    type: AchievementType.EXPENSE_LOGGED_50,
    name: 'Detail Oriented',
    description: 'Log 50 expenses',
    icon: '📊',
    points: 300,
    tier: BadgeTier.SILVER,
    maxProgress: 50,
    requirement: 'Log 50 expenses',
  },
  {
    id: 'ach_expense_100',
    type: AchievementType.EXPENSE_LOGGED_100,
    name: 'Meticulous Manager',
    description: 'Log 100 expenses',
    icon: '📈',
    points: 600,
    tier: BadgeTier.GOLD,
    maxProgress: 100,
    requirement: 'Log 100 expenses',
  },
  {
    id: 'ach_expense_500',
    type: AchievementType.EXPENSE_LOGGED_500,
    name: 'Legendary Logger',
    description: 'Log 500 expenses',
    icon: '🏆',
    points: 2500,
    tier: BadgeTier.PLATINUM,
    maxProgress: 500,
    requirement: 'Log 500 expenses',
  },
  {
    id: 'ach_savings_goal',
    type: AchievementType.SAVINGS_GOAL_MET,
    name: 'Goal Getter',
    description: 'Complete your first savings goal',
    icon: '💰',
    points: 200,
    tier: BadgeTier.GOLD,
    maxProgress: 1,
    requirement: 'Complete 1 savings goal',
  },
  {
    id: 'ach_receipt_scanner',
    type: AchievementType.RECEIPT_SCANNER,
    name: 'Tech Savvy',
    description: 'Scan your first receipt',
    icon: '📷',
    points: 75,
    tier: BadgeTier.BRONZE,
    maxProgress: 1,
    requirement: 'Scan 1 receipt',
  },
  {
    id: 'ach_investment',
    type: AchievementType.INVESTMENT_TRACKER,
    name: 'Investor',
    description: 'Add your first investment',
    icon: '📈',
    points: 150,
    tier: BadgeTier.SILVER,
    maxProgress: 1,
    requirement: 'Add 1 investment',
  },
  {
    id: 'ach_crypto',
    type: AchievementType.CRYPTO_TRADER,
    name: 'Crypto Enthusiast',
    description: 'Track your first cryptocurrency',
    icon: '₿',
    points: 150,
    tier: BadgeTier.SILVER,
    maxProgress: 1,
    requirement: 'Track 1 crypto',
  },
  {
    id: 'ach_emergency_fund',
    type: AchievementType.EMERGENCY_FUND,
    name: 'Safety First',
    description: 'Build an emergency fund of 6 months expenses',
    icon: '🛡️',
    points: 1000,
    tier: BadgeTier.PLATINUM,
    maxProgress: 1,
    requirement: '6 months emergency fund',
  },
  {
    id: 'ach_debt_free',
    type: AchievementType.DEBT_FREE,
    name: 'Freedom Fighter',
    description: 'Pay off all your debts',
    icon: '🎉',
    points: 1500,
    tier: BadgeTier.DIAMOND,
    maxProgress: 1,
    requirement: 'Zero debt balance',
  },
];

/**
 * Awards points to a user for a specific action
 * @param userId - User ID
 * @param action - Action performed
 * @param multiplier - Points multiplier (default: 1)
 * @returns Points awarded
 */
export function awardPoints(
  userId: string,
  action: keyof typeof POINTS,
  multiplier: number = 1
): number {
  const points = POINTS[action] * multiplier;
  console.log(`Awarded ${points} points to user ${userId} for ${action}`);
  return points;
}

/**
 * Calculates user level based on total points
 * @param totalPoints - User's total points
 * @returns Level information
 */
export function calculateLevel(totalPoints: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Gets progress towards next level
 * @param totalPoints - User's total points
 * @returns Current level points and points needed for next level
 */
export function getLevelProgress(totalPoints: number): {
  currentLevel: LevelInfo;
  nextLevel: LevelInfo | null;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progress: number;
} {
  const currentLevel = calculateLevel(totalPoints);
  const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level);
  const nextLevel = currentLevelIndex < LEVELS.length - 1 ? LEVELS[currentLevelIndex + 1] : null;

  const currentLevelPoints = totalPoints - currentLevel.minPoints;
  const nextLevelPoints = nextLevel ? nextLevel.minPoints - currentLevel.minPoints : 0;
  const progress = nextLevelPoints > 0 ? (currentLevelPoints / nextLevelPoints) * 100 : 100;

  return {
    currentLevel,
    nextLevel,
    currentLevelPoints,
    nextLevelPoints,
    progress,
  };
}

/**
 * Checks if an achievement is unlocked
 * @param achievementType - Achievement type to check
 * @param userStats - User statistics
 * @param streaks - User streaks
 * @returns True if achievement is unlocked
 */
export function checkAchievementUnlock(
  achievementType: AchievementType,
  userStats: UserStats,
  streaks: Streaks
): boolean {
  switch (achievementType) {
    case AchievementType.FIRST_BUDGET:
      return userStats.totalBudgets >= 1;
    case AchievementType.BUDGET_STREAK_7:
      return streaks.currentUnderBudgetStreak >= 7;
    case AchievementType.BUDGET_STREAK_30:
      return streaks.currentUnderBudgetStreak >= 30;
    case AchievementType.BUDGET_STREAK_100:
      return streaks.currentUnderBudgetStreak >= 100;
    case AchievementType.EXPENSE_LOGGED_10:
      return userStats.totalExpenses >= 10;
    case AchievementType.EXPENSE_LOGGED_50:
      return userStats.totalExpenses >= 50;
    case AchievementType.EXPENSE_LOGGED_100:
      return userStats.totalExpenses >= 100;
    case AchievementType.EXPENSE_LOGGED_500:
      return userStats.totalExpenses >= 500;
    case AchievementType.SAVINGS_GOAL_MET:
      return userStats.goalsCompleted >= 1;
    case AchievementType.RECEIPT_SCANNER:
      return userStats.receiptsScanned >= 1;
    default:
      return false;
  }
}

/**
 * Gets all achievements with current progress
 * @param userStats - User statistics
 * @param streaks - User streaks
 * @param unlockedAchievements - Set of unlocked achievement IDs
 * @returns Array of achievements with progress
 */
export function getAllAchievements(
  userStats: UserStats,
  streaks: Streaks,
  unlockedAchievements: Set<string> = new Set()
): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map(def => {
    let progress = 0;

    switch (def.type) {
      case AchievementType.FIRST_BUDGET:
        progress = Math.min(userStats.totalBudgets, def.maxProgress);
        break;
      case AchievementType.BUDGET_STREAK_7:
      case AchievementType.BUDGET_STREAK_30:
      case AchievementType.BUDGET_STREAK_100:
        progress = Math.min(streaks.currentUnderBudgetStreak, def.maxProgress);
        break;
      case AchievementType.EXPENSE_LOGGED_10:
      case AchievementType.EXPENSE_LOGGED_50:
      case AchievementType.EXPENSE_LOGGED_100:
      case AchievementType.EXPENSE_LOGGED_500:
        progress = Math.min(userStats.totalExpenses, def.maxProgress);
        break;
      case AchievementType.SAVINGS_GOAL_MET:
        progress = Math.min(userStats.goalsCompleted, def.maxProgress);
        break;
      case AchievementType.RECEIPT_SCANNER:
        progress = Math.min(userStats.receiptsScanned, def.maxProgress);
        break;
    }

    const unlocked = unlockedAchievements.has(def.id) || 
                    checkAchievementUnlock(def.type, userStats, streaks);

    return {
      ...def,
      progress,
      unlocked,
      unlockedAt: unlocked ? new Date() : undefined,
    };
  });
}

/**
 * Updates user streaks based on activity
 * @param streaks - Current streaks
 * @param isUnderBudget - Whether user is under budget today
 * @returns Updated streaks
 */
export function updateStreaks(streaks: Streaks, isUnderBudget: boolean): Streaks {
  const today = new Date();
  const lastActivity = new Date(streaks.lastActivityDate);
  const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  let newBudgetStreak = streaks.currentBudgetStreak;
  let newUnderBudgetStreak = streaks.currentUnderBudgetStreak;

  if (daysDiff === 1) {
    newBudgetStreak += 1;
    if (isUnderBudget) {
      newUnderBudgetStreak += 1;
    } else {
      newUnderBudgetStreak = 0;
    }
  } else if (daysDiff > 1) {
    newBudgetStreak = 1;
    newUnderBudgetStreak = isUnderBudget ? 1 : 0;
  }

  return {
    currentBudgetStreak: newBudgetStreak,
    longestBudgetStreak: Math.max(streaks.longestBudgetStreak, newBudgetStreak),
    currentUnderBudgetStreak: newUnderBudgetStreak,
    longestUnderBudgetStreak: Math.max(streaks.longestUnderBudgetStreak, newUnderBudgetStreak),
    lastActivityDate: today,
  };
}

/**
 * Creates a badge from an achievement
 * @param achievement - Achievement to convert to badge
 * @returns Badge object
 */
export function createBadge(achievement: Achievement): Badge {
  return {
    id: `badge_${achievement.id}`,
    name: achievement.name,
    description: achievement.description,
    icon: achievement.icon,
    tier: achievement.tier,
    earnedAt: new Date(),
    rare: achievement.tier === BadgeTier.PLATINUM || achievement.tier === BadgeTier.DIAMOND,
  };
}

/**
 * Gets user's rank compared to all users
 * @param userPoints - User's total points
 * @param allUserPoints - Array of all users' points
 * @returns Rank and percentile
 */
export function getUserRank(
  userPoints: number,
  allUserPoints: number[]
): { rank: number; percentile: number; totalUsers: number } {
  const sortedPoints = [...allUserPoints].sort((a, b) => b - a);
  const rank = sortedPoints.findIndex(points => points <= userPoints) + 1;
  const percentile = ((sortedPoints.length - rank + 1) / sortedPoints.length) * 100;

  return {
    rank: rank || sortedPoints.length + 1,
    percentile: Math.round(percentile),
    totalUsers: sortedPoints.length,
  };
}

/**
 * Exports achievement definitions for external use
 */
export const ACHIEVEMENTS = ACHIEVEMENT_DEFINITIONS;

/**
 * Exports points values for external use
 */
export const POINTS_VALUES = POINTS;

/**
 * Exports level definitions for external use
 */
export const LEVEL_DEFINITIONS = LEVELS;
