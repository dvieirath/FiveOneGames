import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  Dimensions, 
  ScrollView, 
  Modal, // Importamos Modal para o feedback customizado
  Image,
  ImageBackground,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Habilita LayoutAnimation no Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// CORES - TEMA DARK (PRETO)
const colors = {
  primary: '#FFFFFF',     // Branco (para contraste com fundo escuro)
  background: '#000000',  // Preto
  text: '#FFFFFF',        // Texto Branco
  cardBack: '#000000',    // Fundo da carta virada (Preto)
  cardFront: '#FFFFFF',   // Fundo da carta aberta
  success: '#4CAF50',     // Verde Suave
  danger: '#F44336',      // Vermelho Suave
  overlay: 'rgba(0,0,0,0.8)', // Overlay escuro
};

// Imagens do Neymar para o jogo
const IMAGES = [
  require('../assets/images/Neymar/1.png'),
  require('../assets/images/Neymar/2.png'),
  require('../assets/images/Neymar/3.png'),
  require('../assets/images/Neymar/4.png'),
  require('../assets/images/Neymar/5.png'),
  require('../assets/images/Neymar/6.png'),
  require('../assets/images/Neymar/7.png'),
  require('../assets/images/Neymar/8.png'),
  require('../assets/images/Neymar/9.png'),
  require('../assets/images/Neymar/10.png'),
];

// Função de Embaralhamento (Fisher-Yates)
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

interface Card {
  id: string;
  image: any; // Mudado de icon (string) para image (any/require)
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameScreenProps {
  onBack: () => void;
}

interface MemoryCardProps {
  card: Card;
  onPress: (card: Card) => void;
  width: number | string;
  height: number | string;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ card, onPress, width, height }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (card.isFlipped || card.isMatched) {
      Animated.spring(animatedValue, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [card.isFlipped, card.isMatched]);

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => onPress(card)}
      style={{ width, height }} // Removed margin from here
    >
      <View style={{ flex: 1 }}>
        {/* Lado da frente (Capa / Bola) - Inicialmente visível */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFace,
            frontAnimatedStyle,
            { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }
          ]}
        >
           <Ionicons name="football" size={32} color={colors.primary} />
        </Animated.View>

        {/* Lado de trás (Imagem do Neymar) - Inicialmente escondido */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFace,
            styles.cardFlipped,
            backAnimatedStyle,
            { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }
          ]}
        >
           <Image 
              source={card.image} 
              style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 8 }} 
            />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const MemoryGameScreen: React.FC<MemoryGameScreenProps> = ({ onBack }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [level, setLevel] = useState(1);
  const [totalTime, setTotalTime] = useState(0); // Tempo total acumulado
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moves, setMoves] = useState(0);
  
  // Estados de controle do jogo
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false); 
  const [isGathered, setIsGathered] = useState(false); // Estado para animação de juntar cartas
  
  // Estados para o cronômetro
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

    // Trilha sonora
    useEffect(() => {
      let soundObject: Audio.Sound | null = null;

      const playMusic = async () => {
        try {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
          });

          const { sound } = await Audio.Sound.createAsync(
            require('../assets/sounds/memory-theme.mp3'),
            { isLooping: true, volume: 0.3 }
          );
          
          soundObject = sound;
          setSound(sound);
          await sound.playAsync();
        } catch (e) {
          console.log('Erro ao carregar som:', e);
        }
      };

      playMusic();

      return () => {
        if (soundObject) {
          soundObject.stopAsync();
          soundObject.unloadAsync();
        }
      };
    }, []);

  // Configuração dos níveis
  const getLevelConfig = (lvl: number) => {
    const timeLimit = 120 - ((lvl - 1) * 10); 
    switch(lvl) {
      case 1: return { pairs: 3, cols: 3, time: timeLimit };  // 60s
      case 2: return { pairs: 6, cols: 3, time: timeLimit };  // 50s
      case 3: return { pairs: 8, cols: 4, time: timeLimit };  // 40s
      case 4: return { pairs: 10, cols: 4, time: timeLimit }; // 30s
      case 5: return { pairs: 12, cols: 4, time: timeLimit }; // 20s
      default: return { pairs: 3, cols: 3, time: 60 };
    }
  };

  useEffect(() => {
    startNewGame();
  }, [level]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerActive && timeLeft > 0 && !gameWon) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive && !gameWon) {
      setIsTimerActive(false);
      setGameOver(true); 
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, gameWon]);

  const startNewGame = () => {
    if (level === 1) setTotalTime(0); // Reseta tempo total no início

    const config = getLevelConfig(level);
    // Seleciona imagens aleatórias e embaralha
    const selectedImages = shuffleArray([...IMAGES]).slice(0, config.pairs);
    
    const gameCards = [...selectedImages, ...selectedImages].map((image, index) => ({
      id: `card-${index}`, 
      image,
      isFlipped: true, // Começa virada para cima (Preview)
      isMatched: false,
    }));

    setCards(shuffleArray(gameCards)); // Mostra as cartas inicialmente (pode ser embaralhado ou não)
    setMoves(0);
    setGameWon(false);
    setGameOver(false); 
    setSelectedCards([]);
    setIsProcessing(true); // Bloqueia interação durante preview
    setTimeLeft(config.time);
    setIsTimerActive(false);

    // Preview de 2 segundos antes de começar
    setTimeout(() => {
        // 1. Vira as cartas para baixo
        setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
        
        // 2. Aguarda a animação de virar terminar (1.5s)
        setTimeout(() => {
            // 3. Junta as cartas no centro (Efeito de embaralhar)
            LayoutAnimation.configureNext({
                duration: 2000, // 2 segundos para juntar (Bem lento)
                update: { type: LayoutAnimation.Types.easeInEaseOut },
            });
            setIsGathered(true);

            // 4. Aguarda elas ficarem juntas (2.5s), embaralha os dados e espalha novamente
            setTimeout(() => {
                setCards(prev => shuffleArray([...prev]));
                
                LayoutAnimation.configureNext({
                    duration: 2000, // 2 segundos para espalhar (Bem lento)
                    create: { type: LayoutAnimation.Types.spring, property: LayoutAnimation.Properties.scaleXY, springDamping: 0.9 }, // Damping alto para menos balanço e mais suavidade
                    update: { type: LayoutAnimation.Types.spring, springDamping: 0.9 },
                });
                
                setIsGathered(false); // Espalha as cartas
                
                setIsProcessing(false); // Libera o jogo
                setIsTimerActive(true); // Inicia o tempo
            }, 2500); // Tempo parado no centro
        }, 1500); 
    }, 2000);
  };

  const handleCardPress = (card: Card) => {
    if (isProcessing || card.isFlipped || card.isMatched || !isTimerActive) return;

    const newCards = cards.map(c => 
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsProcessing(true);
      setMoves(prev => prev + 1);
      checkForMatch(newSelected, newCards);
    }
  };

  const checkForMatch = (selected: Card[], currentCards: Card[]) => {
    const [card1, card2] = selected;

    if (card1.image === card2.image) {
      setTimeout(() => {
        const matchedCards = currentCards.map(c => 
          c.image === card1.image ? { ...c, isMatched: true } : c
        );
        setCards(matchedCards);
        setSelectedCards([]);
        setIsProcessing(false);
        checkWinCondition(matchedCards);
      }, 500);
    } else {
      setTimeout(() => {
        const resetCards = currentCards.map(c => 
          c.id === card1.id || c.id === card2.id ? { ...c, isFlipped: false } : c
        );
        setCards(resetCards);
        setSelectedCards([]);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const checkWinCondition = (currentCards: Card[]) => {
    if (currentCards.every(c => c.isMatched)) {
      setGameWon(true);
      setIsTimerActive(false);
      // Não usamos mais Alert aqui, o Modal será renderizado baseado no estado gameWon
    }
  };

  const handleNextLevel = () => {
      const timeTaken = getLevelConfig(level).time - timeLeft;
      setTotalTime(prev => prev + timeTaken);

      if (level < 5) {
          setLevel(l => l + 1);
      } else {
          onBack(); // Volta para o menu se acabou o jogo
      }
  };

  const config = getLevelConfig(level);
  const cardSize = (width - 60) / config.cols; 

  const formatTime = (seconds: number) => `${seconds}s`;

  return (
    <ImageBackground 
      source={require('../assets/images/campo.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Overlay para melhorar contraste */}
      <View style={styles.bgOverlay} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, styles.neonText]}>JOGO DA MEMÓRIA</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* INFO DO JOGO */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
            <Ionicons name="trophy-outline" size={24} color="#ccc" style={{ marginBottom: 4 }} />
            <Text style={styles.statValue}>{level}</Text>
        </View>
        <View style={[styles.statBox, styles.timerBox]}>
            <Ionicons name="timer-outline" size={24} color="#ccc" style={{ marginBottom: 4 }} />
            <Text style={[styles.statValue, timeLeft <= 10 ? { color: colors.danger } : {}]}>
                {formatTime(timeLeft)}
            </Text>
        </View>
        <View style={styles.statBox}>
            <Ionicons name="footsteps-outline" size={24} color="#ccc" style={{ marginBottom: 4 }} />
            <Text style={styles.statValue}>{moves}</Text>
        </View>
      </View>

      {/* BARRA DE TEMPO VISUAL */}
      <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${(timeLeft / config.time) * 100}%`,
                backgroundColor: timeLeft <= 10 ? colors.danger : colors.success 
              }
            ]} 
          />
      </View>

      {/* REINICIAR */}
      <TouchableOpacity style={styles.restartButton} onPress={startNewGame}>
          <Ionicons name="refresh" size={16} color="#888" />
          <Text style={styles.restartText}>Reiniciar Fase</Text>
      </TouchableOpacity>

      {/* TABULEIRO */}
      <ScrollView contentContainerStyle={styles.boardScroll}>
        <View style={[styles.board, { minHeight: 400 }]}>
          {cards.map((card, index) => (
            <View 
                key={card.id} 
                style={[
                    { width: cardSize, height: cardSize * 1.4, margin: 8 },
                    isGathered ? { 
                        position: 'absolute', 
                        top: '40%', 
                        left: width / 2 - cardSize / 2 - 20, // Centraliza horizontalmente
                        zIndex: index,
                        transform: [{ rotate: `${Math.random() * 10 - 5}deg` }] // Leve rotação aleatória para efeito de pilha
                    } : {}
                ]}
            >
                <MemoryCard
                  card={card}
                  onPress={handleCardPress}
                  width={'100%'}
                  height={'100%'}
                />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* --- MODAL DE VITÓRIA --- */}
      <Modal transparent={true} visible={gameWon} animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={[styles.modalTitle, styles.neonText]}>VITÓRIA!</Text>
                <Text style={styles.modalText}>
                    Nível {level} completo!
                </Text>
                <Text style={styles.modalSubText}>
                    Tempo da fase: {getLevelConfig(level).time - timeLeft}s
                </Text>
                {level === 5 && (
                    <Text style={[styles.modalSubText, { color: colors.success, fontWeight: 'bold', fontSize: 16 }]}>
                        Tempo Total: {totalTime + (getLevelConfig(level).time - timeLeft)}s
                    </Text>
                )}
                {/* Exibe o total de movimentos ao vencer */}
                <Text style={styles.modalSubText}>
                    Total de Movimentos: {moves}
                </Text>

                <View style={styles.modalButtons}>
                    {/* Botão Jogar Novamente (mesmo nível) */}
                    <TouchableOpacity style={styles.modalBtnOutline} onPress={startNewGame}>
                        <Text style={styles.modalBtnTextOutline}>Repetir</Text>
                    </TouchableOpacity>

                    {/* Botão Próximo Nível ou Menu */}
                    <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleNextLevel}>
                        <Text style={styles.modalBtnTextPrimary}>
                            {level < 5 ? "Próximo Nível" : "Menu Principal"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      {/* --- MODAL DE GAME OVER --- */}
      <Modal transparent={true} visible={gameOver} animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { borderColor: colors.danger }]}>
                <Text style={[styles.modalTitle, { color: colors.danger, textShadowColor: colors.danger }]}>
                    TEMPO ESGOTADO!
                </Text>
                <Text style={styles.modalText}>
                    Não desista agora!
                </Text>

                <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.modalBtnOutline} onPress={onBack}>
                        <Text style={styles.modalBtnTextOutline}>Sair</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.modalBtnPrimary, { backgroundColor: colors.danger }]} 
                        onPress={startNewGame}
                    >
                        <Text style={styles.modalBtnTextPrimary}>Tentar Novamente</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
    bgOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)', // Mais escuro para destacar as cartas
    },
    boardScroll: {
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    board: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    card: {
      width: 60,
      height: 80,
      // margin: 8, // Margin is handled in the wrapper now
      backgroundColor: colors.cardBack,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    cardFace: {
      backfaceVisibility: 'hidden',
    },
    cardFlipped: {
      backgroundColor: colors.cardFront,
      borderColor: colors.primary,
      borderWidth: 2,
    },
    cardMatched: {
      backgroundColor: colors.success,
      opacity: 0.7,
    },
    cardBackText: {
      color: colors.primary,
      fontSize: 32,
      fontWeight: 'bold',
    },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // Removido bordas e margens para tela cheia
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: { padding: 5 },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 2,
  },
  neonText: {
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  statBox: { alignItems: 'center', minWidth: 80 },
  timerBox: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: '#333',
      paddingHorizontal: 30,
  },
  statLabel: {
      color: '#888',
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
      marginBottom: 5,
  },
  statValue: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
      textShadowColor: colors.primary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 5,
  },
  progressBarContainer: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  restartButton: {
      flexDirection: 'row',
      alignSelf: 'center',
      alignItems: 'center',
      marginBottom: 10,
      padding: 5,
  },
  restartText: { color: '#888', fontSize: 12, marginLeft: 5 },
  // ESTILOS DO MODAL
  modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContent: {
      width: '80%',
      backgroundColor: '#1a1a1a', // Voltar para fundo escuro no modal para contraste com o campo
      padding: 30,
      borderRadius: 15,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
  },
  modalTitle: {
      fontSize: 28,
      fontWeight: '900',
      color: colors.primary,
      marginBottom: 10,
      textAlign: 'center',
      letterSpacing: 2,
  },
  modalText: {
      fontSize: 18,
      color: '#fff', // Texto branco
      marginBottom: 5,
      textAlign: 'center',
  },
  modalSubText: {
      fontSize: 14,
      color: '#ccc', // Cinza claro
      marginBottom: 10, 
      textAlign: 'center',
  },
  modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 15,
      marginTop: 20, 
  },
  modalBtnPrimary: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
  },
  modalBtnTextPrimary: {
      color: '#000000', // Texto preto no botão branco/amarelo
      fontWeight: 'bold',
      fontSize: 14,
      textTransform: 'uppercase',
  },
  modalBtnOutline: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
  },
  modalBtnTextOutline: {
      color: colors.primary, // Texto da cor primária
      fontSize: 14,
  },
});

export default MemoryGameScreen;