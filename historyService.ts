import { supabase } from '../lib/supabase';
import type { HistoryEntry } from '../types/calculator';

export async function saveToHistory(entry: HistoryEntry): Promise<void> {
  try {
    const { error } = await supabase
      .from('calculator_history')
      .insert([
        {
          expression: entry.expression,
          result: entry.result,
          timestamp: entry.timestamp
        }
      ]);

    if (error) {
      console.error('Error saving to history:', error);
    }
  } catch (err) {
    console.error('Failed to save history:', err);
  }
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from('calculator_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to fetch history:', err);
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  try {
    const { error } = await supabase
      .from('calculator_history')
      .delete()
      .gte('id', 0);

    if (error) {
      console.error('Error clearing history:', error);
    }
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}
