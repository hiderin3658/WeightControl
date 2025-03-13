// モックデータベース - ローカル開発用

// 体重記録の型定義
export interface WeightRecord {
  id: string;
  userId: string;
  date: string;
  weight: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// 目標設定の型定義
export interface Goal {
  id: string;
  userId: string;
  targetWeight: number;
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

// サンプルデータ
export const sampleWeightRecords: WeightRecord[] = [
  {
    id: "1",
    userId: "user1",
    date: "2025-03-12",
    weight: 67.5,
    note: "散歩を30分した",
    createdAt: "2025-03-12T08:00:00Z",
    updatedAt: "2025-03-12T08:00:00Z"
  },
  {
    id: "2",
    userId: "user1",
    date: "2025-03-11",
    weight: 67.8,
    createdAt: "2025-03-11T08:00:00Z",
    updatedAt: "2025-03-11T08:00:00Z"
  },
  {
    id: "3",
    userId: "user1",
    date: "2025-03-10",
    weight: 68.2,
    note: "昨日は飲み会だった",
    createdAt: "2025-03-10T08:00:00Z",
    updatedAt: "2025-03-10T08:00:00Z"
  }
];

export const sampleGoal: Goal = {
  id: "1",
  userId: "user1",
  targetWeight: 65.0,
  startDate: "2025-03-01",
  targetDate: "2025-05-31",
  createdAt: "2025-03-01T08:00:00Z",
  updatedAt: "2025-03-01T08:00:00Z"
};

export const sampleSettings: UserSettings = {
  userId: "user1",
  weightUnit: "kg",
  heightUnit: "cm",
  notifications: true,
  updatedAt: "2025-03-01T08:00:00Z"
};

// インメモリデータストア
class MockDatabase {
  private users: Record<string, any> = {};
  private weights: Record<string, WeightRecord> = {};
  private goals: Record<string, Goal> = {};
  private settings: Record<string, UserSettings> = {};

  constructor() {
    // サンプルデータを初期化
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // 体重記録の初期化
    sampleWeightRecords.forEach(record => {
      const key = `weight:${record.userId}:${record.id}`;
      this.weights[key] = record;
    });

    // 目標の初期化
    const goalKey = `goal:${sampleGoal.userId}:${sampleGoal.id}`;
    this.goals[goalKey] = sampleGoal;

    // 設定の初期化
    const settingsKey = `settings:${sampleSettings.userId}`;
    this.settings[settingsKey] = sampleSettings;
  }

  // 体重記録の操作
  async getWeightRecords(userId: string): Promise<WeightRecord[]> {
    const prefix = `weight:${userId}:`;
    const records = Object.entries(this.weights)
      .filter(([key]) => key.startsWith(prefix))
      .map(([_, value]) => value);

    return records.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getWeightRecord(userId: string, recordId: string): Promise<WeightRecord | null> {
    const key = `weight:${userId}:${recordId}`;
    return this.weights[key] || null;
  }

  async saveWeightRecord(record: WeightRecord): Promise<void> {
    const key = `weight:${record.userId}:${record.id}`;
    this.weights[key] = record;
  }

  async deleteWeightRecord(userId: string, recordId: string): Promise<void> {
    const key = `weight:${userId}:${recordId}`;
    delete this.weights[key];
  }

  // 目標の操作
  async getGoals(userId: string): Promise<Goal[]> {
    const prefix = `goal:${userId}:`;
    const goals = Object.entries(this.goals)
      .filter(([key]) => key.startsWith(prefix))
      .map(([_, value]) => value);

    return goals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getGoal(userId: string, goalId: string): Promise<Goal | null> {
    const key = `goal:${userId}:${goalId}`;
    return this.goals[key] || null;
  }

  async saveGoal(goal: Goal): Promise<void> {
    const key = `goal:${goal.userId}:${goal.id}`;
    this.goals[key] = goal;
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const key = `goal:${userId}:${goalId}`;
    delete this.goals[key];
  }

  // 設定の操作
  async getSettings(userId: string): Promise<UserSettings | null> {
    const key = `settings:${userId}`;
    return this.settings[key] || null;
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    const key = `settings:${settings.userId}`;
    this.settings[key] = settings;
  }
}

// シングルトンインスタンスをエクスポート
export const mockDb = new MockDatabase();
