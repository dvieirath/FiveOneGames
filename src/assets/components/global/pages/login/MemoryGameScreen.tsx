import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  Dimensions, 
  ScrollView, 
  Modal // Importamos Modal para o feedback customizado
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// CORES - TEMA LARANJA NEON
const colors = {
  primary: '#fc4b08',     // Laranja Neon
  background: '#000000',  // Preto Absoluto
  text: '#F5F5F5',        // Texto Claro
  cardBack: '#111111',    // Fundo da carta virada
  cardFront: '#1a1a1a',   // Fundo da carta aberta
  success: '#00ff00',     // Verde Neon para acertos
  danger: '#ff0000',      // Vermelho para tempo acabando
  overlay: 'rgba(0,0,0,0.85)', // Fundo escuro para o modal
};

// Ícones disponíveis para o jogo
const ICONS = [
  'ghost', 'dragon', 'gamepad', 'headset', 'dice', 
  'chess-knight', 'scroll', 'fire', 'bolt', 'skull', 
  'heart', 'star', 'trophy', 'rocket', 'puzzle-piece'
];

interface Card {
  id: string;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameScreenProps {
  onBack: () => void;
}

const MemoryGameScreen: React.FC<MemoryGameScreenProps> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moves, setMoves] = useState(0);
  
  // Estados de controle do jogo
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false); // Novo estado para Game Over
  
  // Estados para o cronômetro
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

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
      setGameOver(true); // Ativa o modal de Game Over
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, gameWon]);

  const startNewGame = () => {
    const config = getLevelConfig(level);
    const selectedIcons = ICONS.sort(() => 0.5 - Math.random()).slice(0, config.pairs);
    
    const gameCards = [...selectedIcons, ...selectedIcons].map((icon, index) => ({
      id: `${icon}-${index}`,
      icon,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(gameCards.sort(() => 0.5 - Math.random()));
    setMoves(0);
    setGameWon(false);
    setGameOver(false); // Reseta game over
    setSelectedCards([]);
    setIsProcessing(false);
    setTimeLeft(config.time);
    setIsTimerActive(true);
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

    if (card1.icon === card2.icon) {
      setTimeout(() => {
        const matchedCards = currentCards.map(c => 
          c.icon === card1.icon ? { ...c, isMatched: true } : c
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
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
            <Text style={styles.statLabel}>NÍVEL</Text>
            <Text style={styles.statValue}>{level}</Text>
        </View>
        <View style={[styles.statBox, styles.timerBox]}>
            <Text style={styles.statLabel}>TEMPO</Text>
            <Text style={[styles.statValue, timeLeft <= 10 ? { color: colors.danger } : {}]}>
                {formatTime(timeLeft)}
            </Text>
        </View>
        <View style={styles.statBox}>
            <Text style={styles.statLabel}>MOVIMENTOS</Text>
            <Text style={styles.statValue}>{moves}</Text>
        </View>
      </View>

      {/* REINICIAR */}
      <TouchableOpacity style={styles.restartButton} onPress={startNewGame}>
          <Ionicons name="refresh" size={16} color="#888" />
          <Text style={styles.restartText}>Reiniciar Fase</Text>
      </TouchableOpacity>

      {/* TABULEIRO */}
      <ScrollView contentContainerStyle={styles.boardScroll}>
        <View style={styles.board}>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card, 
                { width: cardSize, height: cardSize },
                card.isFlipped && styles.cardFlipped,
                card.isMatched && styles.cardMatched
              ]}
              onPress={() => handleCardPress(card)}
              activeOpacity={0.8}
            >
              {card.isFlipped || card.isMatched ? (
                <FontAwesome5 name={card.icon} size={cardSize * 0.5} color={card.isMatched ? colors.background : colors.primary} />
              ) : (
                <Text style={styles.cardBackText}>?</Text>
              )}
            </TouchableOpacity>
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
                    Tempo restante: {timeLeft}s
                </Text>
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

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  restartButton: {
      flexDirection: 'row',
      alignSelf: 'center',
      alignItems: 'center',
      marginBottom: 10,
      padding: 5,
  },
  restartText: { color: '#888', fontSize: 12, marginLeft: 5 },
  // Tabuleiro
  boardScroll: { flexGrow: 1, justifyContent: 'center', paddingBottom: 40 },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
  },
  card: {
    backgroundColor: colors.cardBack,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardFlipped: { backgroundColor: colors.cardFront, borderColor: colors.text },
  cardMatched: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    opacity: 0.8,
  },
  cardBackText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  // ESTILOS DO MODAL
  modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContent: {
      width: '80%',
      backgroundColor: '#1a1a1a',
      padding: 30,
      borderRadius: 15,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
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
      color: '#fff',
      marginBottom: 5,
      textAlign: 'center',
  },
  modalSubText: {
      fontSize: 14,
      color: '#aaa',
      marginBottom: 10, // Ajustado para dar espaço entre os subtextos
      textAlign: 'center',
  },
  modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 15,
      marginTop: 20, // Espaço extra antes dos botões
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
      color: '#000',
      fontWeight: 'bold',
      fontSize: 14,
      textTransform: 'uppercase',
  },
  modalBtnOutline: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#666',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
  },
  modalBtnTextOutline: {
      color: '#fff',
      fontSize: 14,
  }
});

export default MemoryGameScreen;