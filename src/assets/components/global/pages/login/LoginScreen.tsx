import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ActivityIndicator,
  Animated,
  Alert
} from 'react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { v4 as uuidv4 } from 'uuid';

const LOCAL_LOGO_PATH = require('../../../../FiveOneLogo.png'); 

// 💻 CONFIGURAÇÃO DA API

// Usar variável de ambiente (Expo)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/auth';

// Credenciais de teste (remover em produção)
const TEST_EMAIL = 'admin@teste.com';
const TEST_PASSWORD = '123456';

// Cores do tema GAMING / DARK MODE (ATUALIZADO PARA LARANJA NEON)
const colors = {
  primary: '#fc4b08',     // Laranja Neon
  background: '#000000',  // Preto Absoluto
  text: '#F5F5F5',        // Texto Claro
  inputBackground: '#111111', // Fundo para campos de texto (ligeiramente mais claro)
  secondary: '#FF4081',   // Magenta (Para erros)
  placeholder: '#555555', // Cor mais escura para placeholders
  error: '#FF4081',
};

const MIN_PASSWORD_LENGTH = 5;

interface LoginScreenProps {
  onLoginSuccess: () => void; 
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); 
  const [success, setSuccess] = useState(''); 

  // --- ANIMAÇÃO DA LOGO ---
  const spinAnim = useRef(new Animated.Value(0)).current; 
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1, 
        duration: 8000, 
        useNativeDriver: true,
      }),
      { iterations: -1 } 
    ).start();
  }, [spinAnim]);

  const spinY = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // --- LÓGICA DE SUBMISSÃO HÍBRIDA ---
  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Validação de campos
    if (!identifier || !password || (isRegistering && (!confirmPassword || !username))) {
      setError(isRegistering ? 'Preencha todos os campos.' : 'Preencha E-mail e Senha.');
      return;
    }

    // Validação de email
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    if (!isValidEmail(identifier)) {
      setError('E-mail inválido.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    // Login de teste (bypass backend)
    if (!isRegistering && identifier === TEST_EMAIL && password === TEST_PASSWORD) {
      setIsLoading(true);
      setTimeout(async () => {
        await AsyncStorage.setItem('userToken', 'dummy-test-token');
        await AsyncStorage.setItem('userName', 'Administrador');
        setIsLoading(false);
        onLoginSuccess();
      }, 1000);
      return;
    }

    // Fluxo real (backend)
    let endpoint = isRegistering ? '/register' : '/login';
    let payload: any = { email: identifier, password };
    if (isRegistering) {
      // Gera um ID único para o usuário
      const userId = uuidv4();
      payload = { email: identifier, password, username, userId };
    }

    try {
      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      const { token, username: dbUsername, userId: returnedId } = response.data;
      if (token) {
        await AsyncStorage.setItem('userToken', token);
        const nameToSave = dbUsername || username || 'Jogador';
        await AsyncStorage.setItem('userName', nameToSave);
        // Salva o ID do usuário
        await AsyncStorage.setItem('userId', returnedId || userId);
        if (isRegistering) {
          setSuccess('Conta criada com sucesso!');
          setIsRegistering(false);
          setPassword('');
          setConfirmPassword('');
          setUsername('');
          setIdentifier('');
        } else {
          onLoginSuccess();
        }
        return;
      }
    } catch (err: any) {
      let errorMessage = 'Erro de comunicação. Verifique o backend.';
      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
        if (err.response.status === 401) errorMessage = 'Credenciais inválidas.';
      } else if (err.message && err.message.includes('Network Error')) {
        errorMessage = `Erro de Rede: Backend inacessível em ${API_URL}`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Recuperação', 'Recurso não implementado.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <Animated.Image
          source={LOCAL_LOGO_PATH}
          style={[styles.logo, styles.logoShadow, { transform: [{ rotateY: spinY }] }]}
          resizeMode="contain"
        />

        <Text style={[styles.subtitle, styles.textShadow]}>
          {isRegistering ? 'CRIAR CONTA' : 'FIVEONEGAMES'}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={[styles.successText]}>{success}</Text> : null}

        {isRegistering && (
          <TextInput
            style={styles.input}
            placeholder="Nome de Usuário"
            placeholderTextColor={colors.placeholder}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={colors.placeholder}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder={`Senha (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          autoCapitalize="none"
        />

        {isRegistering && (
          <TextInput
            style={styles.input}
            placeholder="Confirme a Senha"
            placeholderTextColor={colors.placeholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            autoCapitalize="none"
          />
        )}

        {!isRegistering && (
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.buttonShadow, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.buttonText}>
              {isRegistering ? 'CRIAR CONTA' : 'ENTRAR'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setIsRegistering(!isRegistering);
            setError('');
            setSuccess('');
            setConfirmPassword('');
            setPassword('');
            setUsername('');
            setIdentifier('');
          }}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {isRegistering
              ? 'Já tem uma conta? Fazer Login'
              : 'Não tem conta? Cadastre-se agora!'}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 30,
    resizeMode: 'contain',
    transform: [{ perspective: 1000 }],
  },
  logoShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
  },
  subtitle: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  textShadow: {
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.primary + '50',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  errorText: {
    color: colors.error,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  successText: {
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  buttonShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  toggleButton: {
    marginTop: 25,
    padding: 10,
  },
  toggleText: {
    color: colors.text,
    fontSize: 15,
  }
});

export default LoginScreen;