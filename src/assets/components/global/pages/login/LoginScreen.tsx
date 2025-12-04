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

// --- ARQUIVO LOCAL: CORREÇÃO DO CAMINHO SOLICITADA ---
// Usando o caminho exato fornecido: '../../../../FiveOneLogo.png'
const LOCAL_LOGO_PATH = require('../../../../FiveOneLogo.png'); 

// Cores do tema GAMING / DARK MODE
const colors = {
  primary: '#00BCD4',     // Ciano Elétrico (Para botões e destaque)
  background: '#121212',  // Fundo Preto/Dark Blue
  text: '#F5F5F5',        // Texto Claro
  inputBackground: '#212121', // Fundo para campos de texto
  secondary: '#FF4081',   // Magenta (Para erros e links secundários)
};

// Dados de teste para simulação de login
const TEST_IDENTIFIER = 'usuario@teste.com';
const TEST_PASSWORD = '123456';

interface LoginScreenProps {
  onLoginSuccess: () => void; // Função para sinalizar login bem-sucedido
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
        duration: 8000, // 8 segundos (lento)
        useNativeDriver: true,
      }),
      { iterations: -1 } 
    ).start();
  }, [spinAnim]);

  const spinY = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // --- LÓGICA SIMULADA DE SUBMISSÃO ---
  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    
    // Validações básicas (requerimento de preenchimento)
    if (!identifier || !password || (isRegistering && (!confirmPassword || !username))) {
        setError(isRegistering ? "Preencha o Nome de Usuário, E-mail e Senhas." : "Preencha o E-mail/Usuário e Senha.");
        return;
    }
    
    setIsLoading(true);

    // Simula atraso de rede (1.5 segundos)
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    if (isRegistering) {
        // REGISTRO SIMULADO
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setIsLoading(false);
            return;
        }
        
        // SUCESSO NO REGISTRO: Mostra mensagem de sucesso e alterna para Login
        setSuccess(`Sucesso! Conta para "${username}" criada. Faça Login.`); 
        setIsRegistering(false); 

    } else {
        // LOGIN SIMULADO
        if (
            (identifier.toLowerCase() === TEST_IDENTIFIER || identifier === '12345678') &&
            password === TEST_PASSWORD
        ) {
            // *** CORREÇÃO FINAL: REMOVEMOS O setIsLoading(false) NO SUCESSO ***
            // 1. Chama a navegação para mudar o estado em App.tsx
            onLoginSuccess();
            
            // 2. RETORNA IMEDIATAMENTE. Isso garante que o componente seja substituído
            // sem causar re-renderizações conflitantes.
            return; 

        } else {
            // Login Falhou
            setError('Credenciais Inválidas. (Dica: A senha de teste é 123456)');
        }
    }
    
    // Este bloco só é alcançado em caso de falha de login/registro simulada
    
    // Limpa campos sensíveis
    setConfirmPassword('');
    setUsername('');
    
    // Garante que o loading seja desligado APENAS EM CASO DE FALHA
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    Alert.alert('Recuperação', 'Redirecionando para recuperação de senha...');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* LOGO ANIMADA */}
        <Animated.Image 
          source={LOCAL_LOGO_PATH} 
          style={[styles.logo, { transform: [{ rotateY: spinY }] }]} 
          resizeMode="contain"
        />
        
        <Text style={styles.subtitle}>
          {isRegistering ? 'CRIAR CONTA' : 'FIVEONEGAMES'}
        </Text>
        
        {/* Mensagens de feedback */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={[styles.errorText, { color: colors.primary }]}>{success}</Text> : null} 
        
        {/* Formulário */}
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
          placeholder="E-mail ou Usuário"
          placeholderTextColor={colors.placeholder}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
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
          style={[styles.button, isLoading && styles.buttonDisabled]} 
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
            // Limpa campos ao alternar
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
  },
  // 2. CORREÇÃO: Ocupar todo o espaço e centralizar o conteúdo (padrão flex)
  container: {
    flex: 1,
    justifyContent: 'center', // Centraliza verticalmente
    paddingHorizontal: 30,
    alignItems: 'center', // Centraliza horizontalmente
  },
  content: {
    // Mantém o conteúdo centralizado e com largura total
    alignItems: 'center', 
    width: '100%',
  },
  logo: { 
    width: 160, 
    height: 160, 
    marginBottom: 30, 
    resizeMode: 'contain',
    transform: [{ perspective: 1000 }],
  },
  subtitle: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
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
    borderColor: '#333', 
  },
  errorText: {
    color: colors.error,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.4,
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