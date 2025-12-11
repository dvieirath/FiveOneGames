import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Alert,
  Modal, // Adicionado Modal
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';

// CAMINHO DA LOGO AJUSTADO
// Se o arquivo estiver em src/assets/FiveOneLogo.png e este arquivo em src/assets/components/global/pages/login/HomeScreen.tsx
// O caminho correto é subir 5 níveis: ../../../../../FiveOneLogo.png
// MAS, para garantir, vamos usar o require direto do assets se possível ou ajustar conforme a estrutura real.
// Assumindo que a logo está na raiz de assets dentro de src:
const LOCAL_LOGO_PATH = require('../assets/FiveOneLogo.png');

const { width, height } = Dimensions.get('window');

// CORES - TEMA LARANJA NEON
const colors = {
  primary: '#fc4b08',     // Laranja Neon
  background: '#000000',  // Preto Absoluto
  text: '#F5F5F5',        // Texto Claro
  cardBackground: '#111111',
  secondary: '#FF4081',
  border: '#fc4b08',
  darkOverlay: 'rgba(0,0,0,0.5)', // Overlay um pouco mais suave
  tabBarBackground: '#0a0a0a',
  indicatorInactive: '#333',
  modalBackground: 'rgba(0,0,0,0.9)', // Fundo do modal
};

// Dados simulados
const gameData = [
    {
        id: '1',
        title: 'Jogo da Memória',
        status: 'Novo',
        color: '#16A085',
        imageSource: require('../assets/images/NeymarCapa.png'), // Capa Personalizada
        resizeMode: 'contain' as const,
        backgroundColor: '#1a1a1a', 
        description: 'Teste sua memória encontrando os pares de cartas antes que o tempo acabe! Um desafio clássico com um toque de futebol.',
        rules: [
            'Vire duas cartas por vez.',
            'Se forem iguais, elas permanecem viradas e você ganha pontos.',
            'Se forem diferentes, elas viram de volta.',
            'Complete todos os pares antes do tempo acabar para avançar de nível.',
            'Fique atento ao embaralhamento das cartas!'
        ]
    },
    {
        id: '2',
        title: 'Quiz',
        status: 'Popular',
        color: '#E74C3C',
        imageSource: { uri: 'https://d9radp1mruvh.cloudfront.net/media/challenge_img/509655_shutterstock_1506580442_769367.jpg' }, // Capa Quiz
        resizeMode: 'contain' as const,
        backgroundColor: '#000000',
        description: 'Desafie seus conhecimentos em diversas categorias como Esportes, Cinema, Tecnologia e muito mais.',
        rules: [
            'Escolha um tema de sua preferência.',
            'Responda as perguntas corretamente dentro do tempo limite.',
            'Cada acerto vale pontos.',
            'Tente bater seu recorde e aprender curiosidades novas!'
        ]
    },
    {
        id: '3',
        title: 'Puzzle de Código',
        status: 'EM BREVE',
        color: '#F39C12',
        imageSource: { uri: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop' }, // Matrix / Código Hacker
        description: 'Resolva quebra-cabeças lógicos baseados em programação.',
        rules: ['Em breve...']
    },
    {
        id: '4',
        title: 'Corrida Turbo 3D',
        status: 'EM BREVE',
        color: '#2980B9',
        imageSource: { uri: 'https://images.unsplash.com/photo-1511994714008-b6d68a8b32a2?q=80&w=800&auto=format&fit=crop' }, // Carro de Corrida (F1)
        description: 'Acelere em pistas futuristas e vença seus oponentes.',
        rules: ['Em breve...']
    },
    {
        id: '5',
        title: 'Fúria dos Dragões',
        status: 'EM BREVE',
        color: '#8E44AD',
        imageSource: { uri: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?q=80&w=800&auto=format&fit=crop' }, // Olho de Dragão / Gato místico
        description: 'Entre em um mundo de fantasia e batalhe contra dragões.',
        rules: ['Em breve...']
    },
    {
        id: '6',
        title: 'Estratégia Galáctica',
        status: 'EM BREVE',
        color: colors.primary,
        imageSource: { uri: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop' }, // Terra vista do espaço
        description: 'Conquiste planetas e gerencie recursos no espaço.',
        rules: ['Em breve...']
    },
];

interface HomeScreenProps {
    onLogout: () => void;
    onGameSelect: (gameTitle: string) => void;
    onOpenFriends?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout, onGameSelect, onOpenFriends }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [selectedGameInfo, setSelectedGameInfo] = useState<any>(null);

  const handleGamePress = (game: typeof gameData[0]) => {
    if (game.status.toUpperCase() === 'EM BREVE') {
        Alert.alert("Em Produção", "Este jogo estará disponível em breve!");
    } else {
        if (game.title === 'Jogo da Memória' || game.title === 'Quiz') {
            onGameSelect(game.title);
        } else {
            Alert.alert("Jogo", `Iniciando o jogo: ${game.title}`);
        }
    }
  };

  const handleOpenInfo = (game: any) => {
      setSelectedGameInfo(game);
      setInfoModalVisible(true);
  };

    const handleTabPress = (tabName: string) => {
        if (tabName === 'Amigos' && onOpenFriends) {
            onOpenFriends();
        } else {
            Alert.alert("Navegação", `Abrindo ${tabName}... (Funcionalidade em breve)`);
        }
    };

  // Atualiza o índice ativo ao rolar o carrossel
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* HEADER PRINCIPAL */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <View style={styles.logoContainer}>
            <Image
                source={LOCAL_LOGO_PATH}
                style={[styles.logo, styles.neonShadow]}
                resizeMode="contain"
            />
            <Text style={[styles.logoText, styles.textShadow]}>Five One Games</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>SAIR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContainer}>
        {/* Título da Seção */}
        <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Destaques</Text>
        </View>

        {/* CARROSSEL DE JOGOS (Horizontal) */}
        <View style={styles.carouselContainer}>
            <ScrollView
                horizontal
                pagingEnabled // Ativa o efeito de "travar" em cada item (snap)
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16} // Otimiza a fluidez do evento de scroll
                contentContainerStyle={styles.scrollContent}
            >
            {gameData.map((game, index) => {
                const itemColor = game.color === colors.primary ? colors.border : game.color;

                return (
                <View key={game.id} style={styles.slideWrapper}>
                    <View style={[
                        styles.gameCard, 
                        (game as any).backgroundColor ? { backgroundColor: (game as any).backgroundColor } : {}
                    ]}>
                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            onPress={() => handleGamePress(game)}
                            activeOpacity={0.9}
                        >
                            {/* Imagem de Fundo */}
                            <Image
                                source={game.imageSource}
                                style={styles.cardImage}
                                resizeMode={(game as any).resizeMode || "cover"}
                            />

                            {/* Overlay Gradiente/Escuro */}
                            <View style={styles.cardOverlay} />

                            {/* Conteúdo do Card */}
                            <View style={styles.cardContent}>
                                <View style={[styles.statusBadge, { backgroundColor: itemColor }]}>
                                    <Text style={styles.statusText}>{game.status}</Text>
                                </View>

                                <Text style={[styles.gameTitle, styles.textShadow]}>
                                    {game.title}
                                </Text>

                                <View style={[styles.playButton, { backgroundColor: itemColor }]}>
                                    <Text style={styles.playButtonText}>JOGAR AGORA</Text>
                                    <Ionicons name="play-circle" size={24} color="white" style={{marginLeft: 5}} />
                                </View>
                            </View>

                            {/* Borda Neon */}
                            <View style={[styles.neonBorder, { borderColor: itemColor }]} />
                        </TouchableOpacity>

                        {/* Botão de Informação (Separado e no Topo) */}
                        <TouchableOpacity 
                            style={styles.infoButtonTopRight} 
                            onPress={() => handleOpenInfo(game)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="information-circle" size={36} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            )})}
            </ScrollView>

            {/* Indicadores de Paginação (Bolinhas) */}
            <View style={styles.paginationContainer}>
                {gameData.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            index === activeIndex ?
                                { backgroundColor: colors.primary, width: 20 } :
                                { backgroundColor: colors.indicatorInactive }
                        ]}
                    />
                ))}
            </View>
        </View>
      </View>

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <View style={styles.bottomTabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('Amigos')}>
              <FontAwesome5 name="user-friends" size={20} color={colors.primary} style={styles.tabIconShadow} />
              <Text style={styles.tabLabel}>Amigos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem}>
              <View style={styles.activeTabIndicator}>
                <MaterialIcons name="home" size={28} color="white" />
              </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('Conquistas')}>
              <FontAwesome5 name="trophy" size={20} color={colors.primary} style={styles.tabIconShadow} />
              <Text style={styles.tabLabel}>Conquistas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('Notificações')}>
              <Ionicons name="notifications" size={22} color={colors.primary} style={styles.tabIconShadow} />
              <Text style={styles.tabLabel}>Avisos</Text>
          </TouchableOpacity>
      </View>

      {/* MODAL DE INFORMAÇÕES */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                {selectedGameInfo && (
                    <>
                        <View style={[styles.modalHeader, { borderBottomColor: selectedGameInfo.color === colors.primary ? colors.border : selectedGameInfo.color }]}>
                            <Text style={[styles.modalTitle, { color: selectedGameInfo.color === colors.primary ? colors.border : selectedGameInfo.color }]}>
                                {selectedGameInfo.title}
                            </Text>
                            <TouchableOpacity onPress={() => setInfoModalVisible(false)}>
                                <Ionicons name="close-circle" size={30} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalSectionTitle}>Sobre o Jogo</Text>
                            <Text style={styles.modalDescription}>{selectedGameInfo.description}</Text>
                            
                            <Text style={styles.modalSectionTitle}>Regras</Text>
                            {selectedGameInfo.rules && selectedGameInfo.rules.map((rule: string, index: number) => (
                                <View key={index} style={styles.ruleRow}>
                                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{marginRight: 8, marginTop: 2}} />
                                    <Text style={styles.ruleText}>{rule}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity 
                            style={[styles.modalPlayButton, { backgroundColor: selectedGameInfo.color === colors.primary ? colors.border : selectedGameInfo.color }]}
                            onPress={() => {
                                setInfoModalVisible(false);
                                handleGamePress(selectedGameInfo);
                            }}
                        >
                            <Text style={styles.modalPlayButtonText}>JOGAR AGORA</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  modalContent: {
      width: '100%',
      maxHeight: '80%',
      backgroundColor: '#1a1a1a',
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: '#333',
      elevation: 20,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 15,
      borderBottomWidth: 2,
      marginBottom: 15,
  },
  modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      flex: 1,
  },
  modalBody: {
      marginBottom: 20,
  },
  modalSectionTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 15,
      marginBottom: 10,
  },
  modalDescription: {
      color: '#ccc',
      fontSize: 16,
      lineHeight: 24,
  },
  ruleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
  },
  ruleText: {
      color: '#ddd',
      fontSize: 14,
      lineHeight: 20,
      flex: 1,
  },
  modalPlayButton: {
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
  },
  modalPlayButtonText: {
      color: '#000',
      fontWeight: 'bold',
      fontSize: 16,
      textTransform: 'uppercase',
  },
  infoButtonTopRight: {
      position: 'absolute',
      top: 15,
      right: 15,
      zIndex: 10,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 20,
      padding: 2,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40, // Aumentado para baixar o conteúdo do header
    paddingBottom: 15,
    backgroundColor: colors.background,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  headerSpacer: { width: 60 },
  logoContainer: { alignItems: 'center', flexGrow: 1 },
  logo: { width: 90, height: 90, marginBottom: 5 },
  neonShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  textShadow: {
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  logoText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  logoutButton: {
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    width: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '50',
  },
  logoutText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 10,
  },

  // --- ESTRUTURA DO CARROSSEL ---
  mainContainer: {
      flex: 1,
      justifyContent: 'center', // Centraliza verticalmente
      paddingTop: 0,
      paddingBottom: 100, // Espaço extra para não sobrepor a barra inferior
  },
  sectionTitleContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center', // Centraliza o título
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
  carouselContainer: {
      height: height * 0.6, // Aumentado um pouco para dar respiro
      alignItems: 'center',
      justifyContent: 'center',
  },
  scrollContent: {
      alignItems: 'center',
      justifyContent: 'center',
  },
  slideWrapper: {
      width: width, // Ocupa a largura total da tela para o pagingEnabled funcionar corretamente
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
  },

  // --- ESTILO DO CARD GIGANTE ---
  gameCard: {
      width: '85%', // Largura relativa ao slideWrapper
      aspectRatio: 0.7, // Mantém proporção retangular vertical (tipo carta)
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      position: 'relative',
  },
  cardImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
  },
  cardOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderBottomWidth: 150, // Gradiente simulado na parte inferior
      borderBottomColor: 'rgba(0,0,0,0.9)',
  },
  cardContent: {
      flex: 1,
      justifyContent: 'flex-end',
      padding: 25,
      zIndex: 2,
  },
  gameTitle: {
      fontSize: 28,
      fontWeight: '900',
      color: 'white',
      textTransform: 'uppercase',
      marginBottom: 10,
      lineHeight: 32,
  },
  statusBadge: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginBottom: 10,
  },
  statusText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 12,
      textTransform: 'uppercase',
  },
  playButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 30,
      alignSelf: 'flex-start',
  },
  playButtonText: {
      color: 'black', // Texto preto no botão laranja para contraste
      fontSize: 14,
      fontWeight: 'bold',
      letterSpacing: 1,
  },
  neonBorder: {
      ...StyleSheet.absoluteFillObject,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 20,
      zIndex: 3,
      opacity: 0.6,
  },

  // --- PAGINAÇÃO ---
  paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15,
      height: 20,
  },
  paginationDot: {
      height: 8,
      width: 8,
      borderRadius: 4,
      marginHorizontal: 4,
  },

  // --- BARRA INFERIOR ---
  bottomTabBar: {
      flexDirection: 'row',
      backgroundColor: colors.tabBarBackground,
      height: 70,
      justifyContent: 'space-around',
      alignItems: 'center',
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      borderRadius: 35,
      borderWidth: 2,
      borderColor: colors.primary,
      elevation: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
  },
  tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
  },
  tabLabel: {
      color: '#666',
      fontSize: 10,
      marginTop: 4,
      fontWeight: '600',
  },
  tabIconShadow: {
      textShadowColor: colors.primary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 5,
  },
  activeTabIndicator: {
      backgroundColor: colors.primary,
      width: 45,
      height: 45,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -15, 
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 2,
      borderColor: '#000',
  }
});

export default HomeScreen;