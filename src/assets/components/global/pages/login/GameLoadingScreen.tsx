import React, { useEffect } from 'react';
import { useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';

// CORES - TEMA CLEAN
const colors = {
  primary: '#000000',     // Preto
  background: '#FFFFFF',  // Branco Sólido
  text: '#000000',        // Texto Preto
};

interface GameLoadingScreenProps {
  gameName: string;
  onLoadingComplete: () => void;
}

const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({ gameName, onLoadingComplete }) => {

  // Animação de pulo (Bounce)
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -150, // Sobe
          duration: 600,
          easing: Easing.out(Easing.quad), // Desacelera na subida
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0, // Desce
          duration: 600,
          easing: Easing.in(Easing.quad), // Acelera na descida (gravidade)
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Simula o carregamento de 2 segundos
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 2500); // Um pouco mais de tempo para apreciar a animação

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.animationContainer}>
        <Animated.View
          style={[
            styles.ball,
            {
              transform: [{ translateY: bounceAnim }],
            }
          ]}
        >
          {/* Opcional: Ícone de bola de futebol dentro da bolinha */}
          <Ionicons name="football" size={40} color="white" />
        </Animated.View>
        
        {/* Sombra da bola */}
        <Animated.View 
          style={[
            styles.shadow,
            {
              opacity: bounceAnim.interpolate({
                inputRange: [-150, 0],
                outputRange: [0.2, 0.8], // Sombra fica mais forte quando a bola está perto
              }),
              transform: [
                {
                  scale: bounceAnim.interpolate({
                    inputRange: [-150, 0],
                    outputRange: [0.5, 1], // Sombra diminui quando a bola sobe
                  })
                }
              ]
            }
          ]} 
        />
      </View>

      <Text style={styles.loadingText}>Carregando</Text>
      <Text style={styles.gameTitle}>{gameName.toUpperCase()}</Text>
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
  animationContainer: {
    height: 200,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 50,
  },
  ball: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  shadow: {
    width: 60,
    height: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: 10,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 1,
  },
  textShadow: {
    // Removido shadow para look clean
  },
  // Removidos estilos não usados (spinner, barProgress, etc)
});
export default GameLoadingScreen;