import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Button,
  ProgressBar,
  ActivityIndicator,
  Portal,
  Modal,
  TextInput,
  Chip,
  Snackbar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { walletService } from '../../services';
import { Savings, Wallet } from '../../types';

const SavingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savings, setSavings] = useState<Savings | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  // Modais
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

  // Valores dos modais
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'success' });

  // Meta de poupança (fixo em 500 por enquanto)
  const SAVINGS_GOAL = 500;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [savingsData, walletData] = await Promise.all([
        walletService.getSavings(),
        walletService.getWallet(),
      ]);
      setSavings(savingsData);
      setWallet(walletData);
    } catch (error) {
      console.error('Erro ao carregar dados da poupança:', error);
      showSnackbar('Erro ao carregar dados da poupança', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const showSnackbar = (message: string, type: 'success' | 'error' = 'success') => {
    setSnackbar({ visible: true, message, type });
  };

  // Calcula progresso da meta (0 a 1)
  const getGoalProgress = (): number => {
    if (!savings) return 0;
    return Math.min(savings.balance / SAVINGS_GOAL, 1);
  };

  // Calcula percentual da meta
  const getGoalPercentage = (): number => {
    return Math.round(getGoalProgress() * 100);
  };

  // Calcula dias guardados (dias desde o último depósito)
  const getDaysSaved = (): number => {
    if (!savings?.lastDepositAt) return 0;
    const lastDeposit = new Date(savings.lastDepositAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDeposit.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calcula bônus por tempo
  const getTimeBonus = (): number => {
    const days = getDaysSaved();
    if (days >= 30) return 10;
    if (days >= 7) return 2;
    return 0;
  };

  // Simula rendimento composto
  const simulateInterest = (weeks: number): number => {
    if (!savings) return 0;
    const weeklyRate = 0.02; // 2%
    return Math.round(savings.balance * Math.pow(1 + weeklyRate, weeks) - savings.balance);
  };

  // Depositar
  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount <= 0) {
      showSnackbar('Digite um valor válido', 'error');
      return;
    }
    if (!wallet || amount > wallet.balance) {
      showSnackbar('Saldo insuficiente na carteira', 'error');
      return;
    }

    try {
      const updatedSavings = await walletService.depositSavings(amount);
      setSavings(updatedSavings);
      // Atualiza wallet manualmente
      setWallet({ ...wallet, balance: wallet.balance - amount });
      setDepositModalVisible(false);
      setDepositAmount('');
      showSnackbar(`${amount} moedas depositadas na poupança!`, 'success');
    } catch (error: any) {
      console.error('Erro ao depositar:', error);
      showSnackbar(error.response?.data?.message || 'Erro ao depositar', 'error');
    }
  };

  // Sacar
  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount <= 0) {
      showSnackbar('Digite um valor válido', 'error');
      return;
    }
    if (!savings || amount > savings.balance) {
      showSnackbar('Saldo insuficiente na poupança', 'error');
      return;
    }

    try {
      const updatedSavings = await walletService.withdrawSavings(amount);
      setSavings(updatedSavings);
      // Calcula valor com bônus
      const bonus = Math.round(amount * (getTimeBonus() / 100));
      const totalReceived = amount + bonus;
      // Atualiza wallet manualmente
      if (wallet) {
        setWallet({ ...wallet, balance: wallet.balance + totalReceived });
      }
      setWithdrawModalVisible(false);
      setWithdrawAmount('');
      showSnackbar(
        bonus > 0
          ? `Sacado ${amount} moedas + ${bonus} de bônus!`
          : `${amount} moedas sacadas!`,
        'success'
      );
    } catch (error: any) {
      console.error('Erro ao sacar:', error);
      showSnackbar(error.response?.data?.message || 'Erro ao sacar', 'error');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.child.primary} />
        <Text style={styles.loadingText}>Carregando poupança...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Card Principal - Saldo */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <View style={styles.balanceHeader}>
            <MaterialCommunityIcons name="piggy-bank" size={48} color="#4CAF50" />
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Saldo na Poupança</Text>
              <Text style={styles.balanceValue}>{savings?.balance || 0}</Text>
              <Text style={styles.balanceSubtext}>moedas</Text>
            </View>
          </View>

          {/* Estatísticas */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="cash-plus" size={24} color="#2196F3" />
              <Text style={styles.statValue}>{savings?.totalDeposited || 0}</Text>
              <Text style={styles.statLabel}>Total Depositado</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="trending-up" size={24} color="#FF9800" />
              <Text style={styles.statValue}>{savings?.totalEarned || 0}</Text>
              <Text style={styles.statLabel}>Total Rendido</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Botões de Ação */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          icon="cash-plus"
          onPress={() => setDepositModalVisible(true)}
          style={styles.depositButton}
          buttonColor="#4CAF50"
          contentStyle={styles.buttonContent}
        >
          Depositar
        </Button>
        <Button
          mode="contained"
          icon="cash-minus"
          onPress={() => setWithdrawModalVisible(true)}
          style={styles.withdrawButton}
          buttonColor="#FF9800"
          contentStyle={styles.buttonContent}
        >
          Sacar
        </Button>
      </View>

      {/* Card de Metas */}
      <Card style={styles.goalCard}>
        <Card.Content>
          <View style={styles.goalHeader}>
            <MaterialCommunityIcons name="target" size={32} color="#9C27B0" />
            <Text style={styles.goalTitle}>Meta de Poupança</Text>
          </View>
          <Text style={styles.goalAmount}>
            {savings?.balance || 0} / {SAVINGS_GOAL} moedas
          </Text>
          <ProgressBar
            progress={getGoalProgress()}
            color="#4CAF50"
            style={styles.progressBar}
          />
          <Text style={styles.goalPercentage}>{getGoalPercentage()}% alcançado</Text>
          {getGoalPercentage() >= 100 ? (
            <View style={styles.goalAchieved}>
              <MaterialCommunityIcons name="party-popper" size={32} color="#FFD700" />
              <Text style={styles.goalAchievedText}>
                Parabéns! Você atingiu sua meta! 🎉
              </Text>
            </View>
          ) : (
            <Text style={styles.goalMessage}>
              Faltam {SAVINGS_GOAL - (savings?.balance || 0)} moedas para atingir sua meta!
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Simulador de Rendimento */}
      <Card style={styles.simulatorCard}>
        <Card.Content>
          <View style={styles.simulatorHeader}>
            <MaterialCommunityIcons name="calculator" size={32} color="#00BCD4" />
            <Text style={styles.simulatorTitle}>Quanto vai render?</Text>
          </View>
          <Text style={styles.simulatorSubtitle}>
            Sua poupança rende 2% toda semana! 📈
          </Text>
          <View style={styles.simulationList}>
            <View style={styles.simulationItem}>
              <Text style={styles.simulationPeriod}>Em 1 semana:</Text>
              <Text style={styles.simulationValue}>+{simulateInterest(1)} moedas</Text>
            </View>
            <View style={styles.simulationItem}>
              <Text style={styles.simulationPeriod}>Em 1 mês (4 semanas):</Text>
              <Text style={styles.simulationValue}>+{simulateInterest(4)} moedas</Text>
            </View>
            <View style={styles.simulationItem}>
              <Text style={styles.simulationPeriod}>Em 3 meses (12 semanas):</Text>
              <Text style={styles.simulationValue}>+{simulateInterest(12)} moedas</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Card de Bônus por Tempo */}
      <Card style={styles.bonusCard}>
        <Card.Content>
          <View style={styles.bonusHeader}>
            <MaterialCommunityIcons name="clock-fast" size={32} color="#FF5722" />
            <Text style={styles.bonusTitle}>Bônus por Tempo</Text>
          </View>
          <Text style={styles.bonusSubtitle}>
            Quanto mais tempo guardar, maior o bônus no saque!
          </Text>
          <View style={styles.bonusChips}>
            <Chip
              icon="calendar-week"
              mode="outlined"
              style={[
                styles.bonusChip,
                getDaysSaved() >= 7 && getDaysSaved() < 30 && styles.bonusChipActive,
              ]}
            >
              7 dias: +2%
            </Chip>
            <Chip
              icon="calendar-month"
              mode="outlined"
              style={[
                styles.bonusChip,
                getDaysSaved() >= 30 && styles.bonusChipActive,
              ]}
            >
              30 dias: +10%
            </Chip>
          </View>
          {savings?.lastDepositAt ? (
            <View style={styles.currentBonus}>
              <Text style={styles.currentBonusText}>
                💰 Dias guardados: <Text style={styles.currentBonusBold}>{getDaysSaved()} dias</Text>
              </Text>
              <Text style={styles.currentBonusText}>
                🎁 Bônus atual: <Text style={styles.currentBonusBold}>{getTimeBonus()}%</Text>
              </Text>
            </View>
          ) : (
            <Text style={styles.noBonusText}>Faça um depósito para começar!</Text>
          )}
        </Card.Content>
      </Card>

      {/* Modal de Depósito */}
      <Portal>
        <Modal
          visible={depositModalVisible}
          onDismiss={() => setDepositModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Depositar na Poupança</Text>
          <Text style={styles.modalSubtitle}>
            Saldo disponível: <Text style={styles.modalBalance}>{wallet?.balance || 0} moedas</Text>
          </Text>
          <TextInput
            label="Valor a depositar"
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="number-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
          />
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => {
                setDepositModalVisible(false);
                setDepositAmount('');
              }}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleDeposit}
              style={styles.modalButton}
              buttonColor="#4CAF50"
            >
              Depositar
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Modal de Saque */}
      <Portal>
        <Modal
          visible={withdrawModalVisible}
          onDismiss={() => setWithdrawModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Sacar da Poupança</Text>
          <Text style={styles.modalSubtitle}>
            Saldo na poupança: <Text style={styles.modalBalance}>{savings?.balance || 0} moedas</Text>
          </Text>
          {getTimeBonus() > 0 && (
            <View style={styles.bonusBadge}>
              <MaterialCommunityIcons name="gift" size={20} color="#4CAF50" />
              <Text style={styles.bonusBadgeText}>
                Você vai receber +{getTimeBonus()}% de bônus! 🎁
              </Text>
            </View>
          )}
          <TextInput
            label="Valor a sacar"
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            keyboardType="number-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
          />
          {withdrawAmount && parseInt(withdrawAmount) > 0 && (
            <Text style={styles.withdrawPreview}>
              Você receberá: {parseInt(withdrawAmount) + Math.round(parseInt(withdrawAmount) * (getTimeBonus() / 100))} moedas
            </Text>
          )}
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => {
                setWithdrawModalVisible(false);
                setWithdrawAmount('');
              }}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleWithdraw}
              style={styles.modalButton}
              buttonColor="#FF9800"
            >
              Sacar
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={{
          backgroundColor: snackbar.type === 'success' ? '#4CAF50' : '#f44336',
        }}
      >
        {snackbar.message}
      </Snackbar>

      {/* Espaçamento final */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.child.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.child.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },

  // Card Principal
  balanceCard: {
    margin: 16,
    backgroundColor: '#fff',
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceInfo: {
    marginLeft: 16,
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  balanceSubtext: {
    fontSize: 16,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },

  // Card de Metas
  goalCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  goalAmount: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  goalPercentage: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 8,
  },
  goalMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  goalAchieved: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
  },
  goalAchievedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57F17',
    marginLeft: 8,
    flex: 1,
  },

  // Simulador
  simulatorCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  simulatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  simulatorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  simulatorSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  simulationList: {
    gap: 12,
  },
  simulationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  simulationPeriod: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  simulationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00BCD4',
  },

  // Bônus
  bonusCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bonusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  bonusSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  bonusChips: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  bonusChip: {
    flex: 1,
  },
  bonusChipActive: {
    backgroundColor: '#C8E6C9',
  },
  currentBonus: {
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  currentBonusText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  currentBonusBold: {
    fontWeight: 'bold',
    color: '#FF9800',
  },
  noBonusText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Botões
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  depositButton: {
    flex: 1,
  },
  withdrawButton: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },

  // Modal
  modal: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalBalance: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#C8E6C9',
    borderRadius: 8,
    marginBottom: 16,
  },
  bonusBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
    flex: 1,
  },
  withdrawPreview: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    textAlign: 'center',
    marginBottom: 16,
  },

  bottomSpacer: {
    height: 32,
  },
});

export default SavingsScreen;
