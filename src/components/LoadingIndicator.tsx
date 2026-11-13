// src/components/LoadingIndicator.tsx
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
  message?: string;
}

export default function LoadingIndicator({ message = 'Memuat data briefing...' }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#FF5500" />
        <Text style={styles.title}>MEMPERBARUI DATA</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    width: '90%',
  },
  title: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FF5500',
    letterSpacing: 1.5,
    marginTop: 14,
  },
  message: {
    fontSize: 13,
    color: '#8E97A8',
    marginTop: 4,
    textAlign: 'center',
  },
});
