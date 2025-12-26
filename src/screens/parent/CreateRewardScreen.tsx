/**
 * Tela para criar e gerenciar recompensas (Parent)
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, Divider, List, Portal, Snackbar, Switch, Text, TextInput } from 'react-native-paper';
import { getErrorMessage, rewardService } from '../../services';
import { Redemption, Reward } from '../../types';
import { COLORS } from '../../utils/constants';

const CreateRewardScreen: React.FC = () => {
  // Formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coinCost, setCoinCost] = useState('');

  // Estados
  const [loading, setLoading] = useState(false);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog de rejeição
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [rejectingRedemption, setRejectingRedemption] = useState<Redemption | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadRewards();
    loadRedemptions();
  }, []);

  /**
   * Carregar recompensas
   */
  const loadRewards = async () => {
    setLoadingRewards(true);
    try {
      const data = await rewardService.getRewards();
      setRewards(data);
    } catch (err: any) {
      console.error('Erro ao carregar recompensas:', err);
    } finally {
      setLoadingRewards(false);
    }
  };

  /**
   * Validar formulário
   */
  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Preencha o nome da recompensa');
      return false;
    }

    const cost = parseInt(coinCost);
    if (isNaN(cost) || cost <= 0) {
      setError('Custo deve ser maior que zero');
      return false;
    }

    return true;
  };

  /**
   * Criar recompensa
   */
  const handleCreateReward = async () => {
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await rewardService.createReward({
        name: name.trim(),
        description: description.trim() || undefined,
        coinCost: parseInt(coinCost),
      });

      setSuccess('Recompensa criada com sucesso!');

      // Limpar formulário
      setName('');
      setDescription('');
      setCoinCost('');

      // Recarregar lista
      await loadRewards();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ativar/Desativar recompensa
   */
  const handleToggleReward = async (reward: Reward) => {
    try {
      await rewardService.toggleReward(reward.id);
      setSuccess(reward.isActive ? `${reward.name} foi desativada` : `${reward.name} foi ativada`);
      await loadRewards();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  /**
   * Carregar resgates pendentes
   */
  const loadRedemptions = async () => {
    setLoadingRedemptions(true);
    try {
      const data = await rewardService.getRedemptions('PENDING');
      setRedemptions(data);
    } catch (err: any) {
      console.error('Erro ao carregar resgates:', err);
    } finally {
      setLoadingRedemptions(false);
    }
  };

  /**
   * Aprovar resgate
   */
  const handleApproveRedemption = async (redemptionId: string) => {
    try {
      await rewardService.approveRedemption(redemptionId);
      setSuccess('Resgate aprovado! Moedas debitadas.');
      await loadRedemptions();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  /**
   * Abrir dialog de rejeição
   */
  const openRejectDialog = (redemption: Redemption) => {
    setRejectingRedemption(redemption);
    setRejectionReason('');
    setRejectDialogVisible(true);
  };

  /**
   * Rejeitar resgate
   */
  const handleRejectRedemption = async () => {
    if (!rejectingRedemption || !rejectionReason.trim()) {
      return;
    }

    try {
      await rewardService.rejectRedemption(rejectingRedemption.id, {
        rejectionReason: rejectionReason.trim(),
      });
      setSuccess('Resgate rejeitado.');
      setRejectDialogVisible(false);
      setRejectingRedemption(null);
      await loadRedemptions();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Formulário de criar recompensa */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Criar Nova Recompensa</Text>
              <Text style={styles.cardSubtitle}>Crie recompensas que as crianças podem resgatar com suas moedas</Text>

              <TextInput
                label="Nome da Recompensa"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="gift" />}
                placeholder="Ex: 1 hora de videogame"
              />

              <TextInput
                label="Descrição (opcional)"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
                placeholder="Ex: Pode escolher qualquer jogo"
              />

              <TextInput
                label="Custo em Moedas"
                value={coinCost}
                onChangeText={setCoinCost}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Icon icon="currency-usd" />}
                placeholder="100"
              />

              <Button
                mode="contained"
                onPress={handleCreateReward}
                loading={loading}
                disabled={loading}
                style={styles.createButton}
                buttonColor={COLORS.parent.primary}
                icon="plus"
              >
                Criar Recompensa
              </Button>
            </Card.Content>
          </Card>

          {/* Lista de recompensas */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Recompensas Disponíveis</Text>

              {loadingRewards ? (
                <Text style={styles.emptyText}>Carregando...</Text>
              ) : rewards.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma recompensa criada ainda.</Text>
              ) : (
                <View>
                  {rewards.map((reward, index) => (
                    <React.Fragment key={reward.id}>
                      <View style={styles.rewardItem}>
                        {/* Header: Ícone + Título e Descrição + Indicador de Status */}
                        <View style={styles.rewardHeader}>
                          <View style={styles.rewardIconLarge}>
                            <List.Icon icon="gift" color={COLORS.common.white} size={32} />
                          </View>

                          <View style={styles.rewardContent}>
                            <Text style={[styles.rewardName, !reward.isActive && styles.rewardNameInactive]}>
                              {reward.name}
                            </Text>
                            {reward.description && <Text style={styles.rewardDescription}>{reward.description}</Text>}
                          </View>

                          <View
                            style={[
                              styles.statusIndicator,
                              reward.isActive ? styles.statusIndicatorActive : styles.statusIndicatorInactive,
                            ]}
                          />
                        </View>

                        {/* Bottom Row: Custo + Switch */}
                        <View style={styles.rewardBottomRow}>
                          <View style={styles.costContainer}>
                            <Text style={styles.costIcon}>💰</Text>
                            <Text style={styles.costText}>{reward.coinCost} moedas</Text>
                          </View>

                          <View style={styles.switchContainer}>
                            <Switch
                              value={reward.isActive}
                              onValueChange={() => handleToggleReward(reward)}
                              color={COLORS.child.success}
                            />
                          </View>
                        </View>
                      </View>
                      {index < rewards.length - 1 && <Divider style={styles.rewardDivider} />}
                    </React.Fragment>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Resgates Pendentes */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Resgates Pendentes de Aprovação</Text>

              {loadingRedemptions ? (
                <Text style={styles.emptyText}>Carregando...</Text>
              ) : redemptions.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum resgate aguardando aprovação.</Text>
              ) : (
                <View>
                  {redemptions.map((redemption, index) => (
                    <React.Fragment key={redemption.id}>
                      <View style={styles.redemptionItem}>
                        <View style={styles.redemptionHeader}>
                          <Text style={styles.redemptionReward}>🎁 {redemption.reward.name}</Text>
                          <Text style={styles.redemptionCost}>💰 {redemption.reward.coinCost} moedas</Text>
                        </View>
                        <Text style={styles.redemptionChild}>👤 {redemption.childName}</Text>
                        <Text style={styles.redemptionDate}>
                          📅 Solicitado em {new Date(redemption.requestedAt).toLocaleDateString('pt-BR')}
                        </Text>

                        <View style={styles.redemptionActions}>
                          <Button
                            mode="contained"
                            onPress={() => handleApproveRedemption(redemption.id)}
                            style={styles.approveButton}
                            buttonColor={COLORS.child.success}
                            icon="check"
                          >
                            Aprovar
                          </Button>
                          <Button
                            mode="outlined"
                            onPress={() => openRejectDialog(redemption)}
                            style={styles.rejectButton}
                            textColor={COLORS.common.error}
                            icon="close"
                          >
                            Rejeitar
                          </Button>
                        </View>
                      </View>
                      {index < redemptions.length - 1 && <Divider style={styles.divider} />}
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
        <Dialog visible={rejectDialogVisible} onDismiss={() => setRejectDialogVisible(false)}>
          <Dialog.Title>Rejeitar Resgate</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>Informe o motivo da rejeição para {rejectingRedemption?.childName}:</Text>
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Ex: Não pode jogar videogame hoje"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRejectDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleRejectRedemption} disabled={!rejectionReason.trim()} textColor={COLORS.common.error}>
              Rejeitar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbars - Fora do ScrollView para ficarem fixos */}
      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={3000} style={styles.errorSnackbar}>
        {error}
      </Snackbar>

      <Snackbar visible={!!success} onDismiss={() => setSuccess('')} duration={3000} style={styles.successSnackbar}>
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
    fontWeight: 'bold',
    color: COLORS.common.text,
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.common.textLight,
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
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
  rewardItem: {
    paddingVertical: 16,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rewardIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.parent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rewardContent: {
    flex: 1,
    marginRight: 12,
  },
  rewardName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.common.text,
    marginBottom: 4,
  },
  rewardNameInactive: {
    color: COLORS.common.textLight,
    textDecorationLine: 'line-through',
  },
  rewardDescription: {
    fontSize: 14,
    color: COLORS.common.textLight,
    lineHeight: 20,
  },
  statusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  statusIndicatorActive: {
    backgroundColor: COLORS.child.success,
  },
  statusIndicatorInactive: {
    backgroundColor: COLORS.common.textLight,
  },
  rewardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  costIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  costText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.common.text,
  },
  switchContainer: {
    transform: [{ scale: 1.25 }],
  },
  rewardDivider: {
    marginVertical: 4,
  },
  redemptionItem: {
    paddingVertical: 12,
  },
  redemptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  redemptionReward: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.common.text,
    flex: 1,
  },
  redemptionCost: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.parent.primary,
  },
  redemptionChild: {
    fontSize: 14,
    color: COLORS.common.textLight,
    marginBottom: 4,
  },
  redemptionDate: {
    fontSize: 13,
    color: COLORS.common.textLight,
    marginBottom: 12,
  },
  redemptionActions: {
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

export default CreateRewardScreen;
