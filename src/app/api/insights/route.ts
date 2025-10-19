import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('full_name, allowance, savings_goal')
      .eq('user_id', user_id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user's expenses with category information
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select(`
        expense_id,
        user_id,
        category_id,
        amount,
        description,
        payment_method,
        source,
        emotion_tag,
        expense_date,
        created_at,
        categories (
          category_name
        )
      `)
      .eq('user_id', user_id)
      .order('expense_date', { ascending: false })
      .limit(100); // Last 100 expenses

    if (expensesError) {
      return NextResponse.json(
        { error: 'Failed to fetch expenses' },
        { status: 500 }
      );
    }

    if (!expenses || expenses.length === 0) {
      return NextResponse.json(
        { 
          insights: 'No expense data available yet. Start tracking your expenses to get personalized insights!',
          summary: {
            total_expenses: 0,
            expense_count: 0,
            avg_daily_spending: 0,
          }
        },
        { status: 200 }
      );
    }

    // Calculate summary statistics
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const expenseCount = expenses.length;
    
    // Calculate date range
    const dates = expenses.map(e => new Date(e.expense_date));
    const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const daysDiff = Math.max(1, Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgDailySpending = totalExpenses / daysDiff;

    // Group by category
    const categoryBreakdown: Record<string, { total: number; count: number }> = {};
    expenses.forEach(exp => {
      const categoryName = (exp as any).categories?.category_name || 'Uncategorized';
      if (!categoryBreakdown[categoryName]) {
        categoryBreakdown[categoryName] = { total: 0, count: 0 };
      }
      categoryBreakdown[categoryName].total += Number(exp.amount);
      categoryBreakdown[categoryName].count += 1;
    });

    // Group by payment method
    const paymentMethodBreakdown: Record<string, number> = {};
    expenses.forEach(exp => {
      paymentMethodBreakdown[exp.payment_method] = 
        (paymentMethodBreakdown[exp.payment_method] || 0) + Number(exp.amount);
    });

    // Group by emotion tag
    const emotionBreakdown: Record<string, number> = {};
    expenses.forEach(exp => {
      if (exp.emotion_tag) {
        emotionBreakdown[exp.emotion_tag] = 
          (emotionBreakdown[exp.emotion_tag] || 0) + Number(exp.amount);
      }
    });

    // Prepare data for AI analysis
    const expenseAnalysisData = {
      user: {
        name: userData.full_name,
        allowance: userData.allowance,
        savings_goal: userData.savings_goal,
      },
      summary: {
        total_expenses: totalExpenses,
        expense_count: expenseCount,
        avg_daily_spending: avgDailySpending,
        date_range: {
          from: oldestDate.toISOString().split('T')[0],
          to: newestDate.toISOString().split('T')[0],
          days: daysDiff,
        },
      },
      breakdown: {
        by_category: categoryBreakdown,
        by_payment_method: paymentMethodBreakdown,
        by_emotion: emotionBreakdown,
      },
      recent_expenses: expenses.slice(0, 10).map(exp => ({
        date: exp.expense_date,
        amount: exp.amount,
        category: (exp as any).categories?.category_name || 'Uncategorized',
        description: exp.description,
        emotion: exp.emotion_tag,
      })),
    };

    // Generate AI insights
    const prompt = `You are a financial advisor analyzing a student's spending habits. 

User Profile:
- Name: ${userData.full_name}
- Monthly Allowance: ₱${userData.allowance}
- Savings Goal: ₱${userData.savings_goal || 'Not set'}

Expense Summary:
- Total Spent: ₱${totalExpenses.toFixed(2)} over ${daysDiff} days
- Number of Transactions: ${expenseCount}
- Average Daily Spending: ₱${avgDailySpending.toFixed(2)}

Category Breakdown:
${Object.entries(categoryBreakdown)
  .map(([cat, data]) => `- ${cat}: ₱${data.total.toFixed(2)} (${data.count} transactions)`)
  .join('\n')}

Payment Methods:
${Object.entries(paymentMethodBreakdown)
  .map(([method, total]) => `- ${method}: ₱${total.toFixed(2)}`)
  .join('\n')}

${Object.keys(emotionBreakdown).length > 0 ? `
Emotional Spending:
${Object.entries(emotionBreakdown)
  .map(([emotion, total]) => `- ${emotion}: ₱${total.toFixed(2)}`)
  .join('\n')}
` : ''}

Recent Expenses (Last 10):
${expenses.slice(0, 10).map(exp => 
  `- ${exp.expense_date}: ₱${exp.amount} - ${(exp as any).categories?.category_name || 'Uncategorized'}${exp.description ? ` (${exp.description})` : ''}${exp.emotion_tag ? ` [${exp.emotion_tag}]` : ''}`
).join('\n')}

Please provide:
1. A brief overview of their spending patterns
2. Key insights about their financial behavior
3. Specific areas where they're spending the most
4. Actionable recommendations to help them save money and reach their savings goal
5. Any concerning patterns or positive habits you notice
6. Tips specific to student budget management

Keep the tone friendly, encouraging, and practical. Format your response in clear sections.`;

    const { text: insights } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt: prompt,
    });

    // Save insights to database
    const { data: savedInsight, error: insertError } = await supabase
      .from('insights_weekly_analysis')
      .insert({
        user_id: user_id,
        insights_summary: insights,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving insights:', insertError);
    }

    // Return insights with summary data
    return NextResponse.json({
      insights: insights,
      summary: {
        total_expenses: totalExpenses,
        expense_count: expenseCount,
        avg_daily_spending: avgDailySpending,
        date_range: {
          from: oldestDate.toISOString().split('T')[0],
          to: newestDate.toISOString().split('T')[0],
          days: daysDiff,
        },
        category_breakdown: categoryBreakdown,
        payment_method_breakdown: paymentMethodBreakdown,
        emotion_breakdown: emotionBreakdown,
      },
      user_info: {
        allowance: userData.allowance,
        savings_goal: userData.savings_goal,
        budget_remaining: userData.allowance ? userData.allowance - totalExpenses : null,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights', details: (error as Error).message },
      { status: 500 }
    );
  }
}
