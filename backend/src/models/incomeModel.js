const { supabase } = require('../config/database');

class IncomeModel {
  /**
   * Create an income entry scoped to user_id
   */
  static async create({
    userId,
    source,
    amount,
    incomeDate = new Date().toISOString().slice(0, 10),
    description = '',
  }) {
    const { data, error } = await supabase
      .from('income')
      .insert({
        user_id: userId,
        source: source.trim(),
        amount: parseFloat(amount),
        income_date: incomeDate,
        description: description ? description.trim() : '',
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Find all income records for a user
   */
  static async findAll(userId) {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('income_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Find single income record strictly scoped to user
   */
  static async findById(id, userId) {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Update income strictly scoped to user
   */
  static async update(id, userId, updates) {
    const safeUpdates = {};
    if (updates.source !== undefined) safeUpdates.source = updates.source.trim();
    if (updates.amount !== undefined) safeUpdates.amount = parseFloat(updates.amount);
    if (updates.incomeDate !== undefined) safeUpdates.income_date = updates.incomeDate;
    if (updates.description !== undefined) safeUpdates.description = updates.description.trim();

    const { data, error } = await supabase
      .from('income')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete income strictly scoped to user
   */
  static async delete(id, userId) {
    const { data, error } = await supabase
      .from('income')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  /**
   * Get all income records for a user within a date range
   */
  static async getByDateRange(userId, startDate, endDate) {
    let query = supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('income_date', { ascending: true });

    if (startDate) query = query.gte('income_date', startDate);
    if (endDate) query = query.lte('income_date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

module.exports = IncomeModel;
