const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const config = require('./env');

const isRealSupabaseConfigured = () => {
  return (
    config.supabaseUrl &&
    config.supabaseUrl.startsWith('https://') &&
    !config.supabaseUrl.includes('your-project') &&
    !config.supabaseUrl.includes('mock-or-your-project') &&
    config.supabaseKey &&
    config.supabaseKey.length > 20 &&
    !config.supabaseKey.includes('mock-') &&
    !config.supabaseKey.includes('your-supabase')
  );
};

// ==============================================================================
// In-Memory Fallback Adapter (for instant offline testing and development)
// ==============================================================================
class MockSupabaseQueryBuilder {
  constructor(store, tableName) {
    this.store = store;
    this.tableName = tableName;
    this.filters = [];
    this.selectedColumns = '*';
    this.orderConfig = null;
    this.rangeConfig = null;
    this.isSingle = false;
    this.operation = 'select'; // 'select' | 'insert' | 'update' | 'delete'
    this.payload = null;
    this.upsertConflictCols = null;
  }

  select(columns = '*') {
    this.selectedColumns = columns;
    return this;
  }

  insert(data) {
    this.operation = 'insert';
    this.payload = Array.isArray(data) ? data : [data];
    return this;
  }

  upsert(data, options = {}) {
    this.operation = 'upsert';
    this.payload = Array.isArray(data) ? data : [data];
    this.upsertConflictCols = options.onConflict ? options.onConflict.split(',').map((s) => s.trim()) : null;
    return this;
  }

  update(data) {
    this.operation = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(column, value) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  neq(column, value) {
    this.filters.push((row) => row[column] !== value);
    return this;
  }

  gte(column, value) {
    this.filters.push((row) => new Date(row[column]) >= new Date(value));
    return this;
  }

  lte(column, value) {
    this.filters.push((row) => new Date(row[column]) <= new Date(value));
    return this;
  }

  ilike(column, pattern) {
    const cleanPattern = pattern.replace(/%/g, '').toLowerCase();
    this.filters.push((row) => {
      const val = row[column] ? String(row[column]).toLowerCase() : '';
      return val.includes(cleanPattern);
    });
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orderConfig = { column, ascending };
    return this;
  }

  range(from, to) {
    this.rangeConfig = { from, to };
    return this;
  }

  limit(count) {
    this.rangeConfig = { from: 0, to: count - 1 };
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  projectRecord(row) {
    if (!row || this.selectedColumns === '*' || !this.selectedColumns) return row;
    const cols = this.selectedColumns.split(',').map((c) => c.trim()).filter(Boolean);
    const projected = {};
    cols.forEach((c) => {
      if (row[c] !== undefined) projected[c] = row[c];
    });
    return projected;
  }

  async then(resolve, reject) {
    try {
      if (!this.store[this.tableName]) {
        this.store[this.tableName] = [];
      }
      const tableData = this.store[this.tableName];

      if (this.operation === 'insert') {
        const newRecords = this.payload.map((item) => ({
          id: item.id || crypto.randomUUID(),
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          ...item,
        }));
        tableData.push(...newRecords);
        const projected = newRecords.map((r) => this.projectRecord(r));
        const result = this.isSingle ? projected[0] : projected;
        return resolve({ data: result, error: null });
      }

      if (this.operation === 'upsert') {
        const results = [];
        for (const item of this.payload) {
          let existingIndex = -1;
          if (this.upsertConflictCols) {
            existingIndex = tableData.findIndex((row) =>
              this.upsertConflictCols.every((col) => row[col] === item[col])
            );
          } else if (item.id) {
            existingIndex = tableData.findIndex((row) => row.id === item.id);
          }

          if (existingIndex >= 0) {
            tableData[existingIndex] = {
              ...tableData[existingIndex],
              ...item,
              updated_at: new Date().toISOString(),
            };
            results.push(tableData[existingIndex]);
          } else {
            const newRecord = {
              id: item.id || crypto.randomUUID(),
              created_at: item.created_at || new Date().toISOString(),
              updated_at: item.updated_at || new Date().toISOString(),
              ...item,
            };
            tableData.push(newRecord);
            results.push(newRecord);
          }
        }
        const projected = results.map((r) => this.projectRecord(r));
        const result = this.isSingle ? projected[0] : projected;
        return resolve({ data: result, error: null });
      }

      if (this.operation === 'update') {
        let matching = tableData.filter((row) => this.filters.every((fn) => fn(row)));
        matching.forEach((row) => {
          Object.assign(row, this.payload, { updated_at: new Date().toISOString() });
        });
        const projected = matching.map((r) => this.projectRecord(r));
        const result = this.isSingle ? projected[0] || null : projected;
        return resolve({ data: result, error: null });
      }

      if (this.operation === 'delete') {
        const toDelete = tableData.filter((row) => this.filters.every((fn) => fn(row)));
        this.store[this.tableName] = tableData.filter(
          (row) => !this.filters.every((fn) => fn(row))
        );
        return resolve({ data: toDelete, error: null });
      }

      // SELECT
      let rows = tableData.filter((row) => this.filters.every((fn) => fn(row)));

      if (this.orderConfig) {
        const { column, ascending } = this.orderConfig;
        rows.sort((a, b) => {
          if (a[column] < b[column]) return ascending ? -1 : 1;
          if (a[column] > b[column]) return ascending ? 1 : -1;
          return 0;
        });
      }

      const totalCount = rows.length;

      if (this.rangeConfig) {
        const { from, to } = this.rangeConfig;
        rows = rows.slice(from, to + 1);
      }

      const projected = rows.map((r) => this.projectRecord(r));

      if (this.isSingle) {
        return resolve({ data: projected[0] || null, count: totalCount, error: null });
      }

      return resolve({ data: projected, count: totalCount, error: null });
    } catch (err) {
      return resolve({ data: null, error: err });
    }
  }
}

function getSeedData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const demoUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  // Password is 'Password123!' (bcrypt hash)
  const passwordHash = '$2a$10$ACdnJOAUnV3GaqaEQu2/i.L7US3.yqSlrk.JIhEvDG2lTK3ckaDPm';

  const dateStr = (daysAgo) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const users = [
    {
      id: demoUserId,
      name: 'Alex Teenager',
      email: 'alex.demo@teentracker.com',
      password_hash: passwordHash,
      currency: '₹',
      monthly_income: 12000,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
      name: 'Alex Rivers',
      email: 'alex@teentracker.com',
      password_hash: passwordHash,
      currency: '₹',
      monthly_income: 12000,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  const income = [
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      source: 'Monthly Pocket Money',
      amount: 8000,
      income_date: dateStr(15),
      description: 'Monthly allowance from parents',
      created_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      source: 'Freelance Tutoring',
      amount: 4000,
      income_date: dateStr(5),
      description: 'Math tutoring junior student',
      created_at: now.toISOString(),
    },
  ];

  const budgets = [
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      category: 'Food',
      amount: 3500,
      month,
      year,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      category: 'Entertainment',
      amount: 2000,
      month,
      year,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      category: 'Transport',
      amount: 1500,
      month,
      year,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      category: 'Education',
      amount: 1200,
      month,
      year,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      category: 'Subscriptions',
      amount: 600,
      month,
      year,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  const expenses = [
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      title: 'School Cafeteria Lunch',
      amount: 280,
      category: 'Food',
      payment_method: 'UPI',
      expense_date: dateStr(1),
      is_necessary: true,
      description: 'Lunch with school friends',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      title: 'Monthly Bus Transit Pass',
      amount: 450,
      category: 'Transport',
      payment_method: 'Cash',
      expense_date: dateStr(3),
      is_necessary: true,
      description: 'Bus transit student pass',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      title: 'Weekend Cinema Tickets',
      amount: 550,
      category: 'Entertainment',
      payment_method: 'Debit Card',
      expense_date: dateStr(4),
      is_necessary: false,
      description: 'Movie night with friends',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      title: 'Coding Handbook & Notebook',
      amount: 699,
      category: 'Education',
      payment_method: 'UPI',
      expense_date: dateStr(6),
      is_necessary: true,
      description: 'Study books and notebook',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      title: 'Spotify Student Premium',
      amount: 199,
      category: 'Subscriptions',
      payment_method: 'Debit Card',
      expense_date: dateStr(8),
      is_necessary: false,
      description: 'Monthly music streaming',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      user_id: demoUserId,
      title: 'Café Cold Coffee & Snack',
      amount: 220,
      category: 'Food',
      payment_method: 'UPI',
      expense_date: dateStr(10),
      is_necessary: false,
      description: 'After-school study treat',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  return { users, expenses, income, budgets };
}

class MockSupabaseClient {
  constructor() {
    this.store = getSeedData();
  }

  from(tableName) {
    return new MockSupabaseQueryBuilder(this.store, tableName);
  }
}

// ==============================================================================
// Client Instantiation
// ==============================================================================
let supabase;

if (isRealSupabaseConfigured()) {
  console.log(`[Database] Initializing live Supabase client connection to ${config.supabaseUrl}`);
  supabase = createClient(config.supabaseUrl, config.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} else {
  console.log(
    '[Database] Supabase credentials not found or placeholder in .env. Initialized In-Memory PostgreSQL Simulation.'
  );
  console.log(
    '[Database] To connect to real Supabase, update SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env'
  );
  supabase = new MockSupabaseClient();
}

module.exports = {
  supabase,
  isRealSupabaseConfigured,
};
