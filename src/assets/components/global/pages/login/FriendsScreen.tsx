import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const colors = {
  primary: '#fc4b08',
  background: '#000000',
  text: '#F5F5F5',
  card: '#111111',
  border: '#fc4b08',
};

const initialFriends = [
  { id: '1', name: 'Lucas Silva' },
  { id: '2', name: 'Ana Paula' },
  { id: '3', name: 'João Pedro' },
  { id: '4', name: 'Marina Costa' },
];

const FriendsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [friends, setFriends] = useState(initialFriends);
  const [newFriendId, setNewFriendId] = useState('');
  const [newFriendName, setNewFriendName] = useState('');

  const addFriend = () => {
    if (newFriendName.trim().length > 0) {
      const id = newFriendId.trim().length > 0 ? newFriendId : Date.now().toString();
      setFriends([...friends, { id, name: newFriendName }]);
      setNewFriendId('');
      setNewFriendName('');
    }
  };

  const removeFriend = (id: string) => {
    setFriends(friends.filter(friend => friend.id !== id));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Amigos</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="ID (Opcional)"
          placeholderTextColor="#888"
          value={newFriendId}
          onChangeText={setNewFriendId}
        />
        <TextInput
          style={[styles.input, { marginLeft: 8 }]}
          placeholder="Nome do amigo"
          placeholderTextColor="#888"
          value={newFriendName}
          onChangeText={setNewFriendName}
        />
        <TouchableOpacity style={styles.addButton} onPress={addFriend}>
          <FontAwesome5 name="user-plus" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={friends}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome5 name="user" size={20} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={styles.friendName}>{item.name}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFriend(item.id)} style={styles.deleteButton}>
              <FontAwesome5 name="trash" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 30,
    borderWidth: 2,
    borderColor: colors.primary,
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backButton: {
    padding: 6,
  },
  title: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
  },
  friendName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
});

export default FriendsScreen;
