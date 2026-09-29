import api from './api';

export const incomeService = {
  async getIncomes() {
    const response = await api.get('/income');
    return response.data;
  },

  async createIncome(incomeData) {
    const response = await api.post('/income', incomeData);
    return response.data;
  },

  async updateIncome(id, incomeData) {
    const response = await api.put(`/income/${id}`, incomeData);
    return response.data;
  },

  async deleteIncome(id) {
    const response = await api.delete(`/income/${id}`);
    return response.data;
  },
};

export default incomeService;
