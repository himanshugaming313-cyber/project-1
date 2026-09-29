const request = require('supertest');
const app = require('../src/app');

describe('Teenager Expense Tracker - API Integration Tests', () => {
  let userAToken = '';
  let userAId = '';
  let userBToken = '';
  let userBId = '';
  let testExpenseId = '';

  const userAData = {
    name: 'Alex Teenager',
    email: `alex_${Date.now()}@example.com`,
    password: 'Password123!',
    currency: '₹',
    monthly_income: 12000,
  };

  const userBData = {
    name: 'Jordan Peer',
    email: `jordan_${Date.now()}@example.com`,
    password: 'Password123!',
    currency: '$',
    monthly_income: 500,
  };

  test('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  describe('Authentication Flow', () => {
    test('POST /api/auth/register should register User A', async () => {
      const res = await request(app).post('/api/auth/register').send(userAData);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(userAData.email.toLowerCase());
      expect(res.body.data.user.password_hash).toBeUndefined(); // Never expose hash!

      userAToken = res.body.data.token;
      userAId = res.body.data.user.id;
    });

    test('POST /api/auth/register should register User B', async () => {
      const res = await request(app).post('/api/auth/register').send(userBData);
      expect(res.statusCode).toBe(201);
      userBToken = res.body.data.token;
      userBId = res.body.data.user.id;
    });

    test('POST /api/auth/register should fail on duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send(userAData);
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test('POST /api/auth/login should log in User A with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: userAData.email,
        password: userAData.password,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    test('POST /api/auth/login should reject invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: userAData.email,
        password: 'WrongPassword!',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/auth/me should return current user profile with token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.name).toBe(userAData.name);
    });

    test('GET /api/auth/me without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Expenses CRUD & User Isolation', () => {
    test('POST /api/expenses should create an expense for User A', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Movie Tickets with Friends',
          amount: 450,
          category: 'Entertainment',
          payment_method: 'UPI',
          expense_date: '2026-09-20',
          is_necessary: false,
          description: 'Weekend cinema outing',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.expense.title).toBe('Movie Tickets with Friends');
      expect(res.body.data.expense.amount).toBe(450);

      testExpenseId = res.body.data.expense.id;
    });

    test('POST /api/expenses should create essential expense for User A', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Math Study Book',
          amount: 800,
          category: 'Education',
          payment_method: 'Debit Card',
          expense_date: '2026-09-22',
          is_necessary: true,
        });

      expect(res.statusCode).toBe(201);
    });

    test('GET /api/expenses should return User A expenses with pagination', async () => {
      const res = await request(app)
        .get('/api/expenses?page=1&limit=10')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.pagination).toBeDefined();
    });

    test('SECURITY: User B CANNOT access User A expense by ID', async () => {
      const res = await request(app)
        .get(`/api/expenses/${testExpenseId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('SECURITY: User B CANNOT update or delete User A expense', async () => {
      const resUpdate = await request(app)
        .put(`/api/expenses/${testExpenseId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'Hacked Title', amount: 9999, category: 'Food' });

      expect(resUpdate.statusCode).toBe(404);

      const resDelete = await request(app)
        .delete(`/api/expenses/${testExpenseId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(resDelete.statusCode).toBe(404);
    });

    test('PUT /api/expenses/:id should allow User A to update their own expense', async () => {
      const res = await request(app)
        .put(`/api/expenses/${testExpenseId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Movie Tickets (IMAX)',
          amount: 500,
          category: 'Entertainment',
          is_necessary: false,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.expense.title).toBe('Movie Tickets (IMAX)');
      expect(res.body.data.expense.amount).toBe(500);
    });
  });

  describe('Income CRUD', () => {
    test('POST /api/income should create income entry', async () => {
      const res = await request(app)
        .post('/api/income')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          source: 'Allowance',
          amount: 8000,
          income_date: '2026-09-01',
          description: 'Monthly pocket money',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.income.source).toBe('Allowance');
      expect(res.body.data.income.amount).toBe(8000);
    });
  });

  describe('Budgets and Status', () => {
    test('POST /api/budgets should create a budget', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          category: 'Entertainment',
          amount: 600,
          month: 9,
          year: 2026,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.budget.category).toBe('Entertainment');
    });

    test('GET /api/budgets/status should calculate spent vs budget with warning', async () => {
      const res = await request(app)
        .get('/api/budgets/status?month=9&year=2026')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.budgets).toBeDefined();
      const entBudget = res.body.data.budgets.find((b) => b.category === 'Entertainment');
      expect(entBudget).toBeDefined();
      expect(entBudget.spent).toBe(500);
      expect(entBudget.percentageUsed).toBeGreaterThan(80);
      expect(entBudget.status).toBe('warning'); // 500 / 600 = 83.33% => warning!
    });
  });

  describe('Analytics & Recommendations Engine', () => {
    test('GET /api/analytics/summary should calculate monthly metrics', async () => {
      const res = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalIncome).toBeGreaterThan(0);
      expect(res.body.data.totalExpenses).toBeGreaterThan(0);
      expect(res.body.data.savings).toBeDefined();
    });

    test('GET /api/recommendations should return data-driven insights', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.recommendations).toBeInstanceOf(Array);
      expect(res.body.data.insights).toBeDefined();
      expect(res.body.data.insights.spendingInsight).toBeDefined();
    });

    test('GET /api/recommendations/financial-health should return educational score (0-100)', async () => {
      const res = await request(app)
        .get('/api/recommendations/financial-health')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.score).toBeGreaterThanOrEqual(0);
      expect(res.body.data.score).toBeLessThanOrEqual(100);
      expect(res.body.data.disclaimer).toBeDefined();
    });
  });
});
