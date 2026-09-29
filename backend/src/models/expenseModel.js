const { supabase } = require('../config/database');

class ExpenseModel {
  /**
   * Create an expense scoped to user_id
   */
  static async create({
    userId,
    title,
    amount,
    category,
    description = '',
    paymentMethod = 'Cash',
    expenseDate = new Date().toISOString().slice(0, 10),
    isNecessary = true,
  }) {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        description: description ? description.trim() : '',
        payment_method: paymentMethod,
        expense_date: expenseDate,
        is_necessary: Boolean(isNecessary),
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Find expenses for a user with comprehensive filtering, sorting, and pagination
   */
  static async findAll({
    userId,
    page = 1,
    limit = 20,
    category,
    paymentMethod,
    startDate,
    endDate,
    isNecessary,
    search,
    sortBy = 'expense_date',
    order = 'desc',
  }) {
    let query = supabase.from('expenses').select('*', { count: 'exact' }).eq('user_id', userId);

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    if (paymentMethod && paymentMethod !== 'All') {
      query = query.eq('payment_method', paymentMethod);
    }
    if (startDate) {
      query = query.gte('expense_date', startDate);
    }
    if (endDate) {
      query = query.lte('expense_date', endDate);
    }
    if (isNecessary !== undefined && isNecessary !== null && isNecessary !== 'All') {
      const boolVal = String(isNecessary) === 'true';
      query = query.eq('is_necessary', boolVal);
    }
    if (search && search.trim() !== '') {
      query = query.ilike('title', `%${search.trim()}%`);
    }

    // Sorting
    const sortField = ['expense_date', 'amount', 'title', 'created_at'].includes(sortBy)
      ? sortBy
      : 'expense_date';
    const isAscending = order.toLowerCase() === 'asc';
    query = query.order(sortField, { ascending: isAscending });

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const total = count !== null && count !== undefined ? count : (data ? data.length : 0);
    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      expenses: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  }

  /**
   * Find single expense strictly scoped to user
   */
  static async findById(id, userId) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Update expense strictly scoped to user
   */
  static async update(id, userId, updates) {
    const safeUpdates = {};
    if (updates.title !== undefined) safeUpdates.title = updates.title.trim();
    if (updates.amount !== undefined) safeUpdates.amount = parseFloat(updates.amount);
    if (updates.category !== undefined) safeUpdates.category = updates.category;
    if (updates.description !== undefined) safeUpdates.description = updates.description.trim();
    if (updates.paymentMethod !== undefined) safeUpdates.payment_method = updates.paymentMethod;
    if (updates.expenseDate !== undefined) safeUpdates.expense_date = updates.expenseDate;
    if (updates.isNecessary !== undefined) safeUpdates.is_necessary = Boolean(updates.isNecessary);

    const { data, error } = await supabase
      .from('expenses')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete expense strictly scoped to user
   */
  static async delete(id, userId) {
    const { data, error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  /**
   * Get all expenses for analytics within an optional date range
   */
  static async getByDateRange(userId, startDate, endDate) {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('expense_date', { ascending: true });

    if (startDate) query = query.gte('expense_date', startDate);
    if (endDate) query = query.lte('expense_date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

module.exports = ExpenseModel;
