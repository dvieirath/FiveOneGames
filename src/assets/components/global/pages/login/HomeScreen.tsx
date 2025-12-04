import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Image, Dimensions, Alert } from 'react-native';
// Importação de ícones do pacote padrão do Expo (se você estiver usando Expo)
// Se não estiver usando Expo, precisará instalar 'react-native-vector-icons'
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons'; 

const LOCAL_LOGO_PATH = require('../../../../FiveOneLogo.png'); 
const { width } = Dimensions.get('window');

// CORES - TEMA LARANJA NEON
const colors = {
  primary: '#fc4b08',     // Laranja Neon
  background: '#000000',  // Preto Absoluto
  text: '#F5F5F5',        // Texto Claro
  cardBackground: '#111111', 
  secondary: '#FF4081',   
  border: '#fc4b08',      
  darkOverlay: 'rgba(0,0,0,0.6)', // Para escurecer imagens de fundo
  tabBarBackground: '#0a0a0a', // Fundo um pouco mais claro para a barra inferior
};

// Dados simulados ATUALIZADOS com imagens de placeholder
// OBS: Em um app real, você usaria suas próprias imagens.
const gameData = [
  { id: '1', title: 'Jogo da Memória', status: 'Novo', color: '#16A085', imageUrl: 'https://picsum.photos/id/237/500/300' },
  { id: '2', title: 'Quiz', status: 'Popular', color: '#E74C3C', imageUrl: 'https://picsum.photos/id/1040/500/300' },
  { id: '3', title: 'Puzzle de Código', status: 'EM BREVE', color: '#F39C12', imageUrl: 'https://picsum.photos/id/1073/500/300' },
  { id: '4', title: 'Corrida Turbo 3D', status: 'EM BREVE', color: '#2980B9', imageUrl: 'https://picsum.photos/id/1076/500/300' },
  { id: '5', title: 'Fúria dos Dragões', status: 'EM BREVE', color: '#8E44AD', imageUrl: 'https://picsum.photos/id/1084/500/300' },
  { id: '6', title: 'Estratégia Galáctica', status: 'EM BREVE', color: colors.primary, imageUrl: 'https://picsum.photos/id/1096/500/300' },
];

const customAlert = (title: string, message: string) => {
    // Usando Alert nativo para melhor feedback visual
    Alert.alert(title, message);
};

interface HomeScreenProps {
  onLogout: () => void;
  // Nova prop para lidar com a seleção do jogo e navegação no App.tsx
  onGameSelect: (gameTitle: string) => void; 
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout, onGameSelect }) => {

  const handleGamePress = (game: typeof gameData[0]) => {
    // Normaliza para maiúsculas para garantir a comparação
    if (game.status.toUpperCase() === 'EM BREVE') {
        // Alerta específico para jogos em produção
        Alert.alert("Em Produção", "Este jogo estará disponível em breve!");
    } else {
        // Verifica se é um dos jogos implementados para iniciar a navegação
        if (game.title === 'Jogo da Memória' || game.title === 'Quiz') {
            onGameSelect(game.title);
        } else {
            // Para outros jogos disponíveis mas sem tela ainda
            customAlert("Jogo", `Iniciando o jogo: ${game.title}`);
        }
    }
  };

  const handleTabPress = (tabName: string) => {
      customAlert("Navegação", `Abrindo ${tabName}... (Funcionalidade em breve)`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* HEADER PRINCIPAL (Mantido) */}
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

      {/* Conteúdo principal */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Selecione seu Jogo</Text>
        
        <View style={styles.gameListContainer}>
          {gameData.map((game, index) => {
             // Mantemos a inclinação alternada para estilo, mas sem sobreposição
             const skewValue = '-10deg'; // Inclinação padrão para todos
             const reverseSkewValue = '10deg'; // Reversão para conteúdo reto
             const itemColor = game.color === colors.primary ? colors.border : game.color;

             return (
            <TouchableOpacity 
              key={game.id} 
              style={styles.bannerWrapper}
              onPress={() => handleGamePress(game)}
              activeOpacity={0.8}
            >
              {/* O Container Inclinado que corta a imagem */}
              <View style={[
                  styles.angledContainer, 
                  { 
                    transform: [{ skewX: skewValue }], // Usando skewX para inclinação horizontal (estilo paralelogramo)
                    borderColor: itemColor,
                  }
              ]}>
                  {/* Imagem de Fundo (com inclinação reversa para parecer reta) */}
                  <Image 
                    source={{ uri: game.imageUrl }} 
                    style={[styles.bannerImage, { transform: [{ skewX: reverseSkewValue }, { scale: 1.2 }] }]} 
                    resizeMode="cover"
                  />
                  {/* Overlay escuro */}
                  <View style={[styles.darkImageOverlay, { transform: [{ skewX: reverseSkewValue }, { scale: 1.3 }] }]} />
              </View>
              
              {/* Conteúdo de Texto (Título e Status) sobreposto e reto */}
              <View style={styles.bannerTextContent}>
                  <Text style={[styles.bannerTitle, styles.textShadow]}>{game.title}</Text>
                  
                  <View style={[
                      styles.statusBadge, 
                      { backgroundColor: itemColor + '60', borderColor: itemColor }
                    ]}>
                    <Text style={[
                        styles.cardStatus, 
                        { color: colors.text }
                      ]}>{game.status}</Text>
                  </View>
              </View>
              
              {/* Borda Neon Brilhante Externa */}
              <View style={[styles.neonBorderOverlay, { borderColor: itemColor, transform: [{ skewX: skewValue }] }]} />

            </TouchableOpacity>
          )})}
        </View>
      </ScrollView>

      {/* --- BARRA DE NAVEGAÇÃO INFERIOR --- */}
      <View style={styles.bottomTabBar}>
          {/* Aba Amigos */}
          <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('Amigos')}>
              <FontAwesome5 name="user-friends" size={24} color={colors.primary} style={styles.tabIconShadow} />
              <Text style={styles.tabLabel}>Amigos</Text>
          </TouchableOpacity>

          {/* Aba Home (Ativa - Apenas visual neste exemplo já que estamos na home) */}
          <TouchableOpacity style={styles.tabItem}>
              <View style={styles.activeTabIndicator}>
                <MaterialIcons name="home" size={28} color="white" />
              </View>
          </TouchableOpacity>

          {/* Aba Conquistas */}
          <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('Conquistas')}>
              <FontAwesome5 name="trophy" size={24} color={colors.primary} style={styles.tabIconShadow} />
              <Text style={styles.tabLabel}>Conquistas</Text>
          </TouchableOpacity>

          {/* Aba Notificações */}
          <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('Notificações')}>
              <Ionicons name="notifications" size={26} color={colors.primary} style={styles.tabIconShadow} />
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
  },
  headerSpacer: {
    width: 60, 
  },
  logoContainer: {
    alignItems: 'center',
    flexGrow: 1, 
  },
  logo: {
    width: 90,  // Aumentado para 90 conforme solicitado
    height: 90, // Aumentado para 90 conforme solicitado
    marginBottom: 5,
  },
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
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  logoutButton: {
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#1a1a1a', 
    width: 60, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '50',
  },
  logoutText: {
    color: colors.primary, 
    fontWeight: 'bold',
    fontSize: 11,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 100, // Espaço extra para a barra inferior não cobrir o último item
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 30,
    marginLeft: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  gameListContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  // --- ESTILOS DOS BANNERS RETOS/PARALELOGRAMOS ---
  bannerWrapper: {
    width: width - 40, // Largura total menos margens laterais
    height: 100, // Altura reduzida para 100 (mais compacto)
    marginBottom: 20, // Espaço vertical entre os itens (sem sobreposição)
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  angledContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cardBackground,
    overflow: 'hidden', 
    borderWidth: 2,
    borderRadius: 6,
    
    // Sombra Neon no container
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  darkImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.darkOverlay,
  },
  bannerTextContent: {
    position: 'absolute',
    left: 40, // Ajustado para compensar a inclinação visual
    bottom: 20,
    zIndex: 5, 
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  cardStatus: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Camada extra para um brilho neon externo
  neonBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: colors.primary,
    opacity: 0.4,
    zIndex: -1,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  // --- ESTILOS DA BARRA INFERIOR ---
  bottomTabBar: {
      flexDirection: 'row',
      backgroundColor: colors.tabBarBackground,
      height: 70,
      borderTopWidth: 1,
      borderTopColor: '#333',
      justifyContent: 'space-around',
      alignItems: 'center',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: 10, // Para lidar com áreas seguras em alguns dispositivos
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
  },
  tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
  },
  tabLabel: {
      color: '#888',
      fontSize: 10,
      marginTop: 4,
      fontWeight: '600',
  },
  tabIconShadow: {
      textShadowColor: colors.primary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
  },
  activeTabIndicator: {
      backgroundColor: colors.primary,
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -20, // Efeito de botão flutuante
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 2,
      borderColor: '#000',
  }
});

export default HomeScreen;