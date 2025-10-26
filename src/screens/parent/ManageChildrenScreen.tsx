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
    if (isNaN(ageNum) || ageNum < 6 || ageNum > 14) {
      setError('Idade deve estar entre 6 e 14 anos');
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

  return (
    <ScrollView style={styles.container}>
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
              label="Idade (6-14 anos)"
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
                  const username = child.username ||
                    (child.email ? child.email.split('@')[0] : 'usuario');

                  return (
                    <React.Fragment key={child.id}>
                      <List.Item
                        title={child.fullName}
                        description={`@${username}`}
                        left={(props) => <List.Icon {...props} icon="account-child" />}
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
  errorSnackbar: {
    backgroundColor: COLORS.common.error,
  },
  successSnackbar: {
    backgroundColor: COLORS.child.success,
  },
});

export default ManageChildrenScreen;
