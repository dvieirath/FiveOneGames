# FiveOneGames

FiveOneGames é uma plataforma de jogos mobile desenvolvida com React Native e Expo, apresentando uma coleção de mini-games interativos, recursos sociais e uma interface moderna com tema neon.

## 🚀 Funcionalidades

### 🎮 Jogos Disponíveis
*   **Jogo da Memória (Memory Game)**:
    *   **Tema**: Futebol (Edição Neymar).
    *   **Recursos**: Animações de virada de cartas, desafios baseados em tempo, sistema de pontuação e progressão de níveis.
    *   **Áudio**: Efeitos sonoros imersivos e música de fundo.
*   **Quiz Game**:
    *   Teste seus conhecimentos em diversas categorias como Esportes, Cinema e Tecnologia.
    *   Perguntas com tempo limite e feedback visual imediato.

### 🔜 Em Breve
*   Puzzle de Código
*   Corrida Turbo 3D
*   Fúria dos Dragões
*   Estratégia Galáctica

### 📱 Recursos do App
*   **Autenticação**: Sistema de login seguro integrado com **Supabase**.
*   **Interface Moderna (UI/UX)**:
    *   Estética "Dark Mode" com destaques em Laranja Neon (`#fc4b08`).
    *   Animações personalizadas (Splash Screen, Telas de Carregamento).
    *   Home Screen interativa com carrossel de jogos e modal de informações.
*   **Social**: Interface para lista de amigos e perfil.

## 🛠 Tech Stack
*   **Framework**: React Native (Expo SDK)
*   **Linguagem**: TypeScript
*   **Backend/Auth**: Supabase
*   **Estilização**: StyleSheet, Expo Vector Icons
*   **Gerenciamento de Estado**: React Hooks (useState, useEffect)

## 📂 Estrutura do Projeto

O projeto passou por uma refatoração completa para seguir os padrões de arquitetura limpa:

```text
src/
├── assets/          # Recursos estáticos
│   ├── images/      # Imagens dos jogos, capas e ícones
│   └── sounds/      # Efeitos sonoros e músicas
├── screens/         # Telas da aplicação
│   ├── HomeScreen.tsx       # Tela principal com carrossel
│   ├── LoginScreen.tsx      # Autenticação
│   ├── MemoryGameScreen.tsx # Lógica do Jogo da Memória
│   ├── QuizGameScreen.tsx   # Lógica do Quiz
│   └── ...
├── services/        # Serviços externos
│   └── supabaseClient.ts    # Configuração do Supabase
└── App.tsx          # Ponto de entrada e roteamento principal
```

## ⚡ Como Rodar o Projeto

1.  **Instale as dependências**:
    ```bash
    npm install
    ```

2.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npx expo start --clear
    ```

3.  **Execute no dispositivo**:
    *   Pressione `a` para abrir no emulador Android.
    *   Pressione `i` para abrir no simulador iOS.
    *   Ou escaneie o QR Code com o app **Expo Go** no seu celular.

## 🔄 Atualizações Recentes (Refatoração)
*   **Reorganização Arquitetural**: Migração de uma estrutura aninhada legada para uma arquitetura plana e semântica em `src/screens`.
*   **Centralização de Assets**: Todos os recursos de mídia foram movidos para `src/assets`.
*   **Correção de Imports**: Todos os caminhos de importação foram atualizados para refletir a nova estrutura.
*   **Limpeza de Código**: Remoção de arquivos e pastas não utilizados.

---
*Desenvolvido por dvieirath*
