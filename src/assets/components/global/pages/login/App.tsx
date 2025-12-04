import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import LoginScreen from './LoginScreen'; 
import SplashScreen from './SplashScreen'; 
import HomeScreen from './HomeScreen'; 
import GameLoadingScreen from './GameLoadingScreen'; 
import MemoryGameScreen from './MemoryGameScreen';   
import QuizGameScreen from './QuizGameScreen'; // 🔑 Importação da nova tela

const SPLASH_DURATION = 3000; 
const BACKGROUND_COLOR = '#000000'; 

// Tipos de telas possíveis
type AppScreen = 'HOME' | 'LOADING_GAME' | 'MEMORY_GAME' | 'QUIZ_GAME';

const App: React.FC = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [hasError, setHasError] = useState(false); 
  
  // Estado de Navegação
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('HOME');
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedQuizTheme, setSelectedQuizTheme] = useState<string | null>(null); // Estado para o tema do Quiz

  useEffect(() => {
    const checkAuthAndHideSplash = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken'); 
        if (token) setIsAuthenticated(true);
        await new Promise(resolve => setTimeout(resolve, SPLASH_DURATION)); 
        setIsSplashVisible(false);
      } catch (e) {
        setIsSplashVisible(false);
      }
    };
    checkAuthAndHideSplash();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentScreen('HOME');
  };

  const handleLogout = async () => { 
    await AsyncStorage.removeItem('userToken'); 
    setIsAuthenticated(false);
    setCurrentScreen('HOME');
  };

  // 1. Usuário seleciona o jogo na Home
  const handleGameSelect = (gameTitle: string) => {
      if (gameTitle === 'Jogo da Memória') {
          setSelectedGame(gameTitle);
          setCurrentScreen('LOADING_GAME');
      } else if (gameTitle === 'Quiz') {
          // Para o Quiz, vamos direto para a tela de seleção de tema (sem loading ainda)
          setSelectedGame(gameTitle);
          setSelectedQuizTheme(null); // Reseta tema
          setCurrentScreen('QUIZ_GAME');
      } else {
          console.log("Jogo não implementado:", gameTitle);
      }
  };

  // 2. (Apenas Quiz) Usuário seleciona um tema dentro da tela do Quiz
  const handleQuizThemeSelect = (theme: string) => {
      setSelectedQuizTheme(theme);
      // Agora sim, mostramos o loading específico do tema
      setCurrentScreen('LOADING_GAME');
  };

  // 3. O Loading termina
  const handleGameLoaded = () => {
      if (selectedGame === 'Jogo da Memória') {
          setCurrentScreen('MEMORY_GAME');
      } else if (selectedGame === 'Quiz') {
          setCurrentScreen('QUIZ_GAME'); // Volta para o Quiz, mas agora com tema selecionado
      }
  };

  // Voltar para Home
  const handleBackToHome = () => {
      setCurrentScreen('HOME');
      setSelectedGame('');
      setSelectedQuizTheme(null);
  };

  const barStyle = "light-content";

  if (hasError) return <View style={styles.errorContainer}><Text>Erro</Text></View>;

  if (isSplashVisible) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle={barStyle} backgroundColor={BACKGROUND_COLOR} />
        <SplashScreen isLoading={true} />
      </View>
    );
  }

  if (isAuthenticated) {
    return (
        <View style={styles.container}>
            {currentScreen === 'HOME' && (
                <HomeScreen 
                    onLogout={handleLogout} 
                    onGameSelect={handleGameSelect} 
                /> 
            )}
            
            {currentScreen === 'LOADING_GAME' && (
                <GameLoadingScreen 
                    // Mostra o nome do jogo ou "Quiz: Tema"
                    gameName={selectedGame === 'Quiz' && selectedQuizTheme ? `Quiz: ${selectedQuizTheme}` : selectedGame} 
                    onLoadingComplete={handleGameLoaded} 
                />
            )}

            {currentScreen === 'MEMORY_GAME' && (
                <MemoryGameScreen onBack={handleBackToHome} />
            )}

            {currentScreen === 'QUIZ_GAME' && (
                <QuizGameScreen 
                    onBack={handleBackToHome}
                    onThemeSelect={handleQuizThemeSelect} // Função para escolher tema e iniciar loading
                    activeTheme={selectedQuizTheme}       // Passa o tema se já foi escolhido e carregado
                />
            )}
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={barStyle} backgroundColor={BACKGROUND_COLOR} />
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
});

export default App;