import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';

// --- ARQUIVO LOCAL: Caminho da Logo ---
// Assumindo o mesmo caminho relativo usado no LoginScreen (subindo 4 níveis)
const LOCAL_LOGO_PATH = require('../../../../FiveOneLogo.png'); 

// Cores do tema GAMING / DARK MODE
const colors = {
  primary: '#00BCD4',     // Ciano Elétrico
  background: '#121212',  // Fundo Preto/Dark Blue
  text: '#F5F5F5',        // Texto Claro
  cardBackground: '#1E1E1E', // Fundo para os cards de jogos
  secondary: '#FF4081',   // Magenta
};

// Dados simulados para os jogos
const gameData = [
  { id: '1', title: 'Jogo da Memória', status: 'Novo', color: '#16A085' },
  { id: '2', title: 'Batalha Medieval', status: 'Popular', color: '#E74C3C' },
  { id: '3', title: 'Puzzle de Código', status: 'Em Breve', color: '#F39C12' },
  { id: '4', title: 'Corrida Turbo 3D', status: 'Beta', color: '#2980B9' },
  { id: '5', title: 'Fúria dos Dragões', status: 'Novo', color: '#8E44AD' },
  { id: '6', title: 'Estratégia Galáctica', status: 'Multiplayer', color: colors.primary },
];

// Alerta customizado (substituindo o alert() nativo)
const customAlert = (message: string) => {
    // Em um app real, use um modal ou Toast
    console.log(`ALERTA: ${message}`);
};


interface HomeScreenProps {
  onLogout: () => void; // Função para voltar ao login
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {

  const handleGamePress = (gameTitle: string) => {
    customAlert(`Iniciando o jogo: ${gameTitle}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* HEADER PRINCIPAL - Contém a logo centralizada e o botão de SAIR */}
      <View style={styles.header}>
        
        {/* Espaçador esquerdo (para centralizar o logo) */}
        <View style={styles.headerSpacer} /> 

        {/* LOGO CENTRALIZADA */}
        <View style={styles.logoContainer}>
            <Image 
                source={LOCAL_LOGO_PATH} 
                style={styles.logo}
                resizeMode="contain"
            />
            {/* Texto estilizado abaixo do logo */}
            <Text style={styles.logoText}>Five One Games</Text>
        </View>

        {/* Botão de LOGOUT à direita */}
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>SAIR</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo principal com ScrollView para listar os jogos */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Selecione seu Jogo</Text>
        
        <View style={styles.gameGrid}>
          {gameData.map(game => (
            <TouchableOpacity 
              key={game.id} 
              style={[styles.card, { borderColor: game.color }]}
              onPress={() => handleGamePress(game.title)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>{game.title}</Text>
              {/* Badge de Status */}
              <View style={[styles.statusBadge, { backgroundColor: game.color + '40' }]}>
                <Text style={[styles.cardStatus, { color: game.color }]}>{game.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // --- ESTILOS DE HEADER COM LOGO CENTRALIZADA ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15, // Mais espaço no topo
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBackground,
  },
  headerSpacer: {
    width: 60, // Espaçador para balancear o botão SAIR
  },
  logoContainer: {
    alignItems: 'center',
    flexGrow: 1, // Permite que o container cresça
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  logoText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  // --- FIM DOS ESTILOS DE HEADER ---
  
  logoutButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    width: 60, // Largura fixa para balancear
    alignItems: 'center',
  },
  logoutText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 25,
    alignSelf: 'flex-start',
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    width: '48%', // Dois cards por linha
    height: 150,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333', // Borda padrão sutil
    padding: 15,
    marginBottom: 15,
    justifyContent: 'space-between',
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  }
});

export default HomeScreen;