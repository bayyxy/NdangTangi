// src/components/TipCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CampusTip } from '../types/briefing';

interface Props {
  tip: CampusTip;
}

export default function TipCard({ tip }: Props) {
  const handlePress = () => {
    router.push(`/briefing/${tip.id}`);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Buka artikel: ${tip.title}`}
    >
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{tip.category.toUpperCase()}</Text>
        </View>
        <Text style={styles.readTimeText}>{tip.readTime}</Text>
      </View>

      <Text style={styles.title}>{tip.title}</Text>
      <Text style={styles.summary} numberOfLines={2}>
        {tip.summary}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.actionCount}>
          {tip.actionItems.length} poin aksi persiapan
        </Text>
        <Text style={styles.readMore}>BACA DETAIL →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 85, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.3)',
  },
  categoryText: {
    color: '#FF5500',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  readTimeText: {
    color: '#6F788B',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 6,
  },
  summary: {
    color: '#8E97A8',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E2330',
  },
  actionCount: {
    color: '#6F788B',
    fontSize: 11,
    fontWeight: '600',
  },
  readMore: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
