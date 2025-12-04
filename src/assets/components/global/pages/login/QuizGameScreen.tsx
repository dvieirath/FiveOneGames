import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView, 
  Alert,
  Dimensions,
  TextInput // Importado TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// CORES - TEMA LARANJA NEON
const colors = {
  primary: '#fc4b08',
  background: '#000000',
  text: '#F5F5F5',
  cardBackground: '#111111',
  success: '#00ff00',
  danger: '#ff0000',
  optionBg: '#1a1a1a',
  inputBg: '#222', // Cor de fundo para o input de busca
};

// Dados dos Temas e Perguntas (Simulado)
const QUIZ_DATA: any = {
  'Tecnologia': {
    icon: 'hardware-chip-outline',
    questions: [
      { question: 'Qual linguagem é conhecida como a mãe das linguagens?', options: ['C', 'Assembly', 'Fortran', 'Java'], correct: 0 },
      { question: 'O que significa CPU?', options: ['Central Process Unit', 'Computer Personal Unit', 'Central Power Unit', 'Core Processing Unit'], correct: 0 },
      { question: 'Quem fundou a Microsoft?', options: ['Steve Jobs', 'Bill Gates', 'Elon Musk', 'Mark Zuckerberg'], correct: 1 },
    ]
  },
  'Cinema': {
    icon: 'film-outline',
    questions: [
      { question: 'Quem dirigiu "Pulp Fiction"?', options: ['Spielberg', 'Tarantino', 'Nolan', 'Scorsese'], correct: 1 },
      { question: 'Qual o filme de maior bilheteria?', options: ['Avatar', 'Vingadores', 'Titanic', 'Star Wars'], correct: 0 },
      { question: 'Em que ano foi lançado o primeiro "Matrix"?', options: ['1998', '1999', '2000', '2001'], correct: 1 },
    ]
  },
  'Esportes': {
    icon: 'football-outline',
    questions: [
      { question: 'Qual país venceu a Copa de 2014?', options: ['Brasil', 'Argentina', 'Alemanha', 'Espanha'], correct: 2 },
      { question: 'Quantos jogadores tem um time de vôlei?', options: ['5', '6', '7', '8'], correct: 1 },
      { question: 'Quem é conhecido como "Rei do Futebol"?', options: ['Maradona', 'Messi', 'Pelé', 'Ronaldo'], correct: 2 },
    ]
  },
  'História': {
    icon: 'book-outline',
    questions: [
      { question: 'Em que ano o homem pisou na Lua?', options: ['1965', '1969', '1972', '1959'], correct: 1 },
      { question: 'Quem descobriu o Brasil?', options: ['Cabral', 'Colombo', 'Vespucci', 'Magalhães'], correct: 0 },
      { question: 'Qual foi a primeira capital do Brasil?', options: ['Rio de Janeiro', 'Brasília', 'Salvador', 'São Paulo'], correct: 2 },
    ]
  }
};

interface QuizGameScreenProps {
  onBack: () => void;
  onThemeSelect: (theme: string) => void;
  activeTheme: string | null;
}

const QuizGameScreen: React.FC<QuizGameScreenProps> = ({ onBack, onThemeSelect, activeTheme }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(false);
  const [userName, setUserName] = useState('Jogador');
  const [searchQuery, setSearchQuery] = useState(''); // Estado para a busca

  // Carrega o nome do usuário
  useEffect(() => {
    const loadUser = async () => {
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName) setUserName(storedName);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (activeTheme) {
      setGameActive(true);
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResult(false);
      setTimeLeft(15);
    }
  }, [activeTheme]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameActive && !showResult && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive && !showResult) {
      handleNextQuestion(false);
    }
    return () => clearInterval(interval);
  }, [timeLeft, gameActive, showResult]);

  const handleOptionPress = (optionIndex: number) => {
    if (!activeTheme) return;
    const currentQuestions = QUIZ_DATA[activeTheme].questions;
    const isCorrect = currentQuestions[currentQuestionIndex].correct === optionIndex;

    if (isCorrect) setScore(prev => prev + 10);
    handleNextQuestion(isCorrect);
  };

  const handleNextQuestion = (lastCorrect: boolean) => {
    if (!activeTheme) return;
    const currentQuestions = QUIZ_DATA[activeTheme].questions;

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(15);
    } else {
      setGameActive(false);
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    if (activeTheme) {
        onThemeSelect(activeTheme);
    }
  };

  // --- RENDERIZAÇÃO: SELEÇÃO DE TEMA ---
  if (!activeTheme) {
    // Filtra os temas com base na busca
    const filteredThemes = Object.entries(QUIZ_DATA).filter(([theme]) =>
      theme.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Bem Vindo de Volta,</Text>
            <Text style={[styles.welcomeName, styles.neonText]}>{userName}</Text>
          </View>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, styles.neonText]}>QUIZ MASTER</Text>

        {/* BARRA DE PESQUISA */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tema..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.themeSelectionContainer}>
          <Text style={styles.subTitle}>Escolha um Tema:</Text>
          <ScrollView contentContainerStyle={styles.themeGridScroll}>
             <View style={styles.themeGrid}>
              {filteredThemes.map(([theme, data]: [string, any]) => (
                <TouchableOpacity
                  key={theme}
                  style={styles.themeCard}
                  onPress={() => onThemeSelect(theme)}
                >
                  <Ionicons name={data.icon} size={40} color={colors.primary} style={styles.themeIcon} />
                  <Text style={styles.themeText}>{theme}</Text>
                </TouchableOpacity>
              ))}
              {filteredThemes.length === 0 && (
                <Text style={styles.noResultsText}>Nenhum tema encontrado.</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // --- RENDERIZAÇÃO: RESULTADO FINAL ---
  if (showResult) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={[styles.resultTitle, styles.neonText]}>FIM DE JOGO!</Text>
          <Text style={styles.resultScore}>Pontuação Final: <Text style={{color: colors.primary}}>{score}</Text></Text>

          <TouchableOpacity style={styles.actionButton} onPress={restartQuiz}>
            <Text style={styles.actionButtonText}>Jogar Novamente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.secondaryBtn]} onPress={onBack}>
            <Text style={[styles.actionButtonText, {color: '#888'}]}>Voltar ao Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- RENDERIZAÇÃO: O JOGO (PERGUNTAS) ---
  const currentQuestions = QUIZ_DATA[activeTheme].questions;
  const question = currentQuestions[currentQuestionIndex];
  const themeIcon = QUIZ_DATA[activeTheme].icon;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.gameHeader}>
        <View style={styles.themeInfo}>
          <Ionicons name={themeIcon} size={24} color={colors.primary} style={styles.headerIcon} />
          <Text style={styles.themeBadge}>{activeTheme.toUpperCase()}</Text>
        </View>
        <Text style={[styles.timerText, timeLeft <= 5 ? {color: colors.danger} : {}]}>
            {timeLeft}s
        </Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionCounter}>
            Questão {currentQuestionIndex + 1}/{currentQuestions.length}
        </Text>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {question.options.map((option: string, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleOptionPress(index)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.currentScore}>Pontos: {score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 30,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  welcomeText: {
    color: '#888',
    fontSize: 12,
  },
  welcomeName: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
    marginTop: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20, // Reduzido para dar espaço ao search
  },
  neonText: {
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  // Estilos da Barra de Pesquisa
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  themeSelectionContainer: {
      flex: 1,
  },
  subTitle: {
      color: '#888',
      fontSize: 18,
      marginBottom: 15,
      textAlign: 'center',
  },
  themeGridScroll: {
    paddingBottom: 20,
  },
  themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 15,
  },
  themeCard: {
      width: '47%',
      height: 120,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 5,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 5,
  },
  themeIcon: {
    marginBottom: 10,
  },
  themeText: {
      color: colors.text,
      fontWeight: 'bold',
      fontSize: 16,
  },
  noResultsText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    width: '100%',
  },
  gameHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 30,
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  themeBadge: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: 16,
  },
  timerText: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
  },
  questionContainer: {
      marginBottom: 30,
  },
  questionCounter: {
      color: '#666',
      fontSize: 14,
      marginBottom: 10,
  },
  questionText: {
      color: colors.text,
      fontSize: 22,
      fontWeight: 'bold',
      lineHeight: 30,
  },
  optionsContainer: {
      gap: 15,
  },
  optionButton: {
      backgroundColor: colors.optionBg,
      padding: 20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#333',
  },
  optionText: {
      color: colors.text,
      fontSize: 16,
  },
  currentScore: {
      marginTop: 30,
      textAlign: 'center',
      color: '#888',
      fontSize: 14,
  },
  resultContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  resultTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
  },
  resultScore: {
      fontSize: 24,
      color: '#fff',
      marginBottom: 50,
  },
  actionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 30,
      marginBottom: 20,
      width: '80%',
      alignItems: 'center',
  },
  secondaryBtn: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#444',
  },
  actionButtonText: {
      color: '#000',
      fontWeight: 'bold',
      fontSize: 16,
  }
});

export default QuizGameScreen;