/**
 * Tela para gerenciar tarefas (Parent)
 */
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Portal,
  SegmentedButtons,
  Snackbar,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { getErrorMessage, taskService, userService } from "../../services";
import { RecurrenceType, TaskAssignment, TaskCategory, User } from "../../types";
import { COLORS } from "../../utils/constants";

// Categorias disponíveis
const CATEGORIES: { value: TaskCategory; label: string; icon: string }[] = [
  { value: "LIMPEZA", label: "Limpeza", icon: "broom" },
  { value: "ORGANIZACAO", label: "Organização", icon: "package-variant" },
  { value: "ESTUDOS", label: "Estudos", icon: "book-open" },
  { value: "CUIDADOS", label: "Cuidados", icon: "heart" },
  { value: "OUTRAS", label: "Outras", icon: "dots-horizontal" },
];

// Dias da semana
const WEEKDAYS = [
  { value: 'MON', label: 'Seg' },
  { value: 'TUE', label: 'Ter' },
  { value: 'WED', label: 'Qua' },
  { value: 'THU', label: 'Qui' },
  { value: 'FRI', label: 'Sex' },
  { value: 'SAT', label: 'Sáb' },
  { value: 'SUN', label: 'Dom' },
];

const ManageTasksScreen: React.FC = () => {
  // Formulário
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coinValue, setCoinValue] = useState("");
  const [xpValue, setXpValue] = useState("");
  const [category, setCategory] = useState<TaskCategory>("LIMPEZA");
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  // Recorrência
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('DAILY');
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');

  // Estados
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [children, setChildren] = useState<User[]>([]);
  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | null>(null);

  // Dialog de rejeição
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [rejectingTask, setRejectingTask] = useState<TaskAssignment | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");

  // Dialog de exclusão
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deletingTask, setDeletingTask] = useState<TaskAssignment | null>(null);

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
      console.error("Erro ao carregar crianças:", err);
    }
  };

  /**
   * Carregar tarefas
   */
  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      // console.log('🔄 Carregando tarefas...');
      const data = await taskService.getTasks();
      // console.log('✅ Tarefas recebidas:', data.length, 'tarefas');
      // console.log('📋 Dados:', JSON.stringify(data, null, 2));
      setTasks(data);
    } catch (err: any) {
      console.error("❌ Erro ao carregar tarefas:", err);
      console.error("Detalhes:", err.response?.data || err.message);
    } finally {
      setLoadingTasks(false);
    }
  };

  /**
   * Validar formulário
   */
  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError("Preencha o título da tarefa");
      return false;
    }

    const coins = parseInt(coinValue);
    if (isNaN(coins) || coins <= 0) {
      setError("Valor de moedas deve ser maior que zero");
      return false;
    }

    const xp = parseInt(xpValue);
    if (isNaN(xp) || xp <= 0) {
      setError("Valor de XP deve ser maior que zero");
      return false;
    }

    if (selectedChildren.length === 0) {
      setError("Selecione pelo menos uma criança");
      return false;
    }

    // Validar recorrência
    if (isRecurring && recurrenceType === 'WEEKLY' && selectedWeekdays.length === 0) {
      setError("Selecione pelo menos um dia da semana");
      return false;
    }

    return true;
  };

  /**
   * Criar tarefa
   */
  const handleCreateTask = async () => {
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("📝 Criando tarefa...");
      const createdTask = await taskService.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        coinValue: parseInt(coinValue),
        xpValue: parseInt(xpValue),
        category,
        childrenIds: selectedChildren,
        // Dados de recorrência
        isRecurring: isRecurring || undefined,
        recurrenceType: isRecurring ? recurrenceType : undefined,
        recurrenceDays: isRecurring && recurrenceType === 'WEEKLY'
          ? selectedWeekdays.join(',')
          : undefined,
        recurrenceEndDate: isRecurring && hasEndDate && endDate
          ? endDate
          : undefined,
      });

      console.log("✅ Tarefa criada:", createdTask);
      setSuccess("Tarefa criada com sucesso!");

      // Limpar formulário
      setTitle("");
      setDescription("");
      setCoinValue("");
      setXpValue("");
      setSelectedChildren([]);
      setIsRecurring(false);
      setRecurrenceType('DAILY');
      setSelectedWeekdays([]);
      setHasEndDate(false);
      setEndDate('');

      // Recarregar tarefas
      console.log("🔄 Recarregando lista de tarefas...");
      await loadTasks();
    } catch (err: any) {
      console.error("❌ Erro ao criar tarefa:", err);
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
      setSuccess("Tarefa aprovada! Moedas e XP creditados.");
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
    setRejectionReason("");
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
      setSuccess("Tarefa rejeitada.");
      setRejectDialogVisible(false);
      setRejectingTask(null);
      await loadTasks();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  /**
   * Abrir dialog de exclusão
   */
  const openDeleteDialog = (task: TaskAssignment) => {
    setDeletingTask(task);
    setDeleteDialogVisible(true);
  };

  /**
   * Deletar tarefa
   */
  const handleDelete = async () => {
    if (!deletingTask) {
      return;
    }

    try {
      await taskService.deleteTask(deletingTask.id);
      setSuccess("Tarefa excluída com sucesso.");
      setDeleteDialogVisible(false);
      setDeletingTask(null);
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
   * Toggle dia da semana selecionado
   */
  const toggleWeekday = (day: string) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  /**
   * Obter cor do status
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return COLORS.child.warning;
      case "COMPLETED":
        return COLORS.child.primary;
      case "APPROVED":
        return COLORS.child.success;
      case "REJECTED":
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
      case "PENDING":
        return "Pendente";
      case "COMPLETED":
        return "Aguardando Aprovação";
      case "APPROVED":
        return "Aprovada";
      case "REJECTED":
        return "Rejeitada";
      default:
        return status;
    }
  };

  /**
   * Ordenar tarefas por prioridade de ação
   * 1. COMPLETED (precisa aprovação) - TOPO
   * 2. REJECTED (precisa refazer) - 2º
   * 3. PENDING (aguardando fazer) - 3º
   * 4. APPROVED (já concluída) - FINAL
   */
  const getSortedTasks = () => {
    const priorityMap: { [key: string]: number } = {
      COMPLETED: 1, // Aguardando aprovação do pai
      REJECTED: 2, // Criança precisa refazer
      PENDING: 3, // Ainda não foi feita
      APPROVED: 4, // Já foi tratada
    };

    let filteredTasks = categoryFilter
      ? tasks.filter((t) => t.task.category === categoryFilter)
      : tasks;

    return [...filteredTasks].sort((a, b) => {
      const priorityA = priorityMap[a.status] || 999;
      const priorityB = priorityMap[b.status] || 999;
      return priorityA - priorityB;
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
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
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      icon={cat.icon}
                      mode={isSelected ? "flat" : "outlined"}
                      textStyle={
                        isSelected
                          ? styles.chipTextSelected
                          : styles.chipTextUnselected
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
                      mode={isSelected ? "flat" : "outlined"}
                      textStyle={
                        isSelected
                          ? styles.chipTextSelected
                          : styles.chipTextUnselected
                      }
                    >
                      {child.fullName}
                    </Chip>
                  );
                })}
              </View>
            )}

            {/* Seção de Recorrência */}
            <View style={styles.recurrenceSection}>
              <View style={styles.recurrenceHeader}>
                <Text style={styles.label}>Tarefa Recorrente</Text>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  color={COLORS.parent.primary}
                />
              </View>

              {isRecurring && (
                <View style={styles.recurrenceOptions}>
                  <Text style={styles.sublabel}>Frequência</Text>
                  <SegmentedButtons
                    value={recurrenceType}
                    onValueChange={(value) => setRecurrenceType(value as RecurrenceType)}
                    buttons={[
                      { value: 'DAILY', label: 'Todos os dias' },
                      { value: 'WEEKLY', label: 'Dias específicos' },
                    ]}
                    style={styles.segmentedButtons}
                  />

                  {recurrenceType === 'WEEKLY' && (
                    <View>
                      <Text style={styles.sublabel}>Dias da semana</Text>
                      <View style={styles.weekdaysContainer}>
                        {WEEKDAYS.map((day) => {
                          const isSelected = selectedWeekdays.includes(day.value);
                          return (
                            <Chip
                              key={day.value}
                              selected={isSelected}
                              onPress={() => toggleWeekday(day.value)}
                              style={[
                                styles.weekdayChip,
                                isSelected && styles.chipSelected,
                              ]}
                              mode={isSelected ? "flat" : "outlined"}
                              textStyle={
                                isSelected
                                  ? styles.chipTextSelected
                                  : styles.chipTextUnselected
                              }
                            >
                              {day.label}
                            </Chip>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  <View style={styles.endDateSection}>
                    <View style={styles.recurrenceHeader}>
                      <Text style={styles.sublabel}>Definir data final</Text>
                      <Switch
                        value={hasEndDate}
                        onValueChange={setHasEndDate}
                        color={COLORS.parent.primary}
                      />
                    </View>

                    {hasEndDate && (
                      <TextInput
                        label="Data final (AAAA-MM-DD)"
                        value={endDate}
                        onChangeText={setEndDate}
                        mode="outlined"
                        placeholder="2025-12-31"
                        style={styles.input}
                        left={<TextInput.Icon icon="calendar" />}
                      />
                    )}
                  </View>

                  <Text style={styles.recurrenceHint}>
                    💡 A tarefa será criada automaticamente nos dias configurados
                  </Text>
                </View>
              )}
            </View>

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

            {/* Filtro de categoria */}
            <Text style={styles.label}>Filtrar por categoria</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScrollView}
            >
              <View style={styles.filterChips}>
                <Chip
                  selected={categoryFilter === null}
                  onPress={() => setCategoryFilter(null)}
                  style={[
                    styles.chip,
                    categoryFilter === null && styles.chipSelected,
                  ]}
                  mode={categoryFilter === null ? "flat" : "outlined"}
                  textStyle={
                    categoryFilter === null
                      ? styles.chipTextSelected
                      : styles.chipTextUnselected
                  }
                >
                  Todas
                </Chip>
                {CATEGORIES.map((cat) => {
                  const isSelected = categoryFilter === cat.value;
                  return (
                    <Chip
                      key={cat.value}
                      selected={isSelected}
                      onPress={() => setCategoryFilter(cat.value)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      icon={cat.icon}
                      mode={isSelected ? "flat" : "outlined"}
                      textStyle={
                        isSelected
                          ? styles.chipTextSelected
                          : styles.chipTextUnselected
                      }
                    >
                      {cat.label}
                    </Chip>
                  );
                })}
              </View>
            </ScrollView>

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
                            {
                              backgroundColor: getStatusColor(
                                assignment.status
                              ),
                            },
                          ]}
                          textStyle={styles.statusText}
                        >
                          {getStatusText(assignment.status)}
                        </Chip>
                      </View>

                      {assignment.task.description && (
                        <Text style={styles.taskDescription}>
                          {assignment.task.description}
                        </Text>
                      )}

                      <Text style={styles.taskChild}>
                        👤 {assignment.childName}
                      </Text>

                      <View style={styles.taskRewardRow}>
                        <View style={styles.taskReward}>
                          <Text style={styles.taskRewardText}>
                            💰 {assignment.task.coinValue} moedas
                          </Text>
                          <Text style={styles.taskRewardText}>
                            ⭐ {assignment.task.xpValue} XP
                          </Text>
                        </View>

                        {/* Botão de excluir na mesma linha */}
                        <IconButton
                          icon="delete"
                          iconColor={COLORS.common.error}
                          size={20}
                          onPress={() => openDeleteDialog(assignment)}
                          style={styles.deleteButton}
                        />
                      </View>

                      {/* Botões de ação para tarefas COMPLETED */}
                      {assignment.status === "COMPLETED" && (
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
                      {assignment.status === "REJECTED" &&
                        assignment.rejectionReason && (
                          <Text style={styles.rejectionReason}>
                            ❌ Motivo: {assignment.rejectionReason}
                          </Text>
                        )}
                    </View>

                    {index < tasks.length - 1 && (
                      <Divider style={styles.divider} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
        </View>
      </ScrollView>

      {/* Dialog de rejeição */}
      <Portal>
        <Dialog
          visible={rejectDialogVisible}
          onDismiss={() => setRejectDialogVisible(false)}
        >
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
            <Button onPress={() => setRejectDialogVisible(false)}>
              Cancelar
            </Button>
            <Button
              onPress={handleReject}
              disabled={!rejectionReason.trim()}
              textColor={COLORS.common.error}
            >
              Rejeitar
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog de exclusão */}
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Excluir Tarefa</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Tem certeza que deseja excluir a tarefa "
              {deletingTask?.task.title}"?
            </Text>
            <Text
              style={[
                styles.dialogText,
                { fontSize: 13, color: COLORS.common.textLight },
              ]}
            >
              Esta ação não pode ser desfeita.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Cancelar
            </Button>
            <Button onPress={handleDelete} textColor={COLORS.common.error}>
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbars - Fora do ScrollView para ficarem fixos */}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess("")}
        duration={3000}
        style={styles.successSnackbar}
      >
        {success}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.parent.background,
  },
  scrollView: {
    flex: 1,
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
    fontWeight: "bold",
    color: COLORS.common.text,
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.common.text,
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  filterScrollView: {
    marginBottom: 15,
  },
  filterChips: {
    flexDirection: "row",
  },
  chip: {
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: COLORS.parent.primary,
  },
  chipTextSelected: {
    color: COLORS.common.white,
    fontWeight: "600",
  },
  chipTextUnselected: {
    color: COLORS.common.text,
  },
  childrenList: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  taskItem: {
    paddingVertical: 12,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.common.text,
    flex: 1,
  },
  taskDescription: {
    fontSize: 14,
    color: COLORS.common.textLight,
    marginBottom: 8,
    lineHeight: 20,
  },
  statusChip: {
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: COLORS.common.white,
    lineHeight: 14,
    marginVertical: 0,
  },
  taskChild: {
    fontSize: 14,
    color: COLORS.common.textLight,
    marginBottom: 8,
  },
  taskRewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taskReward: {
    flexDirection: "row",
    gap: 15,
  },
  taskRewardText: {
    fontSize: 14,
    color: COLORS.common.text,
  },
  actionButtons: {
    flexDirection: "row",
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
    fontStyle: "italic",
    marginTop: 8,
  },
  deleteButton: {
    margin: 0,
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
  // Estilos de recorrência
  recurrenceSection: {
    marginTop: 15,
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.common.border,
  },
  recurrenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sublabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.common.text,
    marginTop: 15,
    marginBottom: 10,
  },
  recurrenceOptions: {
    marginTop: 10,
  },
  segmentedButtons: {
    marginBottom: 10,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  weekdayChip: {
    marginBottom: 8,
  },
  endDateSection: {
    marginTop: 10,
  },
  recurrenceHint: {
    fontSize: 12,
    color: COLORS.common.textLight,
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ManageTasksScreen;
