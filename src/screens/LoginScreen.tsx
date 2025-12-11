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

import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { supabase } from '../services/supabaseClient';

const LOCAL_LOGO_PATH = require('../assets/FiveOneLogo.png'); 

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

const MIN_PASSWORD_LENGTH = 6; // Supabase exige no mínimo 6 caracteres

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

  // --- LÓGICA DE SUBMISSÃO COM SUPABASE ---
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

    try {
      if (isRegistering) {
        // --- REGISTRO NO SUPABASE ---
        const { data, error } = await supabase.auth.signUp({
          email: identifier,
          password: password,
          options: {
            data: {
              username: username, // Salva o nome de usuário nos metadados
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          setSuccess('Conta criada com sucesso! Faça login.');
          setIsRegistering(false);
          setPassword('');
          setConfirmPassword('');
          // Opcional: Limpar outros campos ou já logar o usuário automaticamente
        }
      } else {
        // --- LOGIN NO SUPABASE ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password: password,
        });

        if (error) throw error;

        if (data.session && data.user) {
          const token = data.session.access_token;
          const userMetadata = data.user.user_metadata;
          const nameToSave = userMetadata?.username || 'Jogador';
          const userId = data.user.id;

          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('userName', nameToSave);
          await AsyncStorage.setItem('userId', userId);

          onLoginSuccess();
        }
      }
    } catch (err: any) {
      console.error("Erro Supabase:", err);
      let errorMessage = 'Ocorreu um erro. Tente novamente.';
      
      if (err.message) {
        if (err.message.includes('Invalid login credentials')) errorMessage = 'E-mail ou senha incorretos.';
        else if (err.message.includes('User already registered')) errorMessage = 'E-mail já cadastrado.';
        else errorMessage = err.message;
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