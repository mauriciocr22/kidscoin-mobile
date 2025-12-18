/**
 * Constantes da aplicação
 */

// URL da API
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Chaves do AsyncStorage
export const STORAGE_KEYS = {
  TOKEN: "@kidscoin:token",
  REFRESH_TOKEN: "@kidscoin:refreshToken",
  USER: "@kidscoin:user",
};

// Cores do tema
export const COLORS = {
  // Para Crianças
  child: {
    primary: "#6366F1",
    secondary: "#EC4899",
    success: "#10B981",
    warning: "#F59E0B",
    background: "#F8FAFC",
  },
  // Para Pais
  parent: {
    primary: "#3B82F6",
    secondary: "#8B5CF6",
    background: "#F8FAFC",
  },
  // Comuns
  common: {
    text: "#1F2937",
    textLight: "#6B7280",
    white: "#FFFFFF",
    error: "#EF4444",
    border: "#E5E7EB",
  },
};

// Categorias de tarefas
export const TASK_CATEGORIES = {
  LIMPEZA: { label: "Limpeza", icon: "broom", color: "#3B82F6" },
  ORGANIZACAO: { label: "Organização", icon: "folder", color: "#8B5CF6" },
  ESTUDOS: { label: "Estudos", icon: "book", color: "#10B981" },
  CUIDADOS: { label: "Cuidados", icon: "heart", color: "#EC4899" },
  OUTRAS: { label: "Outras", icon: "star", color: "#F59E0B" },
};

// Status de tarefas
export const TASK_STATUS = {
  PENDING: { label: "Disponível", color: "#3B82F6" },
  COMPLETED: { label: "Aguardando aprovação", color: "#F59E0B" },
  APPROVED: { label: "Aprovada", color: "#10B981" },
  REJECTED: { label: "Rejeitada", color: "#EF4444" },
};

// Tipos de notificação
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: "Nova tarefa!",
  TASK_COMPLETED: "Tarefa concluída!",
  TASK_APPROVED: "Tarefa aprovada!",
  TASK_REJECTED: "Tarefa rejeitada",
  LEVEL_UP: "Nível aumentado!",
  BADGE_UNLOCKED: "Nova conquista!",
  REDEMPTION_REQUESTED: "Resgate solicitado",
  REDEMPTION_APPROVED: "Resgate aprovado!",
  REDEMPTION_REJECTED: "Resgate rejeitado",
  SAVINGS_DEPOSIT: "Depósito na poupança",
  SAVINGS_WITHDRAWAL: "Saque da poupança",
  SAVINGS_INTEREST: "Rendimento da poupança",
};
