const { supabase } = require('../config/database');

class UserModel {
  /**
   * Create a new user record
   */
  static async create({ name, email, passwordHash, currency = '₹', monthlyIncome = 0 }) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        currency: currency || '₹',
        monthly_income: parseFloat(monthlyIncome) || 0,
      })
      .select('id, name, email, currency, monthly_income, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Find a user by email, including password_hash for authentication comparison
   */
  static async findByEmailWithPassword(email) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, password_hash, currency, monthly_income, created_at, updated_at')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is Supabase "no rows returned" code
      throw error;
    }
    return data || null;
  }

  /**
   * Find a safe user record by ID (excludes password_hash)
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, currency, monthly_income, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Update profile fields (name, currency, monthly_income)
   */
  static async update(id, updates) {
    const safeUpdates = {};
    if (updates.name !== undefined) safeUpdates.name = updates.name.trim();
    if (updates.currency !== undefined) safeUpdates.currency = updates.currency;
    if (updates.monthly_income !== undefined) {
      safeUpdates.monthly_income = parseFloat(updates.monthly_income) || 0;
    }
    if (updates.password_hash !== undefined) {
      safeUpdates.password_hash = updates.password_hash;
    }

    const { data, error } = await supabase
      .from('users')
      .update(safeUpdates)
      .eq('id', id)
      .select('id, name, email, currency, monthly_income, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = UserModel;
