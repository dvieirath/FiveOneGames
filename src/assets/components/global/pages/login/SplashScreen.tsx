import React from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';

// Definição das cores para manter a consistência do tema GAMING
const colors = {
  primary: '#00BCD4',     // Ciano Elétrico
  background: '#121212',  // Fundo Preto/Dark Blue
  text: '#F5F5F5',        // Texto Claro
};

interface SplashScreenProps {
  // Propriedade para indicar que o carregamento está ativo
  isLoading: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading }) => {
  return (
    <View style={styles.container}>
      {/* Garante que a barra de status combine com o tema escuro */}
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* LOGO (Usando o mesmo caminho local que o LoginScreen.tsx) */}
      <Image 
        // Lembre-se, este caminho é relativo ao local do componente LoginScreen
        source={require('../../../../FiveOneLogo.png')} 
        style={styles.logo}
      />
      
      <Text style={styles.title}>FIVE ONE GAMES</Text>
      
      {/* Indicador de Carregamento animado */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}
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
  logo: {
    width: 200, // Logo maior para a tela de splash
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 2,
    marginBottom: 50,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.primary,
  }
});

export default SplashScreen;