/**
 * Tela para gerenciar crianças
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  List,
  Snackbar,
  IconButton,
  Dialog,
  Portal,
} from 'react-native-paper';
import { userService, getErrorMessage } from '../../services';
import { User } from '../../types';
import { COLORS } from '../../utils/constants';

const ManageChildrenScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [children, setChildren] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog de exclusão
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deletingChild, setDeletingChild] = useState<User | null>(null);

  // Carregar lista de crianças ao montar componente
  useEffect(() => {
    loadChildren();
  }, []);

  /**
   * Carregar crianças da família
   */
  const loadChildren = async () => {
    setLoadingChildren(true);
    try {
      const data = await userService.getChildren();
      console.log('👶 Crianças carregadas:', JSON.stringify(data, null, 2));
      setChildren(data);
    } catch (err: any) {
      console.error('Erro ao carregar crianças:', err);
    } finally {
      setLoadingChildren(false);
    }
  };

  /**
   * Validar formulário
   */
  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setError('Preencha o nome da criança');
      return false;
    }

    if (!username.trim()) {
      setError('Preencha o username');
      return false;
    }

    if (username.length < 3) {
      setError('Username deve ter pelo menos 3 caracteres');
      return false;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('Username pode conter apenas letras, números, - e _');
      return false;
    }

    if (!age.trim()) {
      setError('Preencha a idade');
      return false;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1) {
      setError('Idade inválida');
      return false;
    }

    if (!pin.trim()) {
      setError('Preencha o PIN');
      return false;
    }

    if (pin.length !== 4) {
      setError('O PIN deve ter 4 dígitos');
      return false;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError('O PIN deve conter apenas números');
      return false;
    }

    return true;
  };

  /**
   * Criar nova criança
   */
  const handleCreateChild = async () => {
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const newChild = await userService.createChild({
        fullName: fullName.trim(),
        username: username.trim(),
        age: parseInt(age),
        pin: pin.trim(),
      });

      setSuccess(
        `${newChild.fullName} foi criado(a)! Use "${username}" para fazer login.`
      );

      // Limpar formulário
      setFullName('');
      setUsername('');
      setAge('');
      setPin('');

      // Recarregar lista
      await loadChildren();
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir dialog de exclusão
   */
  const openDeleteDialog = (child: User) => {
    setDeletingChild(child);
    setDeleteDialogVisible(true);
  };

  /**
   * Deletar criança
   */
  const handleDeleteChild = async () => {
    if (!deletingChild) {
      return;
    }

    try {
      await userService.deleteChild(deletingChild.id);
      setSuccess(`${deletingChild.fullName} foi excluído(a) com sucesso.`);
      setDeleteDialogVisible(false);
      setDeletingChild(null);
      await loadChildren();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
        {/* Formulário de criar criança */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Criar Nova Criança</Text>
            <Text style={styles.cardSubtitle}>
              Cadastre uma criança para sua família
            </Text>

            <TextInput
              label="Nome da Criança"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
              placeholder="Ex: João Silva"
            />

            <TextInput
              label="Username"
              value={username}
              onChangeText={(text) => setUsername(text.toLowerCase())}
              mode="outlined"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="at" />}
              placeholder="Ex: joao_silva"
            />

            <TextInput
              label="Idade"
              value={age}
              onChangeText={setAge}
              mode="outlined"
              keyboardType="numeric"
              maxLength={2}
              style={styles.input}
              left={<TextInput.Icon icon="calendar" />}
              placeholder="Ex: 10"
            />

            <TextInput
              label="PIN (4 dígitos)"
              value={pin}
              onChangeText={setPin}
              mode="outlined"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              placeholder="1234"
            />

            <Text style={styles.helperText}>
              💡 A criança usará o username e o PIN para fazer login
            </Text>

            <Button
              mode="contained"
              onPress={handleCreateChild}
              loading={loading}
              disabled={loading}
              style={styles.createButton}
              buttonColor={COLORS.parent.primary}
              icon="plus"
            >
              Criar Criança
            </Button>
          </Card.Content>
        </Card>

        {/* Lista de crianças */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Crianças Cadastradas</Text>

            {loadingChildren ? (
              <Text style={styles.emptyText}>Carregando...</Text>
            ) : children.length === 0 ? (
              <Text style={styles.emptyText}>
                Nenhuma criança cadastrada ainda.
              </Text>
            ) : (
              <View>
                {children.map((child, index) => {
                  // Extrair username do email se não vier do backend
                  let username = 'sem-username';

                  if (child.username) {
                    // 1. Prioridade: username do backend
                    username = child.username;
                  } else if (child.email) {
                    // 2. Extrai do email (ex: gustavo.rodrigues.xxx@child.local → gustavo.rodrigues.xxx)
                    username = child.email.split('@')[0];
                  }

                  return (
                    <React.Fragment key={child.id}>
                      <List.Item
                        title={child.fullName}
                        description={`@${username}`}
                        left={(props) => <List.Icon {...props} icon="account-child" />}
                        right={(props) => (
                          <IconButton
                            icon="delete"
                            iconColor={COLORS.common.error}
                            size={20}
                            onPress={() => openDeleteDialog(child)}
                          />
                        )}
                        titleStyle={styles.childName}
                        descriptionStyle={styles.childUsername}
                      />
                      {index < children.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </View>
            )}
          </Card.Content>
        </Card>
        </View>
      </ScrollView>

      {/* Dialog de exclusão de criança */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title style={styles.dialogTitle}>⚠️ Excluir Criança</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Tem certeza que deseja excluir <Text style={styles.dialogChildName}>{deletingChild?.fullName}</Text>?
            </Text>
            <Text style={[styles.dialogText, styles.dialogWarning]}>
              ⚠️ ATENÇÃO: Esta é uma ação IRREVERSÍVEL!
            </Text>
            <Text style={styles.dialogWarningList}>
              Será permanentemente excluído:
            </Text>
            <Text style={styles.dialogWarningItem}>• Todas as tarefas atribuídas</Text>
            <Text style={styles.dialogWarningItem}>• Saldo de moedas</Text>
            <Text style={styles.dialogWarningItem}>• Poupança</Text>
            <Text style={styles.dialogWarningItem}>• Badges e conquistas</Text>
            <Text style={styles.dialogWarningItem}>• Histórico completo</Text>
            <Text style={[styles.dialogText, styles.dialogFinalWarning]}>
              Esta ação NÃO pode ser desfeita!
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancelar</Button>
            <Button
              onPress={handleDeleteChild}
              textColor={COLORS.common.error}
              buttonColor="transparent"
            >
              Excluir Permanentemente
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar de erro */}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      {/* Snackbar de sucesso */}
      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
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
  helperText: {
    fontSize: 13,
    color: COLORS.common.textLight,
    marginBottom: 20,
    fontStyle: 'italic',
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
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.common.text,
  },
  childUsername: {
    fontSize: 14,
    color: COLORS.parent.primary,
    fontWeight: '500',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dialogText: {
    fontSize: 14,
    color: COLORS.common.text,
    marginBottom: 10,
  },
  dialogChildName: {
    fontWeight: 'bold',
    color: COLORS.parent.primary,
  },
  dialogWarning: {
    color: COLORS.common.error,
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 15,
  },
  dialogWarningList: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.common.text,
    marginBottom: 8,
  },
  dialogWarningItem: {
    fontSize: 13,
    color: COLORS.common.textLight,
    marginLeft: 10,
    marginBottom: 5,
  },
  dialogFinalWarning: {
    color: COLORS.common.error,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
  errorSnackbar: {
    backgroundColor: COLORS.common.error,
  },
  successSnackbar: {
    backgroundColor: COLORS.child.success,
  },
});

export default ManageChildrenScreen;
