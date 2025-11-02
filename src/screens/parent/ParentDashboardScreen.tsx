/**
 * Dashboard do Pai
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts';
import { COLORS } from '../../utils/constants';
import { userService, taskService, rewardService } from '../../services';
import { User, TaskAssignment, Reward } from '../../types';
import { useNavigation } from '@react-navigation/native';

const ParentDashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState<User[]>([]);
  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [childrenData, tasksData, rewardsData] = await Promise.all([
        userService.getChildren(),
        taskService.getTasks(),
        rewardService.getRewards(),
      ]);
      setChildren(childrenData);
      setTasks(tasksData);
      setRewards(rewardsData);
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

  // Contar tarefas aguardando aprovação
  const getPendingApprovalCount = (): number => {
    return tasks.filter(t => t.status === 'COMPLETED').length;
  };

  // Contar tarefas por status
  const getTasksCountByStatus = (status: string): number => {
    return tasks.filter(t => t.status === status).length;
  };

  // Obter tarefas por criança
  const getTasksByChild = (childId: string) => {
    return tasks.filter(t => t.childId === childId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.parent.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const pendingApprovalCount = getPendingApprovalCount();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.fullName}! 👋</Text>
        <Text style={styles.subtitle}>Painel de Controle da Família</Text>
      </View>

      {/* Alerta de tarefas aguardando aprovação */}
      {pendingApprovalCount > 0 && (
        <Card style={styles.alertCard}>
          <Card.Content style={styles.alertContent}>
            <View style={styles.alertIconContainer}>
              <MaterialCommunityIcons name="alert-circle" size={32} color="#fff" />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>Ação Necessária!</Text>
              <Text style={styles.alertMessage}>
                {pendingApprovalCount} tarefa{pendingApprovalCount > 1 ? 's' : ''} aguardando aprovação
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Tasks' as never)}
              buttonColor="#fff"
              textColor={COLORS.parent.primary}
              compact
            >
              Ver
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Cards de Estatísticas */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="account-group" size={32} color={COLORS.parent.primary} />
            <Text style={styles.statValue}>{children.length}</Text>
            <Text style={styles.statLabel}>Crianças</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="clipboard-list" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Tarefas</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="gift" size={32} color="#FF9800" />
            <Text style={styles.statValue}>{rewards.length}</Text>
            <Text style={styles.statLabel}>Recompensas</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="check-circle" size={32} color="#8BC34A" />
            <Text style={styles.statValue}>{getTasksCountByStatus('APPROVED')}</Text>
            <Text style={styles.statLabel}>Aprovadas</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Resumo por Criança */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-multiple" size={24} color={COLORS.parent.primary} />
            <Text style={styles.cardTitle}>Resumo por Criança</Text>
          </View>

          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-plus" size={48} color={COLORS.common.textLight} />
              <Text style={styles.emptyText}>Nenhuma criança cadastrada</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Children' as never)}
                style={styles.emptyButton}
                buttonColor={COLORS.parent.primary}
                icon="plus"
              >
                Cadastrar Criança
              </Button>
            </View>
          ) : (
            children.map((child) => {
              const childTasks = getTasksByChild(child.id);
              const pending = childTasks.filter(t => t.status === 'PENDING').length;
              const completed = childTasks.filter(t => t.status === 'COMPLETED').length;
              const approved = childTasks.filter(t => t.status === 'APPROVED').length;

              return (
                <View key={child.id} style={styles.childItem}>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.fullName}</Text>
                    <Text style={styles.childUsername}>@{child.username}</Text>
                  </View>
                  <View style={styles.childStats}>
                    {completed > 0 && (
                      <Chip
                        style={styles.childChip}
                        textStyle={styles.childChipText}
                        icon="clock"
                      >
                        {completed}
                      </Chip>
                    )}
                    <Chip
                      style={[styles.childChip, styles.childChipPending]}
                      textStyle={styles.childChipText}
                      icon="clipboard-text"
                    >
                      {pending}
                    </Chip>
                    <Chip
                      style={[styles.childChip, styles.childChipApproved]}
                      textStyle={styles.childChipText}
                      icon="check"
                    >
                      {approved}
                    </Chip>
                  </View>
                </View>
              );
            })
          )}
        </Card.Content>
      </Card>

      {/* Status das Tarefas */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="chart-donut" size={24} color={COLORS.parent.primary} />
            <Text style={styles.cardTitle}>Status das Tarefas</Text>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.child.warning }]} />
              <Text style={styles.statusLabel}>Pendentes</Text>
              <Text style={styles.statusValue}>{getTasksCountByStatus('PENDING')}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.child.primary }]} />
              <Text style={styles.statusLabel}>Aguardando</Text>
              <Text style={styles.statusValue}>{getTasksCountByStatus('COMPLETED')}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.child.success }]} />
              <Text style={styles.statusLabel}>Aprovadas</Text>
              <Text style={styles.statusValue}>{getTasksCountByStatus('APPROVED')}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.common.error }]} />
              <Text style={styles.statusLabel}>Rejeitadas</Text>
              <Text style={styles.statusValue}>{getTasksCountByStatus('REJECTED')}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Atalhos Rápidos */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Atalhos Rápidos</Text>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Tasks' as never)}
              style={styles.quickButton}
              buttonColor={COLORS.parent.primary}
              icon="plus"
            >
              Nova Tarefa
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Rewards' as never)}
              style={styles.quickButton}
              textColor={COLORS.parent.primary}
              icon="gift"
            >
              Nova Recompensa
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Botão de Logout */}
      <Button
        mode="contained"
        onPress={signOut}
        style={styles.logoutButton}
        buttonColor="#f44336"
        icon="logout"
      >
        Sair da Conta
      </Button>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.parent.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.parent.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: COLORS.parent.primary,
    padding: 20,
    paddingTop: 10,
    paddingBottom: 25,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  alertCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.parent.primary,
    elevation: 4,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    color: '#E3F2FD',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 16,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    backgroundColor: '#fff',
    elevation: 3,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.common.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.common.textLight,
    marginTop: 4,
  },
  card: {
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.common.textLight,
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.common.text,
    marginBottom: 4,
  },
  childUsername: {
    fontSize: 13,
    color: COLORS.parent.primary,
  },
  childStats: {
    flexDirection: 'row',
    gap: 6,
  },
  childChip: {
    height: 28,
    backgroundColor: COLORS.child.primary,
  },
  childChipPending: {
    backgroundColor: COLORS.child.warning,
  },
  childChipApproved: {
    backgroundColor: COLORS.child.success,
  },
  childChipText: {
    fontSize: 12,
    color: '#fff',
    marginVertical: 0,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 11,
    color: COLORS.common.textLight,
    marginBottom: 4,
    textAlign: 'center',
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.common.text,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  quickButton: {
    flex: 1,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 6,
  },
  bottomSpacer: {
    height: 30,
  },
});

export default ParentDashboardScreen;
