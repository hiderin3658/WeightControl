import redis from './redis';

// ユーザープレフィックス - ユーザーIDを含む一意のキー作成のため
const USER_PREFIX = 'user:';
const WEIGHT_PREFIX = 'weight:';
const GOAL_PREFIX = 'goal:';
const SETTINGS_PREFIX = 'settings:';

// ユーザーデータの型定義
export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  height?: number;
  gender?: string;
  birthdate?: string;
  createdAt: string;
}

// 体重記録の型定義
export interface WeightRecord {
  id: string;
  userId: string;
  date: string;
  weight: number;
  note?: string;
  exercise?: {
    type: string;
    duration: number;
    calories?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 目標設定の型定義
export interface Goal {
  id: string;
  userId: string;
  targetWeight: number;
  startWeight?: number; // 開始時の体重（オプション）
  startDate: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
}

// ユーザー設定の型定義
export interface UserSettings {
  userId: string;
  weightUnit: 'kg' | 'lb';
  heightUnit: 'cm' | 'in';
  notifications: boolean;
  updatedAt: string;
}

// ユーザー関連の操作
export const userOperations = {
  // ユーザーを取得する
  async getUser(userId: string): Promise<User | null> {
    return await redis.get<User>(`${USER_PREFIX}${userId}`);
  },

  // ユーザーを作成/更新する
  async setUser(user: User): Promise<void> {
    await redis.set(`${USER_PREFIX}${user.id}`, user);
  },

  // ユーザーを削除する
  async deleteUser(userId: string): Promise<void> {
    await redis.del(`${USER_PREFIX}${userId}`);
  }
};

// 体重記録の操作
export const weightOperations = {
  // 体重記録のキーを生成
  generateWeightKey(userId: string, recordId: string): string {
    return `${WEIGHT_PREFIX}${userId}:${recordId}`;
  },

  // ユーザーIDに基づいて検索用のパターンを生成
  generateWeightPattern(userId: string): string {
    return `${WEIGHT_PREFIX}${userId}:*`;
  },

  // 体重記録を作成する
  async createWeightRecord(record: WeightRecord): Promise<void> {
    await redis.set(this.generateWeightKey(record.userId, record.id), record);
  },

  // 体重記録を取得する
  async getWeightRecord(userId: string, recordId: string): Promise<WeightRecord | null> {
    return await redis.get<WeightRecord>(this.generateWeightKey(userId, recordId));
  },

  // ユーザーの全記録を取得する
  async getUserWeightRecords(userId: string): Promise<WeightRecord[]> {
    // Redisではスキャン操作を使用して特定のパターンにマッチするキーを検索
    // このキーをもとにデータを取得
    const keys = await redis.keys(this.generateWeightPattern(userId));
    
    if (keys.length === 0) {
      return [];
    }
    
    // 複数のキーからデータを一括取得
    const records = await Promise.all(
      keys.map(key => redis.get<WeightRecord>(key))
    );
    
    // nullでない値をフィルタリングして日付順にソート
    return records
      .filter((record): record is WeightRecord => record !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // 体重記録を更新する
  async updateWeightRecord(record: WeightRecord): Promise<void> {
    await redis.set(this.generateWeightKey(record.userId, record.id), {
      ...record,
      updatedAt: new Date().toISOString()
    });
  },

  // 体重記録を削除する
  async deleteWeightRecord(userId: string, recordId: string): Promise<void> {
    await redis.del(this.generateWeightKey(userId, recordId));
  }
};

// 目標設定の操作
export const goalOperations = {
  // 目標設定のキーを生成
  generateGoalKey(userId: string, goalId: string): string {
    return `${GOAL_PREFIX}${userId}:${goalId}`;
  },

  // ユーザーIDに基づいて検索用のパターンを生成
  generateGoalPattern(userId: string): string {
    return `${GOAL_PREFIX}${userId}:*`;
  },

  // 目標を作成する
  async createGoal(goal: Goal): Promise<void> {
    await redis.set(this.generateGoalKey(goal.userId, goal.id), goal);
  },

  // 目標を取得する
  async getGoal(userId: string, goalId: string): Promise<Goal | null> {
    return await redis.get<Goal>(this.generateGoalKey(userId, goalId));
  },

  // ユーザーの全目標を取得する
  async getUserGoals(userId: string): Promise<Goal[]> {
    const keys = await redis.keys(this.generateGoalPattern(userId));
    
    if (keys.length === 0) {
      return [];
    }
    
    const goals = await Promise.all(
      keys.map(key => redis.get<Goal>(key))
    );
    
    return goals
      .filter((goal): goal is Goal => goal !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // 目標を更新する
  async updateGoal(goal: Goal): Promise<void> {
    await redis.set(this.generateGoalKey(goal.userId, goal.id), {
      ...goal,
      updatedAt: new Date().toISOString()
    });
  },

  // 目標を削除する
  async deleteGoal(userId: string, goalId: string): Promise<void> {
    await redis.del(this.generateGoalKey(userId, goalId));
  }
};

// ユーザー設定の操作
export const settingsOperations = {
  // 設定のキーを生成
  generateSettingsKey(userId: string): string {
    return `${SETTINGS_PREFIX}${userId}`;
  },

  // 設定を取得する
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return await redis.get<UserSettings>(this.generateSettingsKey(userId));
  },

  // 設定を作成/更新する
  async setUserSettings(settings: UserSettings): Promise<void> {
    await redis.set(this.generateSettingsKey(settings.userId), {
      ...settings,
      updatedAt: new Date().toISOString()
    });
  },

  // デフォルト設定を作成する
  createDefaultSettings(userId: string): UserSettings {
    return {
      userId,
      weightUnit: 'kg',
      heightUnit: 'cm',
      notifications: true,
      updatedAt: new Date().toISOString()
    };
  }
};
