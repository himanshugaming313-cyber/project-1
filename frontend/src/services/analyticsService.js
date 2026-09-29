import api from './api';

export const analyticsService = {
  async getSummary() {
    const response = await api.get('/analytics/summary');
    return response.data;
  },

  async getCategoryBreakdown(params = {}) {
    const response = await api.get('/analytics/categories', { params });
    return response.data;
  },

  async getMonthlyTrend() {
    const response = await api.get('/analytics/monthly');
    return response.data;
  },

  async getDailySpending(params = {}) {
    const response = await api.get('/analytics/daily', { params });
    return response.data;
  },

  async getComparison(params = {}) {
    const response = await api.get('/analytics/comparison', { params });
    return response.data;
  },

  async getSpendingPatterns() {
    const response = await api.get('/analytics/patterns');
    return response.data;
  },
};

export default analyticsService;
