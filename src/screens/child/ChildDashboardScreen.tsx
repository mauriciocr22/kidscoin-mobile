/**
 * Dashboard da Criança
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ProgressBar, ActivityIndicator, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts';
import { COLORS } from '../../utils/constants';
import { gamificationService, walletService, taskService } from '../../services';
import { Gamification, Wallet, TaskAssignment } from '../../types';

const ChildDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gamification, setGamification] = useState<Gamification | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [pendingTasks, setPendingTasks] = useState<TaskAssignment[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [gamificationData, walletData, tasksData] = await Promise.all([
        gamificationService.getGamification(),
        walletService.getWallet(),
        taskService.getTasks(),
      ]);
      setGamification(gamificationData);
      setWallet(walletData);
      setPendingTasks(tasksData.filter(t => t.status === 'PENDING'));
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Saudação baseada na hora do dia
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Mensagens motivacionais aleatórias
  const getMotivationalMessage = (): string => {
    const messages = [
      'Você está indo muito bem! Continue assim! 🌟',
      'Cada tarefa é uma oportunidade de aprender! 📚',
      'Pequenos passos levam a grandes conquistas! 🚀',
      'Você é capaz de coisas incríveis! ✨',
      'Continue se esforçando, você é demais! 💪',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Progresso do XP (0 a 1)
  const getXpProgress = (): number => {
    if (!gamification) return 0;
    return gamification.currentXp / gamification.xpForNextLevel;
  };

  // Última badge desbloqueada
  const getLastBadge = () => {
    if (!gamification) return null;
    const unlockedBadges = gamification.badges
      .filter(b => b.unlocked)
      .sort((a, b) => {
        if (!a.unlockedAt || !b.unlockedAt) return 0;
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      });
    return unlockedBadges[0] || null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.child.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const lastBadge = getLastBadge();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Cabeçalho com saudação */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Campeão'}! 👋
        </Text>
        <Text style={styles.motivational}>{getMotivationalMessage()}</Text>
      </View>

      {/* Cards principais - Moedas e Nível */}
      <View style={styles.mainCards}>
        {/* Card de Moedas */}
        <Card style={[styles.mainCard, styles.coinsCard]}>
          <Card.Content style={styles.mainCardContent}>
            <MaterialCommunityIcons name="currency-usd" size={40} color="#FFD700" />
            <Text style={styles.mainCardValue}>{wallet?.balance || 0}</Text>
            <Text style={styles.mainCardLabel}>Moedas</Text>
          </Card.Content>
        </Card>

        {/* Card de Nível */}
        <Card style={[styles.mainCard, styles.levelCard]}>
          <Card.Content style={styles.mainCardContent}>
            <MaterialCommunityIcons name="trophy" size={40} color="#FFD700" />
            <Text style={styles.mainCardValue}>Nível {gamification?.currentLevel || 1}</Text>
            <Text style={styles.mainCardLabel}>XP: {gamification?.currentXp || 0}</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Barra de Progresso de XP */}
      {gamification && (
        <Card style={styles.xpCard}>
          <Card.Content>
            <View style={styles.xpHeader}>
              <Text style={styles.xpTitle}>Progresso para Nível {gamification.currentLevel + 1}</Text>
              <Text style={styles.xpValue}>
                {gamification.currentXp}/{gamification.xpForNextLevel}
              </Text>
            </View>
            <ProgressBar
              progress={getXpProgress()}
              color="#4CAF50"
              style={styles.progressBar}
            />
            <Text style={styles.xpNeeded}>
              Faltam {gamification.xpNeededForNextLevel} XP! 🚀
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Tarefas Pendentes */}
      <Card style={styles.tasksCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="format-list-checks" size={24} color={COLORS.child.primary} />
            <Text style={styles.cardTitle}>Tarefas para Fazer</Text>
          </View>

          {pendingTasks.length === 0 ? (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksEmoji}>🎉</Text>
              <Text style={styles.emptyTasksText}>
                Parabéns! Você completou todas as tarefas!
              </Text>
            </View>
          ) : (
            <>
              {pendingTasks.slice(0, 3).map((task) => (
                <View key={task.id} style={styles.taskItem}>
                  <MaterialCommunityIcons
                    name="checkbox-blank-circle"
                    size={12}
                    color={COLORS.child.primary}
                  />
                  <Text style={styles.taskName}>{task.task.title}</Text>
                  <Text style={styles.taskReward}>💰 {task.task.coinValue}</Text>
                </View>
              ))}
              {pendingTasks.length > 3 && (
                <Text style={styles.moreTasks}>
                  + {pendingTasks.length - 3} tarefas...
                </Text>
              )}
            </>
          )}
        </Card.Content>
      </Card>

      {/* Última Conquista */}
      {lastBadge && (
        <Card style={styles.badgeCard}>
          <Card.Content>
            <View style={styles.badgeHeader}>
              <MaterialCommunityIcons name="medal" size={24} color="#FFD700" />
              <Text style={styles.badgeTitle}>Última Conquista</Text>
            </View>
            <View style={styles.badgeContent}>
              <MaterialCommunityIcons
                name={lastBadge.iconName as any}
                size={50}
                color="#FFD700"
              />
              <View style={styles.badgeInfo}>
                <Text style={styles.badgeName}>{lastBadge.name}</Text>
                <Text style={styles.badgeDescription}>{lastBadge.description}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Estatísticas Rápidas */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{wallet?.totalEarned || 0}</Text>
          <Text style={styles.statLabel}>Total Ganho</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{wallet?.totalSpent || 0}</Text>
          <Text style={styles.statLabel}>Total Gasto</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {gamification?.badges.filter(b => b.unlocked).length || 0}
          </Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
      </View>

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
  header: {
    backgroundColor: COLORS.child.primary,
    padding: 20,
    paddingTop: 10,
    paddingBottom: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  motivational: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  mainCards: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -35,
    gap: 12,
  },
  mainCard: {
    flex: 1,
    elevation: 6,
  },
  coinsCard: {
    backgroundColor: '#4CAF50',
  },
  levelCard: {
    backgroundColor: '#FF9800',
  },
  mainCardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  mainCardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  mainCardLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  xpCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    elevation: 3,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  xpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.common.text,
  },
  xpValue: {
    fontSize: 14,
    color: COLORS.common.textLight,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  xpNeeded: {
    fontSize: 13,
    color: '#4CAF50',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  tasksCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.common.text,
    marginLeft: 10,
  },
  emptyTasks: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTasksEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTasksText: {
    fontSize: 14,
    color: COLORS.common.textLight,
    textAlign: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  taskName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.common.text,
    marginLeft: 10,
  },
  taskReward: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.child.primary,
  },
  moreTasks: {
    fontSize: 13,
    color: COLORS.common.textLight,
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  badgeCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFF9C4',
    elevation: 3,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.common.text,
    marginLeft: 10,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.common.text,
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 13,
    color: COLORS.common.textLight,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.child.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.common.textLight,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 30,
  },
});

export default ChildDashboardScreen;
