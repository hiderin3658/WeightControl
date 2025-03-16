import { NextRequest, NextResponse } from 'next/server';
import { goalDb } from '@/app/lib/db-wrapper';
import { Goal } from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';

// 目標を取得するAPI
export async function GET(request: NextRequest) {
  console.error('[API] 目標取得APIが呼び出されました');
  
  try {
    // セッションを取得して認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    
    const userId = session.user.email;
    console.error(`[API] ユーザー ${userId} の目標を取得します`);
    
    // 目標を取得
    const goals = await goalDb.getUserGoals(userId);
    
    console.error(`[API] ${goals.length}件の目標を取得しました`);
    
    return NextResponse.json(goals);
  } catch (error) {
    console.error('[API] 目標取得中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '目標の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 目標を作成するAPI
export async function POST(request: NextRequest) {
  console.error('[API] 目標の作成APIが呼び出されました');
  
  try {
    // セッションを取得して認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディを取得
    const goal: Goal = await request.json();
    
    // ユーザーIDを確認
    if (goal.userId !== session.user.email) {
      return NextResponse.json({ error: '不正なユーザーIDです' }, { status: 403 });
    }
    
    console.error(`[API] 目標の保存を開始します: ${goal.id}`);
    
    // 目標を保存
    await goalDb.createGoal(goal);
    
    console.error(`[API] 目標の保存が完了しました: ${goal.id}`);
    
    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error('[API] 目標の保存中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '目標の保存に失敗しました' },
      { status: 500 }
    );
  }
}

// 目標を更新するAPI
export async function PUT(request: NextRequest) {
  console.error('[API] 目標の更新APIが呼び出されました');
  
  try {
    // セッションを取得して認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディを取得
    const goal: Goal = await request.json();
    
    // ユーザーIDを確認
    if (goal.userId !== session.user.email) {
      return NextResponse.json({ error: '不正なユーザーIDです' }, { status: 403 });
    }
    
    console.error(`[API] 目標の更新を開始します: ${goal.id}`);
    
    // 目標を更新
    await goalDb.updateGoal(goal);
    
    console.error(`[API] 目標の更新が完了しました: ${goal.id}`);
    
    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error('[API] 目標の更新中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '目標の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// 目標を削除するAPI
export async function DELETE(request: NextRequest) {
  console.error('[API] 目標の削除APIが呼び出されました');
  
  try {
    // セッションを取得して認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // URLからパラメータを取得
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('id');
    
    if (!goalId) {
      return NextResponse.json({ error: '目標IDが指定されていません' }, { status: 400 });
    }
    
    console.error(`[API] 目標の削除を開始します: ${session.user.email}/${goalId}`);
    
    // 目標を削除
    await goalDb.deleteGoal(session.user.email, goalId);
    
    console.error(`[API] 目標の削除が完了しました: ${session.user.email}/${goalId}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] 目標の削除中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '目標の削除に失敗しました' },
      { status: 500 }
    );
  }
}
