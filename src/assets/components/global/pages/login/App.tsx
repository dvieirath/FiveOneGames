import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// Importações das telas
import LoginScreen from './LoginScreen'; 
import SplashScreen from './SplashScreen'; 
import HomeScreen from './HomeScreen'; 
import FriendsScreen from './FriendsScreen';
import GameLoadingScreen from './GameLoadingScreen'; 
import QuizLoadingScreen from './QuizLoadingScreen';
import MemoryGameScreen from './MemoryGameScreen';   
import QuizGameScreen from './QuizGameScreen'; 

const SPLASH_DURATION = 3000; 
const BACKGROUND_COLOR = '#000000'; 

// Tipos de telas possíveis
// Tipos de telas possíveis
type AppScreen = 'HOME' | 'LOADING_GAME' | 'MEMORY_GAME' | 'QUIZ_GAME' | 'FRIENDS';

const App: React.FC = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [hasError, setHasError] = useState<string | boolean>(false); 
  
  // Estado de Navegação
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('HOME');
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedQuizTheme, setSelectedQuizTheme] = useState<string | null>(null); // Estado para o tema do Quiz

  useEffect(() => {
    let isMounted = true;
    const checkAuthAndHideSplash = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken'); 
        if (token && isMounted) setIsAuthenticated(true);
        await new Promise(resolve => setTimeout(resolve, SPLASH_DURATION)); 
        if (isMounted) setIsSplashVisible(false);
      } catch (e) {
        if (isMounted) setIsSplashVisible(false);
        if (isMounted) setHasError(e instanceof Error ? e.message : 'Erro desconhecido');
      }
    };
    checkAuthAndHideSplash();
    return () => { isMounted = false; };
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
      console.log("Tema selecionado:", theme);
      setSelectedQuizTheme(theme);
      // Força o jogo selecionado para 'Quiz' caso tenha sido perdido
      setSelectedGame('Quiz');
      // Agora sim, mostramos o loading específico do tema
      setCurrentScreen('LOADING_GAME');
  };

  // 3. O Loading termina
  const handleGameLoaded = () => {
      if (selectedGame === 'Jogo da Memória') {
          setCurrentScreen('MEMORY_GAME');
      } else if (selectedGame === 'Quiz') {
          setCurrentScreen('QUIZ_GAME'); // Volta para o Quiz, mas agora com tema selecionado e ativo
      }
  };

  // Voltar para Home
  const handleBackToHome = () => {
      setCurrentScreen('HOME');
      setSelectedGame('');
      setSelectedQuizTheme(null);
  };

  const barStyle = "light-content";

  if (hasError) return <View style={styles.errorContainer}><Text>{typeof hasError === 'string' ? hasError : 'Erro'}</Text></View>;

  if (isSplashVisible) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle={barStyle} backgroundColor={BACKGROUND_COLOR} />
        <SplashScreen isLoading={true} />
      </View>
    );
  }

  const renderContent = () => {
    console.log(`Renderizando tela: ${currentScreen} | Jogo: ${selectedGame} | Tema: ${selectedQuizTheme}`);
    
    switch (currentScreen) {
      case 'HOME':
        return (
          <HomeScreen
            onLogout={handleLogout}
            onGameSelect={handleGameSelect}
            onOpenFriends={() => setCurrentScreen('FRIENDS')}
          />
        );
      case 'FRIENDS':
        return <FriendsScreen onBack={handleBackToHome} />;
      case 'LOADING_GAME':
        if (selectedGame === 'Quiz' || selectedQuizTheme) {
          return (
            <QuizLoadingScreen
              themeName={selectedQuizTheme || 'Geral'}
              onLoadingComplete={handleGameLoaded}
            />
          );
        }
        return (
          <GameLoadingScreen
            gameName={selectedGame}
            onLoadingComplete={handleGameLoaded}
          />
        );
      case 'MEMORY_GAME':
        return <MemoryGameScreen onBack={handleBackToHome} />;
      case 'QUIZ_GAME':
        return (
          <QuizGameScreen
            onBack={handleBackToHome}
            onThemeSelect={handleQuizThemeSelect}
            activeTheme={selectedQuizTheme}
          />
        );
      default:
        return <View style={{flex:1, backgroundColor: 'red'}}><Text>Erro de Estado</Text></View>;
    }
  };

  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        {renderContent()}
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