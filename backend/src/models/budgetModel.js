const { supabase } = require('../config/database');

class BudgetModel {
  /**
   * Create or update a budget for a category, month, and year (upsert)
   */
  static async upsert({ userId, category, amount, month, year }) {
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const amt = parseFloat(amount);

    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        {
          user_id: userId,
          category,
          amount: amt,
          month: m,
          year: y,
        },
        { onConflict: 'user_id, category, month, year' }
      )
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Find budgets for user, optionally filtered by month and year
   */
  static async findAll({ userId, month, year }) {
    let query = supabase.from('budgets').select('*').eq('user_id', userId);

    if (month) query = query.eq('month', parseInt(month, 10));
    if (year) query = query.eq('year', parseInt(year, 10));

    query = query.order('category', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Find single budget strictly scoped to user
   */
  static async findById(id, userId) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Update budget strictly scoped to user
   */
  static async update(id, userId, updates) {
    const safeUpdates = {};
    if (updates.amount !== undefined) safeUpdates.amount = parseFloat(updates.amount);
    if (updates.category !== undefined) safeUpdates.category = updates.category;
    if (updates.month !== undefined) safeUpdates.month = parseInt(updates.month, 10);
    if (updates.year !== undefined) safeUpdates.year = parseInt(updates.year, 10);

    const { data, error } = await supabase
      .from('budgets')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete budget strictly scoped to user
   */
  static async delete(id, userId) {
    const { data, error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
}

module.exports = BudgetModel;
