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
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';

// CAMINHO DA LOGO AJUSTADO
// Se o arquivo estiver em src/assets/FiveOneLogo.png e este arquivo em src/assets/components/global/pages/login/HomeScreen.tsx
// O caminho correto é subir 5 níveis: ../../../../../FiveOneLogo.png
// MAS, para garantir, vamos usar o require direto do assets se possível ou ajustar conforme a estrutura real.
// Assumindo que a logo está na raiz de assets dentro de src:
const LOCAL_LOGO_PATH = require('../../../../FiveOneLogo.png');

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
};

// Dados simulados
const gameData = [
  { id: '1', title: 'Jogo da Memória', status: 'Novo', color: '#16A085', imageUrl: 'https://picsum.photos/id/237/800/600' },
  { id: '2', title: 'Quiz', status: 'Popular', color: '#E74C3C', imageUrl: 'https://picsum.photos/id/1040/800/600' },
  { id: '3', title: 'Puzzle de Código', status: 'EM BREVE', color: '#F39C12', imageUrl: 'https://picsum.photos/id/1073/800/600' },
  { id: '4', title: 'Corrida Turbo 3D', status: 'EM BREVE', color: '#2980B9', imageUrl: 'https://picsum.photos/id/1076/800/600' },
  { id: '5', title: 'Fúria dos Dragões', status: 'EM BREVE', color: '#8E44AD', imageUrl: 'https://picsum.photos/id/1084/800/600' },
  { id: '6', title: 'Estratégia Galáctica', status: 'EM BREVE', color: colors.primary, imageUrl: 'https://picsum.photos/id/1096/800/600' },
];

interface HomeScreenProps {
  onLogout: () => void;
  onGameSelect: (gameTitle: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout, onGameSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);

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

  const handleTabPress = (tabName: string) => {
      Alert.alert("Navegação", `Abrindo ${tabName}... (Funcionalidade em breve)`);
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
                    <TouchableOpacity
                        style={styles.gameCard}
                        onPress={() => handleGamePress(game)}
                        activeOpacity={0.9}
                    >
                        {/* Imagem de Fundo */}
                        <Image
                            source={{ uri: game.imageUrl }}
                            style={styles.cardImage}
                            resizeMode="cover"
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

                            <View style={styles.playButton}>
                                <Text style={styles.playButtonText}>JOGAR AGORA</Text>
                                <Ionicons name="play-circle" size={24} color="white" style={{marginLeft: 5}} />
                            </View>
                        </View>

                        {/* Borda Neon */}
                        <View style={[styles.neonBorder, { borderColor: itemColor }]} />
                    </TouchableOpacity>
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

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
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
      justifyContent: 'flex-start', // Começa do topo
      paddingTop: 20,
  },
  sectionTitleContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 15,
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
  },
  carouselContainer: {
      height: height * 0.55, // Reduzido para ficar mais compacto
      alignItems: 'center',
  },
  scrollContent: {
      alignItems: 'center',
  },
  slideWrapper: {
      width: width, // O container do slide tem a largura total
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
  },

  // --- ESTILO DO CARD GIGANTE ---
  gameCard: {
      width: width * 0.8, // 80% da largura da tela para um bom destaque sem ocupar tudo
      height: '90%',
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      position: 'relative',
      // Transformação para simular o paralelogramo de forma sutil se desejar,
      // mas em carrossel paginado, cards retos costumam funcionar melhor.
      // Se quiser inclinado, descomente a linha abaixo:
      // transform: [{ skewY: '-2deg' }],
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
      borderTopWidth: 1,
      borderTopColor: '#222',
      justifyContent: 'space-around',
      alignItems: 'center',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: 10, 
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