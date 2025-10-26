/**
 * Serviço de recompensas
 */
import api from './api';
import {
  Reward,
  Redemption,
  CreateRewardData,
  CreateRedemptionData,
  RejectRedemptionData,
  RedemptionStatus,
} from '../types';

class RewardService {
  /**
   * Listar recompensas
   * @param activeOnly - Se true, retorna apenas ativas (default para CHILD)
   */
  async getRewards(activeOnly?: boolean): Promise<Reward[]> {
    const params = activeOnly !== undefined ? { activeOnly } : {};
    const response = await api.get<Reward[]>('/rewards', { params });
    return response.data;
  }

  /**
   * Criar recompensa (PARENT)
   */
  async createReward(data: CreateRewardData): Promise<Reward> {
    const response = await api.post<Reward>('/rewards', data);
    return response.data;
  }

  /**
   * Ativar/Desativar recompensa (PARENT)
   */
  async toggleReward(rewardId: string): Promise<Reward> {
    const response = await api.patch<Reward>(`/rewards/${rewardId}/toggle`);
    return response.data;
  }

  /**
   * Listar resgates
   * @param status - Filtrar por status (PENDING, APPROVED, REJECTED)
   */
  async getRedemptions(status?: RedemptionStatus): Promise<Redemption[]> {
    const params = status ? { status } : {};
    const response = await api.get<Redemption[]>('/redemptions', { params });
    return response.data;
  }

  /**
   * Solicitar resgate (CHILD)
   */
  async requestRedemption(data: CreateRedemptionData): Promise<Redemption> {
    const response = await api.post<Redemption>('/redemptions', data);
    return response.data;
  }

  /**
   * Aprovar resgate (PARENT)
   */
  async approveRedemption(redemptionId: string): Promise<Redemption> {
    const response = await api.post<Redemption>(
      `/redemptions/${redemptionId}/approve`
    );
    return response.data;
  }

  /**
   * Rejeitar resgate (PARENT)
   */
  async rejectRedemption(
    redemptionId: string,
    data: RejectRedemptionData
  ): Promise<Redemption> {
    const response = await api.post<Redemption>(
      `/redemptions/${redemptionId}/reject`,
      data
    );
    return response.data;
  }

  /**
   * Deletar recompensa (PARENT)
   */
  async deleteReward(rewardId: string): Promise<void> {
    await api.delete(`/rewards/${rewardId}`);
  }
}

export default new RewardService();
