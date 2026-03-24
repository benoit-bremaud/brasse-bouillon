// app/(tabs)/index.tsx

import { Image, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/services/api';
import { useEffect } from 'react';

export default function HomeScreen() {
  useEffect(() => {
    api.get('/ping')
      .then((res) => console.log('✅ Réponse API :', res.data))
      .catch((err) => console.error('❌ Erreur API :', err.message));
  }, []);
  
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/icon.png')} // tu peux remplacer par un autre visuel plus tard
        style={styles.logo}
      />
      <Text style={styles.title}>Bienvenue sur Brasse-Bouillon 🍻</Text>
      <Text style={styles.subtitle}>
        L’application dédiée aux brasseurs amateurs !
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffdf7',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
