import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Versão simplificada para debug
const QuizLoadingScreen: React.FC<{ themeName: string; onLoadingComplete: () => void }> = ({ themeName, onLoadingComplete }) => {
  
  useEffect(() => {
    console.log("QuizLoadingScreen MOUNTED - Tema:", themeName);
    const timer = setTimeout(() => {
      console.log("QuizLoadingScreen TIMEOUT - Chamando onLoadingComplete");
      onLoadingComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4c669f" />
      <Text style={styles.text}>Carregando Quiz...</Text>
      <Text style={styles.theme}>{themeName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
  theme: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4c669f',
    marginTop: 10,
  }
});

export default QuizLoadingScreen;