/**
 * Tela de Login da Criança
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  Snackbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts';
import { COLORS } from '../../utils/constants';

const ChildLoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !pin) {
      setError('Preencha todos os campos');
      return;
    }

    if (pin.length !== 4) {
      setError('O PIN deve ter 4 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn({ emailOrUsername: username, password: pin });
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🎮</Text>
          <Text style={styles.title}>Olá, Criança!</Text>
          <Text style={styles.subtitle}>Digite seu username e PIN para entrar</Text>
        </View>

        <Surface style={styles.card} elevation={4}>
          <TextInput
            label="Username"
            value={username}
            onChangeText={(text) => setUsername(text.toLowerCase())}
            mode="outlined"
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="at" />}
            outlineColor={COLORS.child.primary}
            activeOutlineColor={COLORS.child.primary}
            placeholder="joao_silva"
          />

          <TextInput
            label="PIN (4 dígitos)"
            value={pin}
            onChangeText={(text) => {
              // Apenas números, máximo 4 dígitos
              const numbers = text.replace(/[^0-9]/g, '').slice(0, 4);
              setPin(numbers);
            }}
            mode="outlined"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            outlineColor={COLORS.child.primary}
            activeOutlineColor={COLORS.child.primary}
            placeholder="••••"
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor={COLORS.child.primary}
            contentStyle={styles.buttonContent}
          >
            Entrar 🚀
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            textColor={COLORS.common.textLight}
          >
            Voltar
          </Button>
        </Surface>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Peça ajuda aos seus pais se não conseguir entrar! 👨‍👩‍👧‍👦
          </Text>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.child.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.child.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.common.textLight,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    padding: 25,
    borderRadius: 20,
    backgroundColor: COLORS.common.white,
  },
  input: {
    marginBottom: 20,
    fontSize: 18,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  backButton: {
    marginTop: 10,
  },
  footer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: COLORS.child.secondary + '20',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 16,
    color: COLORS.common.text,
    textAlign: 'center',
  },
});

export default ChildLoginScreen;
