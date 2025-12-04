import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';

// CORES - TEMA LARANJA NEON
const colors = {
  primary: '#fc4b08',     // Laranja Neon
  background: '#000000',  // Preto Absoluto
  text: '#F5F5F5',        // Texto Claro
};

interface GameLoadingScreenProps {
  gameName: string;
  onLoadingComplete: () => void;
}

const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({ gameName, onLoadingComplete }) => {

  useEffect(() => {
    // Simula o carregamento de 2 segundos
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      
      <Text style={styles.loadingText}>Carregando</Text>
      <Text style={[styles.gameTitle, styles.textShadow]}>{gameName.toUpperCase()}</Text>
      
      <View style={styles.barContainer}>
          <View style={styles.barProgress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
      transform: [{ scale: 1.5 }],
      marginBottom: 30,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 50,
    letterSpacing: 1,
    textAlign: 'center',
  },
  textShadow: {
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  // Barra de progresso visual (estática ou animada se desejar complexidade)
  barContainer: {
      width: 200,
      height: 4,
      backgroundColor: '#333',
      borderRadius: 2,
      overflow: 'hidden',
  },
  barProgress: {
      width: '50%', // Apenas visual fixo por enquanto, ou poderia animar
      height: '100%',
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 10,
  }
});

export default GameLoadingScreen;