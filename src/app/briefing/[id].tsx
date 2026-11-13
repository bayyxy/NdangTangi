// src/app/briefing/[id].tsx
// Layar Detail Panduan Kesiapan Pagi (Modul 2: Dynamic Route [id].tsx & Modul 3: Async Promise)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { CampusTip } from '../../types/briefing';
import { fetchTipDetail } from '../../services/briefingService';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';

export default function TipDetailScreen() {
  // Mengambil parameter dinamis "id" dari URL menggunakan useLocalSearchParams (Modul 2)
  const { id } = useLocalSearchParams<{ id: string }>();

  const [tip, setTip] = useState<CampusTip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    // Menerapkan .then() dan .catch() dari Promise (Kriteria Penilaian Modul 3 Halaman 24)
    fetchTipDetail(id)
      .then((result) => {
        setTip(result);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Panduan tidak ditemukan.');
        setLoading(false);
      });
  }, [id]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Navigasi Balik */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backPill}
          onPress={() => router.back()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke daftar briefing"
        >
          <Text style={styles.backPillText}>← KEMBALI</Text>
        </TouchableOpacity>
        <Text style={styles.paramTag}>RUTE: /briefing/{id}</Text>
      </View>

      {loading ? (
        <LoadingIndicator message="Mengambil konten detail artikel..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => router.back()} />
      ) : tip ? (
        <View style={styles.articleCard}>
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{tip.category.toUpperCase()}</Text>
            </View>
            <Text style={styles.readTimeText}>{tip.readTime} baca</Text>
          </View>

          <Text style={styles.title}>{tip.title}</Text>
          <Text style={styles.summary}>{tip.summary}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>PENJELASAN PRAKTIS</Text>
          <Text style={styles.bodyContent}>{tip.content}</Text>

          <View style={styles.actionSection}>
            <Text style={styles.sectionHeader}>DAFTAR CHECKLIST TINDAKAN</Text>
            {tip.actionItems.map((action, index) => (
              <View key={index} style={styles.actionItemRow}>
                <View style={styles.checkboxIndicator}>
                  <Text style={styles.checkGlyph}>✓</Text>
                </View>
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </View>

          {/* Selesai Membaca Button */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Selesai membaca dan kembali"
          >
            <Text style={styles.doneButtonText}>SELESAI MEMBACA</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Footer Mahasiswa */}
      <View style={styles.footer}>
        <Text style={styles.footerAuthor}>Bayu Adi Nugroho</Text>
        <Text style={styles.footerNim}>NIM: 202410370110193</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C10',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backPill: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backPillText: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  paramTag: {
    color: '#6F788B',
    fontSize: 11,
    fontWeight: '600',
  },
  articleCard: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 85, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.3)',
  },
  categoryText: {
    color: '#FF5500',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  readTimeText: {
    color: '#8E97A8',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
    marginBottom: 8,
  },
  summary: {
    color: '#8E97A8',
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E2330',
    marginVertical: 16,
  },
  sectionHeader: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  bodyContent: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionSection: {
    backgroundColor: '#0F1118',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5500',
    marginBottom: 20,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  checkboxIndicator: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkGlyph: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
  },
  actionText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
  doneButton: {
    backgroundColor: '#FF5500',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerAuthor: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  footerNim: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
