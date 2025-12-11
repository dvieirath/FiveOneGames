import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView, 
  Dimensions,
  TextInput,
  Image,
  Linking // Importado Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient'; // Verifique se o caminho está correto
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
  inputBg: '#222',
};

// --- DADOS DE MATERIAL DE APOIO (MOCK) ---
const SUPPORT_MATERIALS = [
  {
    id: '1',
    title: 'A Revolução da IA',
    category: 'Tecnologia',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=200&auto=format&fit=crop',
    description: 'Como a inteligência artificial está mudando o mundo.',
    link: 'https://www.google.com/search?q=inteligencia+artificial'
  },
  {
    id: '2',
    title: 'História das Copas',
    category: 'Esportes',
    image: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=200&auto=format&fit=crop',
    description: 'Os momentos mais marcantes do futebol mundial.',
    link: 'https://www.google.com/search?q=historia+das+copas'
  },
  {
    id: '3',
    title: 'O Sistema Solar',
    category: 'Ciências',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=200&auto=format&fit=crop',
    description: 'Explorando os planetas e mistérios do espaço.',
    link: 'https://www.google.com/search?q=sistema+solar'
  },
  {
    id: '4',
    title: 'Grandes Diretores',
    category: 'Cinema',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=200&auto=format&fit=crop',
    description: 'A vida e obra dos mestres do cinema.',
    link: 'https://www.google.com/search?q=grandes+diretores+cinema'
  }
];

// --- DADOS DOS TEMAS COM IMAGENS REAIS ---
const QUIZ_THEMES: Record<string, { image: string }> = {
  'Tecnologia': {
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  'Cinema': {
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  'Esportes': {
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  'História': {
    image: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?q=80&w=1474&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  'Música': {
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  'Geografia': {
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  'Ciências': {
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  'NeymarJR': {
    image: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1470&auto=format&fit=crop',
  }
};

interface QuizGameScreenProps {
  onBack: () => void;
  onThemeSelect: (theme: string) => void;
  activeTheme: string | null;
}

const QuizGameScreen: React.FC<QuizGameScreenProps> = ({ onBack, onThemeSelect, activeTheme }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Jogador');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [optionsDisabled, setOptionsDisabled] = useState<boolean>(false);
  
  // Estados para "Ver mais"
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllMaterials, setShowAllMaterials] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      if (storedName) setUserName(storedName);
    };
    loadUser();
  }, []);

  // --- AQUI ESTÁ A CORREÇÃO PRINCIPAL ---
  useEffect(() => {
    async function loadQuestions() {
      if (activeTheme) {
        setGameActive(true);
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResult(false);
        setTimeLeft(15);
        setSelectedOption(null);
        setIsCorrect(null);
        setOptionsDisabled(false);

        console.log("Buscando perguntas para o tema:", activeTheme);

        // Busca perguntas do Supabase
        const { data, error } = await supabase
          .from('perguntas')
          .select('*')
          .eq('tema', activeTheme)
          // .order('random()') // OBS: Se der erro de SQL, comente esta linha temporariamente
          .limit(10);

        if (error) {
          console.error("Erro ao buscar perguntas:", error);
          setShuffledQuestions([]);
        } else if (data) {
          console.log("Perguntas brutas encontradas:", data.length);
          
          // Processamento e Validação dos Dados
          const perguntasValidas = data.map((q: any) => {
            let optionsParsed = [];
            
            // Tenta converter as opções, seja Array ou String JSON
            try {
              if (Array.isArray(q.opcoes)) {
                optionsParsed = q.opcoes;
              } else if (typeof q.opcoes === 'string') {
                // Remove aspas extras se necessário e converte
                // Ex: '"[\"A\", \"B\"]"' -> ["A", "B"]
                const cleanString = q.opcoes.startsWith('"') && q.opcoes.endsWith('"') 
                  ? JSON.parse(q.opcoes) 
                  : q.opcoes;
                optionsParsed = typeof cleanString === 'string' ? JSON.parse(cleanString) : cleanString;
              }
            } catch (e) {
              console.log("Erro ao fazer parse das opções da pergunta ID:", q.id, e);
              optionsParsed = [];
            }

            return {
              question: q.pergunta,
              options: optionsParsed,
              correct: q.correta
            };
          }).filter(q => 
            // Filtro de Segurança
            q.question &&
            Array.isArray(q.options) &&
            q.options.length >= 2 && // Pelo menos 2 opções
            typeof q.correct === 'number' &&
            q.correct >= 0 &&
            q.correct < q.options.length
          );

          console.log("Perguntas válidas após processamento:", perguntasValidas.length);
          
          // Embaralhar as perguntas no front-end (caso o random do banco falhe)
          const shuffled = perguntasValidas.sort(() => Math.random() - 0.5);
          setShuffledQuestions(shuffled);
        }
      }
    }
    loadQuestions();
  }, [activeTheme]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameActive && !showResult && timeLeft > 0 && selectedOption === null) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive && !showResult && selectedOption === null) {
      handleOptionPress(-1); // tempo esgotado, resposta errada
    }
    return () => clearInterval(interval);
  }, [timeLeft, gameActive, showResult, selectedOption]);

  const handleOptionPress = (optionIndex: number) => {
    if (!activeTheme || optionsDisabled || selectedOption !== null) return;
    
    const currentQuestions = shuffledQuestions;
    // Proteção extra caso o array esteja vazio
    if (!currentQuestions || currentQuestions.length === 0) return;

    const correctIndex = currentQuestions[currentQuestionIndex].correct;
    const acertou = optionIndex === correctIndex;
    
    setSelectedOption(optionIndex);
    setIsCorrect(acertou);
    setOptionsDisabled(true);
    
    if (acertou) setScore(prev => prev + 10);
    
    // Aguarda 1.2s para mostrar feedback antes de ir para próxima
    setTimeout(() => {
      handleNextQuestion(true);
    }, 1200);
  };

  const handleNextQuestion = (lastCorrect: boolean) => {
    if (!activeTheme) return;
    const currentQuestions = shuffledQuestions;
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(15);
      setSelectedOption(null);
      setIsCorrect(null);
      setOptionsDisabled(false);
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
    const filteredThemes = Object.entries(QUIZ_THEMES).filter(([theme]) =>
      theme.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View style={[styles.container, {padding: 0, backgroundColor: '#000'}]}> 
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        <ScrollView contentContainerStyle={{paddingBottom: 30}}>
          {/* HEADER */}
          <View style={{paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View>
              <Text style={{color: '#888', fontSize: 14}}>Bem vindo,</Text>
              <Text style={{color: '#fff', fontSize: 24, fontWeight: 'bold'}}>{userName}!</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
          </View>

          {/* SEARCH BAR */}
          <View style={{paddingHorizontal: 20, marginTop: 20}}>
            <View style={{
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: '#1C1C1E', 
                borderRadius: 15, 
                paddingHorizontal: 15, 
                height: 50
            }}>
                <Ionicons name="search" size={20} color="#888" style={{marginRight: 10}} />
                <TextInput
                style={{flex: 1, color: '#fff', fontSize: 16}}
                placeholder="Search"
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                />
            </View>
          </View>

          {/* FEATURED BANNER */}
          <View style={{paddingHorizontal: 20, marginTop: 25}}>
            <View style={{
                width: '100%', 
                height: 180, 
                borderRadius: 20, 
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: '#111', // Fundo escuro para a logo
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Image 
                    source={require('../assets/FiveOneLogo.png')}
                    style={{width: '80%', height: '80%', resizeMode: 'contain'}}
                />
            </View>
          </View>

          {/* TOP CATEGORIES */}
          <View style={{marginTop: 25}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15}}>
                <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>Categorias</Text>
                <TouchableOpacity onPress={() => setShowAllCategories(!showAllCategories)}>
                    <Text style={{color: '#888', fontSize: 14}}>{showAllCategories ? 'Ver menos' : 'Ver mais'}</Text>
                </TouchableOpacity>
            </View>
            
            {showAllCategories ? (
                <View style={{flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, justifyContent: 'space-between'}}>
                    {filteredThemes.map(([theme, data]: [string, any]) => (
                        <TouchableOpacity 
                            key={theme}
                            onPress={() => onThemeSelect(theme)}
                            style={{
                                width: '48%', 
                                height: 100, 
                                marginBottom: 15, 
                                borderRadius: 15, 
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            <Image 
                                source={{ uri: data.image }} 
                                style={{width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.7}}
                            />
                            <View style={{
                                position: 'absolute', 
                                top: 0, left: 0, right: 0, bottom: 0, 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                backgroundColor: 'rgba(0,0,0,0.3)'
                            }}>
                                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 14}}>{theme}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingLeft: 20}}>
                    {filteredThemes.map(([theme, data]: [string, any]) => (
                        <TouchableOpacity 
                            key={theme}
                            onPress={() => onThemeSelect(theme)}
                            style={{
                                width: 100, 
                                height: 100, 
                                marginRight: 15, 
                                borderRadius: 15, 
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            <Image 
                                source={{ uri: data.image }} 
                                style={{width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.7}}
                            />
                            <View style={{
                                position: 'absolute', 
                                top: 0, left: 0, right: 0, bottom: 0, 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                backgroundColor: 'rgba(0,0,0,0.3)'
                            }}>
                                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 14}}>{theme}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
          </View>

          {/* MATERIAL DE APOIO */}
          <View style={{marginTop: 25, paddingHorizontal: 20}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}>
                <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>Material de Apoio</Text>
                <TouchableOpacity onPress={() => setShowAllMaterials(!showAllMaterials)}>
                    <Text style={{color: '#888', fontSize: 14}}>{showAllMaterials ? 'Ver menos' : 'Ver mais'}</Text>
                </TouchableOpacity>
            </View>

            {/* Lista Vertical de Materiais */}
            {(showAllMaterials ? SUPPORT_MATERIALS : SUPPORT_MATERIALS.slice(0, 3)).map((item) => (
                <TouchableOpacity 
                    key={item.id}
                    onPress={() => Linking.openURL(item.link)}
                    style={{
                        flexDirection: 'row',
                        backgroundColor: '#1C1C1E',
                        borderRadius: 15,
                        padding: 10,
                        marginBottom: 15,
                        alignItems: 'center'
                    }}
                >
                    <Image 
                        source={{ uri: item.image }} 
                        style={{width: 60, height: 60, borderRadius: 10}}
                    />
                    <View style={{marginLeft: 15, flex: 1}}>
                        <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>{item.title}</Text>
                        <Text style={{color: '#888', fontSize: 12, marginTop: 4}} numberOfLines={2}>{item.description}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6}}>
                            <Ionicons name="book-outline" size={12} color={colors.primary} style={{marginRight: 4}} />
                            <Text style={{color: colors.primary, fontSize: 12, fontWeight: 'bold'}}>{item.category}</Text>
                        </View>
                    </View>
                    <Ionicons name="open-outline" size={20} color="#666" />
                </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
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
  const currentQuestions = shuffledQuestions;
  const question = currentQuestions[currentQuestionIndex];
  const themeIcon = 'game-controller-outline';

  // Verifica se a pergunta atual é válida para renderizar
  if (!question || !Array.isArray(question.options) || typeof question.correct !== 'number' || question.correct < 0 || question.correct >= question.options.length) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.danger, fontSize: 18, textAlign: 'center', paddingHorizontal: 20 }}>
            {shuffledQuestions.length === 0 
              ? "Carregando..." 
              : "Erro ao carregar a próxima pergunta."}
          </Text>
          <TouchableOpacity style={[styles.actionButton, { marginTop: 30 }]} onPress={onBack}>
            <Text style={styles.actionButtonText}>Voltar ao Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={onBack} style={{ marginRight: 15 }}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.themeInfo}>
          <Ionicons name={themeIcon} size={24} color={colors.primary} style={styles.headerIcon} />
          <Text style={styles.themeBadge}>{activeTheme.toUpperCase()}</Text>
        </View>
        <Text style={[styles.timerText, timeLeft <= 5 ? {color: colors.danger} : {}]}>
            {timeLeft}s
        </Text>
      </View>

      {/* IMAGEM DO TEMA */}
      {activeTheme && QUIZ_THEMES[activeTheme] && (
        <View style={{marginBottom: 20, borderRadius: 15, overflow: 'hidden', height: 150, width: '100%'}}>
            <Image 
                source={{ uri: QUIZ_THEMES[activeTheme].image }} 
                style={{width: '100%', height: '100%', resizeMode: 'cover'}}
            />
            <View style={{
                position: 'absolute', 
                top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.3)' 
            }}/>
        </View>
      )}

      <View style={styles.questionContainer}>
        <Text style={styles.questionCounter}>
            Questão {currentQuestionIndex + 1}/{currentQuestions.length}
        </Text>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {question.options.map((option: string, index: number) => {
          let optionStyle = { ...styles.optionButton };
          let optionTextStyle = { ...styles.optionText };
          let opacity = 1;
          
          if (selectedOption !== null) {
            if (index === question.correct) {
              optionStyle.backgroundColor = colors.success;
              optionTextStyle.color = '#000';
            } else if (index === selectedOption && !isCorrect) {
              optionStyle.backgroundColor = colors.danger;
              optionTextStyle.color = '#fff';
            } else {
              opacity = 0.5;
            }
          }
          return (
            <TouchableOpacity
              key={index}
              style={[optionStyle, { opacity }]}
              onPress={() => handleOptionPress(index)}
              disabled={optionsDisabled}
            >
              <Text style={optionTextStyle}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedOption !== null && (
        <Text style={{
          textAlign: 'center',
          marginTop: 18,
          fontSize: 16,
          color: isCorrect ? colors.success : colors.danger,
          fontWeight: 'bold',
        }}>
          {isCorrect ? 'Resposta correta!' : 'Resposta errada!'}
        </Text>
      )}

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
    marginBottom: 20,
  },
  neonText: {
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
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
  noResultsText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    width: '100%',
  },
  // --- ESTILOS DO JOGO ---
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
  // --- ESTILOS DO RESULTADO ---
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