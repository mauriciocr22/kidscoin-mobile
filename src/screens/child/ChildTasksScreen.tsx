/**
 * Tela de tarefas da criança
 */
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  SegmentedButtons,
  Snackbar,
  Text,
} from "react-native-paper";
import { getErrorMessage, taskService } from "../../services";
import { AssignmentStatus, TaskAssignment, TaskCategory } from "../../types";
import { COLORS } from "../../utils/constants";

// Categorias disponíveis
const CATEGORIES: { value: TaskCategory; label: string; icon: string }[] = [
  { value: "LIMPEZA", label: "Limpeza", icon: "broom" },
  { value: "ORGANIZACAO", label: "Organização", icon: "package-variant" },
  { value: "ESTUDOS", label: "Estudos", icon: "book-open" },
  { value: "CUIDADOS", label: "Cuidados", icon: "heart" },
  { value: "OUTRAS", label: "Outras", icon: "dots-horizontal" },
];

const ChildTasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | AssignmentStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, filter, categoryFilter]);

  /**
   * Carregar tarefas
   */
  const loadTasks = async () => {
    setLoading(true);
    try {
      console.log("👶 Criança carregando tarefas...");
      const data = await taskService.getTasks();
      console.log("✅ Tarefas recebidas:", data.length);
      setTasks(data);
    } catch (err: any) {
      console.error("❌ Erro ao carregar tarefas da criança:", err);
      console.error("Detalhes:", err.response?.data);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtrar tarefas
   */
  const filterTasks = () => {
    let result = tasks;

    // Filtrar por status
    if (filter !== "all") {
      result = result.filter((t) => t.status === filter);
    }

    // Filtrar por categoria
    if (categoryFilter) {
      result = result.filter((t) => t.task.category === categoryFilter);
    }

    setFilteredTasks(result);
  };

  /**
   * Completar tarefa
   */
  const handleComplete = async (assignmentId: string) => {
    try {
      await taskService.completeTask(assignmentId);
      setSuccess("Tarefa concluída! Aguarde a aprovação do responsável.");
      await loadTasks();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  /**
   * Refazer tarefa rejeitada
   */
  const handleRetry = async (assignmentId: string) => {
    try {
      await taskService.retryTask(assignmentId);
      setSuccess("Tarefa pronta para refazer! Mostre que você consegue! 💪");
      await loadTasks();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  /**
   * Obter emoji da categoria
   */
  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "LIMPEZA":
        return "🧹";
      case "ORGANIZACAO":
        return "📦";
      case "ESTUDOS":
        return "📚";
      case "CUIDADOS":
        return "❤️";
      default:
        return "✨";
    }
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
        return "⏳ Fazer";
      case "COMPLETED":
        return "⏰ Revisando";
      case "APPROVED":
        return "✅ Aprovada";
      case "REJECTED":
        return "❌ Rejeitada";
      default:
        return status;
    }
  };

  /**
   * Contar tarefas por status
   */
  const countByStatus = (status: AssignmentStatus) => {
    return tasks.filter((t) => t.status === status).length;
  };

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as any)}
          density="small"
          buttons={[
            {
              value: "all",
              label: `Todas (${tasks.length})`,
              style: styles.segmentButton,
            },
            {
              value: "PENDING",
              label: `Fazer (${countByStatus("PENDING")})`,
              style: styles.segmentButton,
            },
            {
              value: "COMPLETED",
              label: `Revisando (${countByStatus("COMPLETED")})`,
              style: styles.segmentButton,
            },
          ]}
        />

        {/* Filtro de categoria */}
        <Text style={styles.filterLabel}>Categoria</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScrollView}
        >
          <View style={styles.categoryChips}>
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
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.emptyText}>Carregando suas tarefas...</Text>
        ) : filteredTasks.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyTitle}>
                {filter === "PENDING"
                  ? "🎉 Parabéns!"
                  : filter === "COMPLETED"
                  ? "⏰ Aguardando aprovação"
                  : "📋 Nenhuma tarefa"}
              </Text>
              <Text style={styles.emptyText}>
                {filter === "PENDING"
                  ? "Você não tem tarefas pendentes!"
                  : filter === "COMPLETED"
                  ? "Nenhuma tarefa aguardando aprovação."
                  : "Você ainda não tem tarefas atribuídas."}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.tasksList}>
            {filteredTasks.map((assignment) => (
              <Card key={assignment.id} style={styles.taskCard}>
                <Card.Content>
                  {/* Cabeçalho */}
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskEmoji}>
                      {getCategoryEmoji(assignment.task.category)}
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

                  {/* Título */}
                  <Text style={styles.taskTitle}>{assignment.task.title}</Text>

                  {/* Descrição */}
                  {assignment.task.description && (
                    <Text style={styles.taskDescription}>
                      {assignment.task.description}
                    </Text>
                  )}

                  {/* Recompensa */}
                  <View style={styles.rewardContainer}>
                    <View style={styles.rewardItem}>
                      <Text style={styles.rewardValue}>
                        {assignment.task.coinValue}
                      </Text>
                      <Text style={styles.rewardLabel}>💰 moedas</Text>
                    </View>
                    <View style={styles.rewardItem}>
                      <Text style={styles.rewardValue}>
                        {assignment.task.xpValue}
                      </Text>
                      <Text style={styles.rewardLabel}>⭐ XP</Text>
                    </View>
                  </View>

                  {/* Botão de ação */}
                  {assignment.status === "PENDING" && (
                    <Button
                      mode="contained"
                      onPress={() => handleComplete(assignment.id)}
                      style={styles.completeButton}
                      buttonColor={COLORS.child.primary}
                      icon="check-circle"
                    >
                      Marcar como Concluída
                    </Button>
                  )}

                  {/* Motivo da rejeição */}
                  {assignment.status === "REJECTED" &&
                    assignment.rejectionReason && (
                      <View style={styles.rejectionContainer}>
                        <Text style={styles.rejectionTitle}>
                          Por que foi rejeitada?
                        </Text>
                        <Text style={styles.rejectionText}>
                          {assignment.rejectionReason}
                        </Text>
                        <Text style={styles.rejectionHint}>
                          💡 Leia o feedback e tente novamente!
                        </Text>
                        <Button
                          mode="contained"
                          onPress={() => handleRetry(assignment.id)}
                          style={styles.retryButton}
                          buttonColor={COLORS.child.secondary}
                          icon="refresh"
                        >
                          Refazer Tarefa
                        </Button>
                      </View>
                    )}
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Snackbars */}
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
    backgroundColor: COLORS.child.background,
  },
  filterContainer: {
    padding: 15,
    backgroundColor: COLORS.common.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.common.border,
  },
  segmentButton: {
    minHeight: 40,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.common.textLight,
    marginTop: 15,
    marginBottom: 8,
  },
  categoryScrollView: {
    marginBottom: 0,
  },
  categoryChips: {
    flexDirection: "row",
  },
  chip: {
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: COLORS.child.primary,
  },
  chipTextSelected: {
    color: COLORS.common.white,
    fontWeight: "600",
  },
  chipTextUnselected: {
    color: COLORS.common.text,
  },
  content: {
    flex: 1,
  },
  tasksList: {
    padding: 15,
  },
  taskCard: {
    marginBottom: 15,
    backgroundColor: COLORS.common.white,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  taskEmoji: {
    fontSize: 32,
  },
  statusChip: {
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: COLORS.common.white,
    fontWeight: "600",
    lineHeight: 14,
    marginVertical: 0,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.common.text,
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: COLORS.common.textLight,
    marginBottom: 15,
    lineHeight: 20,
  },
  rewardContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.child.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  rewardItem: {
    flex: 1,
    alignItems: "center",
  },
  rewardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.child.primary,
    marginBottom: 4,
  },
  rewardLabel: {
    fontSize: 12,
    color: COLORS.common.textLight,
    fontWeight: "600",
  },
  completeButton: {
    marginTop: 5,
  },
  retryButton: {
    marginTop: 12,
  },
  rejectionContainer: {
    backgroundColor: "#FFF5F5",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.common.error,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.common.error,
    marginBottom: 6,
  },
  rejectionText: {
    fontSize: 13,
    color: COLORS.common.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  rejectionHint: {
    fontSize: 12,
    color: COLORS.common.textLight,
    fontStyle: "italic",
  },
  emptyCard: {
    margin: 15,
    backgroundColor: COLORS.common.white,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.common.text,
    textAlign: "center",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.common.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  errorSnackbar: {
    backgroundColor: COLORS.common.error,
  },
  successSnackbar: {
    backgroundColor: COLORS.child.success,
  },
});

export default ChildTasksScreen;
