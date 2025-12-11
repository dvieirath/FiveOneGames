import React from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';

// NOVAS CORES - LARANJA NEON E PRETO ABSOLUTO
const colors = {
  primary: '#fc4b08',     // Laranja Neon
  background: '#000000',  // Preto Absoluto
  text: '#F5F5F5',        // Texto Claro
};

interface SplashScreenProps {
  isLoading: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <Image 
        source={require('../assets/FiveOneLogo.png')} 
        style={[styles.logo, styles.logoShadow]}
      />
      
      <Text style={[styles.title, styles.textShadow]}>FIVE ONE GAMES</Text>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, styles.textShadow]}>Carregando...</Text>
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
    borderWidth: 2,
    borderColor: colors.primary,
    margin: 10,
    borderRadius: 15,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  // Sombra neon para o logo
  logoShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10, // Para Android
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 2,
    marginBottom: 50,
  },
  // Sombra neon para o texto
  textShadow: {
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
    fontWeight: 'bold',
  }
});

export default SplashScreen;