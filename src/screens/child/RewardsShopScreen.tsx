/**
 * Tela da loja de recompensas (Child)
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Button,
  Snackbar,
  Chip,
} from 'react-native-paper';
import { rewardService, walletService, getErrorMessage } from '../../services';
import { Reward } from '../../types';
import { COLORS } from '../../utils/constants';

const RewardsShopScreen: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Carregar recompensas e saldo
   */
  const loadData = async () => {
    try {
      // Carregar recompensas ativas e saldo em paralelo
      const [rewardsData, walletData] = await Promise.all([
        rewardService.getRewards(true), // activeOnly = true
        walletService.getWallet(),
      ]);
      setRewards(rewardsData);
      setBalance(walletData.balance);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  /**
   * Solicitar resgate de recompensa
   */
  const handleRequestRedemption = async (reward: Reward) => {
    setError('');
    setSuccess('');

    // Verificar se tem moedas suficientes
    if (balance < reward.coinCost) {
      setError('Você não tem moedas suficientes! 😢');
      return;
    }

    setLoading(true);

    try {
      await rewardService.requestRedemption({ rewardId: reward.id });
      setSuccess(`🎉 Pedido de "${reward.name}" enviado! Aguarde aprovação.`);
      await loadData(); // Recarregar dados
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verificar se criança tem moedas suficientes
   */
  const hasEnoughCoins = (cost: number) => balance >= cost;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Card de saldo */}
        <Card style={styles.balanceCard}>
          <Card.Content style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>💰 Minhas Moedas</Text>
            <Text style={styles.balanceValue}>{balance}</Text>
          </Card.Content>
        </Card>

        {/* Título */}
        <Text style={styles.title}>🎁 Loja de Recompensas</Text>
        <Text style={styles.subtitle}>
          Troque suas moedas por recompensas incríveis!
        </Text>

        {/* Lista de recompensas */}
        {rewards.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                Ainda não há recompensas disponíveis. 😊
              </Text>
              <Text style={styles.emptySubtext}>
                Peça aos seus pais para criar algumas!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          rewards.map((reward) => {
            const canAfford = hasEnoughCoins(reward.coinCost);
            return (
              <Card key={reward.id} style={styles.rewardCard}>
                <Card.Content>
                  <View style={styles.rewardHeader}>
                    <View style={styles.rewardTitleRow}>
                      <Text style={styles.rewardIcon}>🎁</Text>
                      <Text style={styles.rewardName}>{reward.name}</Text>
                    </View>
                    <Chip
                      style={[
                        styles.costChip,
                        canAfford ? styles.costChipAfford : styles.costChipExpensive,
                      ]}
                      textStyle={styles.costChipText}
                    >
                      💰 {reward.coinCost}
                    </Chip>
                  </View>

                  {reward.description && (
                    <Text style={styles.rewardDescription}>
                      {reward.description}
                    </Text>
                  )}

                  <Button
                    mode="contained"
                    onPress={() => handleRequestRedemption(reward)}
                    disabled={!canAfford || loading}
                    style={styles.redeemButton}
                    buttonColor={
                      canAfford ? COLORS.child.primary : COLORS.common.textLight
                    }
                    icon={canAfford ? 'gift' : 'lock'}
                  >
                    {canAfford ? 'Pedir esta recompensa!' : 'Moedas insuficientes'}
                  </Button>

                  {!canAfford && (
                    <Text style={styles.needMoreText}>
                      Você precisa de mais {reward.coinCost - balance} moedas 💪
                    </Text>
                  )}
                </Card.Content>
              </Card>
            );
          })
        )}
      </View>

      {/* Snackbars */}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={4000}
        style={styles.successSnackbar}
      >
        {success}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.child.background,
  },
  content: {
    padding: 20,
  },
  balanceCard: {
    marginBottom: 20,
    backgroundColor: COLORS.child.primary,
  },
  balanceContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  balanceLabel: {
    fontSize: 18,
    color: COLORS.common.white,
    fontWeight: '600',
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 36,
    color: COLORS.common.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.common.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.common.textLight,
    marginBottom: 20,
  },
  emptyCard: {
    backgroundColor: COLORS.common.white,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.common.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.common.textLight,
    textAlign: 'center',
  },
  rewardCard: {
    marginBottom: 15,
    backgroundColor: COLORS.common.white,
    elevation: 3,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  rewardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rewardIcon: {
    fontSize: 32,
    marginRight: 10,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.common.text,
    flex: 1,
  },
  costChip: {
    marginLeft: 10,
  },
  costChipAfford: {
    backgroundColor: COLORS.child.success,
  },
  costChipExpensive: {
    backgroundColor: COLORS.common.warning,
  },
  costChipText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.common.white,
  },
  rewardDescription: {
    fontSize: 14,
    color: COLORS.common.textLight,
    marginBottom: 15,
    marginLeft: 42, // Alinhado com o título (após o ícone)
  },
  redeemButton: {
    marginTop: 10,
  },
  needMoreText: {
    fontSize: 12,
    color: COLORS.common.warning,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorSnackbar: {
    backgroundColor: COLORS.common.error,
  },
  successSnackbar: {
    backgroundColor: COLORS.child.success,
  },
});

export default RewardsShopScreen;
