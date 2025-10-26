/**
 * Tela para criar e gerenciar recompensas (Parent)
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  Snackbar,
  Switch,
  List,
  IconButton,
  Dialog,
  Portal,
} from 'react-native-paper';
import { rewardService, getErrorMessage } from '../../services';
import { Reward } from '../../types';
import { COLORS } from '../../utils/constants';

const CreateRewardScreen: React.FC = () => {
  // Formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coinCost, setCoinCost] = useState('');

  // Estados
  const [loading, setLoading] = useState(false);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog de exclusão
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deletingReward, setDeletingReward] = useState<Reward | null>(null);

  useEffect(() => {
    loadRewards();
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
      setSuccess(
        reward.isActive
          ? `${reward.name} foi desativada`
          : `${reward.name} foi ativada`
      );
      await loadRewards();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  /**
   * Abrir dialog de exclusão
   */
  const openDeleteDialog = (reward: Reward) => {
    setDeletingReward(reward);
    setDeleteDialogVisible(true);
  };

  /**
   * Deletar recompensa
   */
  const handleDeleteReward = async () => {
    if (!deletingReward) {
      return;
    }

    try {
      await rewardService.deleteReward(deletingReward.id);
      setSuccess(`${deletingReward.name} foi excluída com sucesso.`);
      setDeleteDialogVisible(false);
      setDeletingReward(null);
      await loadRewards();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Formulário de criar recompensa */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Criar Nova Recompensa</Text>
            <Text style={styles.cardSubtitle}>
              Crie recompensas que as crianças podem resgatar com suas moedas
            </Text>

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
              <Text style={styles.emptyText}>
                Nenhuma recompensa criada ainda.
              </Text>
            ) : (
              <View>
                {rewards.map((reward, index) => (
                  <React.Fragment key={reward.id}>
                    <List.Item
                      title={reward.name}
                      description={
                        reward.description
                          ? `${reward.description} • 💰 ${reward.coinCost} moedas`
                          : `💰 ${reward.coinCost} moedas`
                      }
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon="gift"
                          color={
                            reward.isActive
                              ? COLORS.parent.primary
                              : COLORS.common.textLight
                          }
                        />
                      )}
                      right={(props) => (
                        <View style={styles.rewardRight}>
                          <Text
                            style={[
                              styles.statusText,
                              reward.isActive
                                ? styles.statusActive
                                : styles.statusInactive,
                            ]}
                          >
                            {reward.isActive ? 'Ativa' : 'Inativa'}
                          </Text>
                          <Switch
                            value={reward.isActive}
                            onValueChange={() => handleToggleReward(reward)}
                            color={COLORS.parent.primary}
                          />
                          <IconButton
                            icon="delete"
                            iconColor={COLORS.common.error}
                            size={20}
                            onPress={() => openDeleteDialog(reward)}
                          />
                        </View>
                      )}
                      titleStyle={[
                        styles.rewardName,
                        !reward.isActive && styles.rewardNameInactive,
                      ]}
                      descriptionStyle={styles.rewardDescription}
                    />
                    {index < rewards.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Dialog de exclusão */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Excluir Recompensa</Dialog.Title>
          <Dialog.Content>
            <Text>
              Tem certeza que deseja excluir a recompensa "{deletingReward?.name}"?
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.common.textLight, marginTop: 10 }}>
              Esta ação não pode ser desfeita.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancelar</Button>
            <Button
              onPress={handleDeleteReward}
              textColor={COLORS.common.error}
            >
              Excluir
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
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.common.text,
  },
  rewardNameInactive: {
    color: COLORS.common.textLight,
    textDecorationLine: 'line-through',
  },
  rewardDescription: {
    fontSize: 14,
    color: COLORS.common.textLight,
  },
  rewardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusActive: {
    color: COLORS.child.success,
  },
  statusInactive: {
    color: COLORS.common.textLight,
  },
  errorSnackbar: {
    backgroundColor: COLORS.common.error,
  },
  successSnackbar: {
    backgroundColor: COLORS.child.success,
  },
});

export default CreateRewardScreen;
