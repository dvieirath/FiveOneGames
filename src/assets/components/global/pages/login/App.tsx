import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import LoginScreen from './LoginScreen'; 
import SplashScreen from './SplashScreen'; 
import HomeScreen from './HomeScreen'; // Importação da tela Home

// Duração da tela de carregamento simulada (3 segundos)
const SPLASH_DURATION = 3000; 
const BACKGROUND_COLOR = '#121212'; 
const TEXT_COLOR = '#F5F5F5'; 

/**
 * Componente principal da aplicação.
 * Controla a transição Splash -> Login/Home com base no estado de autenticação.
 */
const App: React.FC = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de Autenticação
  const [hasError, setHasError] = useState(false); 

  useEffect(() => {
    // Lógica para transição do SPLASH
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, SPLASH_DURATION);
    
    return () => clearTimeout(timer);
  }, []);

  // Função chamada pelo LoginScreen ao fazer login com sucesso
  // ESSA FUNÇÃO FORÇA A MUDANÇA DE TELA
  const handleLoginSuccess = () => {
    console.log("Login Success detected. Switching to HomeScreen.");
    setIsAuthenticated(true);
  };

  // Função chamada pelo HomeScreen ao fazer logout
  const handleLogout = () => {
    console.log("Logout detected. Switching to LoginScreen.");
    setIsAuthenticated(false);
  };

  const barStyle = "light-content";

  if (hasError) {
      return (
          <View style={styles.errorContainer}>
              <StatusBar barStyle={barStyle} backgroundColor={BACKGROUND_COLOR} />
              <Text style={styles.errorText}>Erro Crítico: Não foi possível carregar o aplicativo.</Text>
          </View>
      );
  }

  // Renderização Condicional
  if (isSplashVisible) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle={barStyle} backgroundColor={BACKGROUND_COLOR} />
        <SplashScreen isLoading={true} />
      </View>
    );
  }

  // Se autenticado, renderiza a HOME
  if (isAuthenticated) {
    return (
        <View style={styles.container}>
            <HomeScreen onLogout={handleLogout} /> {/* Passa a função de logout */}
        </View>
    );
  }

  // Se não autenticado (Splash terminou), renderiza o LOGIN
  return (
    <View style={styles.container}>
      <StatusBar barStyle={barStyle} backgroundColor={BACKGROUND_COLOR} />
      {/* Passa a função de sucesso para o LoginScreen */}
      <LoginScreen onLoginSuccess={handleLoginSuccess} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR, 
  },
  splashContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  errorContainer: {
      flex: 1,
      backgroundColor: BACKGROUND_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
  },
  errorText: {
      color: 'red',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
  },
});

export default App;