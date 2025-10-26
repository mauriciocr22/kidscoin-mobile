/**
 * Tela para gerenciar tarefas (Parent)
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  List,
  Snackbar,
  Chip,
  Dialog,
  Portal,
  RadioButton,
} from 'react-native-paper';
import { taskService, userService, getErrorMessage } from '../../services';
import { TaskAssignment, TaskCategory, User } from '../../types';
import { COLORS } from '../../utils/constants';

// Categorias disponíveis
const CATEGORIES: { value: TaskCategory; label: string; icon: string }[] = [
  { value: 'LIMPEZA', label: 'Limpeza', icon: 'broom' },
  { value: 'ORGANIZACAO', label: 'Organização', icon: 'package-variant' },
  { value: 'ESTUDOS', label: 'Estudos', icon: 'book-open' },
  { value: 'CUIDADOS', label: 'Cuidados', icon: 'heart' },
  { value: 'OUTRAS', label: 'Outras', icon: 'dots-horizontal' },
];

const ManageTasksScreen: React.FC = () => {
  // Formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coinValue, setCoinValue] = useState('');
  const [xpValue, setXpValue] = useState('');
  const [category, setCategory] = useState<TaskCategory>('LIMPEZA');
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  // Estados
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [children, setChildren] = useState<User[]>([]);
  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog de rejeição
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [rejectingTask, setRejectingTask] = useState<TaskAssignment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadChildren();
    loadTasks();
  }, []);

  /**
   * Carregar crianças da família
   */
  const loadChildren = async () => {
    try {
      const data = await userService.getChildren();
      setChildren(data);
    } catch (err: any) {
      console.error('Erro ao carregar crianças:', err);
    }
  };

  /**
   * Carregar tarefas
   */
  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      console.log('🔄 Carregando tarefas...');
      const data = await taskService.getTasks();
      console.log('✅ Tarefas recebidas:', data.length, 'tarefas');
      console.log('📋 Dados:', JSON.stringify(data, null, 2));
      setTasks(data);
    } catch (err: any) {
      console.error('❌ Erro ao carregar tarefas:', err);
      console.error('Detalhes:', err.response?.data || err.message);
    } finally {
      setLoadingTasks(false);
    }
  };

  /**
   * Validar formulário
   */
  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Preencha o título da tarefa');
      return false;
    }

    const coins = parseInt(coinValue);
    if (isNaN(coins) || coins <= 0) {
      setError('Valor de moedas deve ser maior que zero');
      return false;
    }

    const xp = parseInt(xpValue);
    if (isNaN(xp) || xp <= 0) {
      setError('Valor de XP deve ser maior que zero');
      return false;
    }

    if (selectedChildren.length === 0) {
      setError('Selecione pelo menos uma criança');
      return false;
    }

    return true;
  };

  /**
   * Criar tarefa
   */
  const handleCreateTask = async () => {
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Criando tarefa...');
      const createdTask = await taskService.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        coinValue: parseInt(coinValue),
        xpValue: parseInt(xpValue),
        category,
        childrenIds: selectedChildren,
      });

      console.log('✅ Tarefa criada:', createdTask);
      setSuccess('Tarefa criada com sucesso!');

      // Limpar formulário
      setTitle('');
      setDescription('');
      setCoinValue('');
      setXpValue('');
      setSelectedChildren([]);

      // Recarregar tarefas
      console.log('🔄 Recarregando lista de tarefas...');
      await loadTasks();
    } catch (err: any) {
      console.error('❌ Erro ao criar tarefa:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aprovar tarefa
   */
  const handleApprove = async (assignmentId: string) => {
    try {
      await taskService.approveTask(assignmentId);
      setSuccess('Tarefa aprovada! Moedas e XP creditados.');
      await loadTasks();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  /**
   * Abrir dialog de rejeição
   */
  const openRejectDialog = (task: TaskAssignment) => {
    setRejectingTask(task);
    setRejectionReason('');
    setRejectDialogVisible(true);
  };

  /**
   * Rejeitar tarefa
   */
  const handleReject = async () => {
    if (!rejectingTask || !rejectionReason.trim()) {
      return;
    }

    try {
      await taskService.rejectTask(rejectingTask.id, {
        rejectionReason: rejectionReason.trim(),
      });
      setSuccess('Tarefa rejeitada.');
      setRejectDialogVisible(false);
      setRejectingTask(null);
      await loadTasks();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  /**
   * Toggle criança selecionada
   */
  const toggleChild = (childId: string) => {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  /**
   * Obter cor do status
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return COLORS.common.warning;
      case 'COMPLETED':
        return COLORS.child.primary;
      case 'APPROVED':
        return COLORS.child.success;
      case 'REJECTED':
        return COLORS.common.error;
      default:
        return COLORS.common.textLight;
    }
  };

  /**
   * Obter texto do status
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'COMPLETED':
        return 'Aguardando Aprovação';
      case 'APPROVED':
        return 'Aprovada';
      case 'REJECTED':
        return 'Rejeitada';
      default:
        return status;
    }
  };

  /**
   * Ordenar tarefas - tarefas aguardando aprovação no topo
   */
  const getSortedTasks = () => {
    return [...tasks].sort((a, b) => {
      // Tarefas COMPLETED (aguardando aprovação) vêm primeiro
      if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') {
        return -1;
      }
      if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') {
        return 1;
      }
      // Mantém ordem original para demais tarefas
      return 0;
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Formulário de criar tarefa */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Criar Nova Tarefa</Text>

            <TextInput
              label="Título da Tarefa"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              placeholder="Ex: Arrumar o quarto"
            />

            <TextInput
              label="Descrição (opcional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              placeholder="Ex: Organizar brinquedos e fazer a cama"
            />

            <View style={styles.row}>
              <TextInput
                label="Moedas"
                value={coinValue}
                onChangeText={setCoinValue}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                left={<TextInput.Icon icon="currency-usd" />}
                placeholder="10"
              />

              <TextInput
                label="XP"
                value={xpValue}
                onChangeText={setXpValue}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                left={<TextInput.Icon icon="star" />}
                placeholder="50"
              />
            </View>

            <Text style={styles.label}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.value;
                  return (
                    <Chip
                      key={cat.value}
                      selected={isSelected}
                      onPress={() => setCategory(cat.value)}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                      ]}
                      icon={cat.icon}
                      mode={isSelected ? 'flat' : 'outlined'}
                      textStyle={
                        isSelected ? styles.chipTextSelected : styles.chipTextUnselected
                      }
                    >
                      {cat.label}
                    </Chip>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={styles.label}>Atribuir para</Text>
            {children.length === 0 ? (
              <Text style={styles.emptyText}>
                Cadastre crianças primeiro na aba "Crianças"
              </Text>
            ) : (
              <View style={styles.childrenList}>
                {children.map((child) => {
                  const isSelected = selectedChildren.includes(child.id);
                  return (
                    <Chip
                      key={child.id}
                      selected={isSelected}
                      onPress={() => toggleChild(child.id)}
                      style={[
                        styles.childChip,
                        isSelected && styles.chipSelected,
                      ]}
                      icon="account"
                      mode={isSelected ? 'flat' : 'outlined'}
                      textStyle={
                        isSelected ? styles.chipTextSelected : styles.chipTextUnselected
                      }
                    >
                      {child.fullName}
                    </Chip>
                  );
                })}
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleCreateTask}
              loading={loading}
              disabled={loading || children.length === 0}
              style={styles.createButton}
              buttonColor={COLORS.parent.primary}
              icon="plus"
            >
              Criar Tarefa
            </Button>
          </Card.Content>
        </Card>

        {/* Lista de tarefas */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Tarefas Atribuídas</Text>

            {loadingTasks ? (
              <Text style={styles.emptyText}>Carregando...</Text>
            ) : tasks.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma tarefa criada ainda.</Text>
            ) : (
              <View>
                {getSortedTasks().map((assignment, index) => (
                  <React.Fragment key={assignment.id}>
                    <View style={styles.taskItem}>
                      <View style={styles.taskHeader}>
                        <Text style={styles.taskTitle}>
                          {assignment.task.title}
                        </Text>
                        <Chip
                          style={[
                            styles.statusChip,
                            { backgroundColor: getStatusColor(assignment.status) },
                          ]}
                          textStyle={styles.statusText}
                        >
                          {getStatusText(assignment.status)}
                        </Chip>
                      </View>

                      <Text style={styles.taskChild}>
                        👤 {assignment.childName}
                      </Text>

                      <View style={styles.taskReward}>
                        <Text style={styles.taskRewardText}>
                          💰 {assignment.task.coinValue} moedas
                        </Text>
                        <Text style={styles.taskRewardText}>
                          ⭐ {assignment.task.xpValue} XP
                        </Text>
                      </View>

                      {/* Botões de ação para tarefas COMPLETED */}
                      {assignment.status === 'COMPLETED' && (
                        <View style={styles.actionButtons}>
                          <Button
                            mode="contained"
                            onPress={() => handleApprove(assignment.id)}
                            style={styles.approveButton}
                            buttonColor={COLORS.child.success}
                            icon="check"
                          >
                            Aprovar
                          </Button>
                          <Button
                            mode="outlined"
                            onPress={() => openRejectDialog(assignment)}
                            style={styles.rejectButton}
                            textColor={COLORS.common.error}
                            icon="close"
                          >
                            Rejeitar
                          </Button>
                        </View>
                      )}

                      {/* Mostrar motivo da rejeição */}
                      {assignment.status === 'REJECTED' &&
                        assignment.rejectionReason && (
                          <Text style={styles.rejectionReason}>
                            ❌ Motivo: {assignment.rejectionReason}
                          </Text>
                        )}
                    </View>

                    {index < tasks.length - 1 && <Divider style={styles.divider} />}
                  </React.Fragment>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Dialog de rejeição */}
      <Portal>
        <Dialog visible={rejectDialogVisible} onDismiss={() => setRejectDialogVisible(false)}>
          <Dialog.Title>Rejeitar Tarefa</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Informe o motivo da rejeição para {rejectingTask?.childName}:
            </Text>
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Ex: Não foi feito corretamente"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRejectDialogVisible(false)}>Cancelar</Button>
            <Button
              onPress={handleReject}
              disabled={!rejectionReason.trim()}
              textColor={COLORS.common.error}
            >
              Rejeitar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
        duration={3000}
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
    backgroundColor: COLORS.parent.background,
  },
  content: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
    backgroundColor: COLORS.common.white,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.common.text,
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.common.text,
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  chip: {
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: COLORS.parent.primary,
  },
  chipTextSelected: {
    color: COLORS.common.white,
    fontWeight: '600',
  },
  chipTextUnselected: {
    color: COLORS.common.text,
  },
  childrenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  childChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  createButton: {
    marginTop: 10,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.common.textLight,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  taskItem: {
    paddingVertical: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.common.text,
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.common.white,
  },
  taskChild: {
    fontSize: 14,
    color: COLORS.common.textLight,
    marginBottom: 8,
  },
  taskReward: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 12,
  },
  taskRewardText: {
    fontSize: 14,
    color: COLORS.common.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  approveButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
    borderColor: COLORS.common.error,
  },
  rejectionReason: {
    fontSize: 13,
    color: COLORS.common.error,
    fontStyle: 'italic',
    marginTop: 8,
  },
  divider: {
    marginVertical: 12,
  },
  dialogText: {
    marginBottom: 15,
    color: COLORS.common.text,
  },
  dialogInput: {
    marginTop: 10,
  },
  errorSnackbar: {
    backgroundColor: COLORS.common.error,
  },
  successSnackbar: {
    backgroundColor: COLORS.child.success,
  },
});

export default ManageTasksScreen;
