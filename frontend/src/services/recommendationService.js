import api from './api';

export const recommendationService = {
  async getRecommendations() {
    const response = await api.get('/recommendations');
    return response.data;
  },

  async getFinancialHealth() {
    const response = await api.get('/recommendations/financial-health');
    return response.data;
  },
};

export default recommendationService;
