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

// インメモリデータストア
class MockDatabase {
  private users: Record<string, any> = {};
  private weights: Record<string, WeightRecord> = {};
  private goals: Record<string, Goal> = {};
  private settings: Record<string, UserSettings> = {};

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
