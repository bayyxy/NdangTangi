// src/app/briefing/index.tsx
// Layar Utama Briefing Pagi & Cuaca (Modul 3: Async & External API Call)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { BriefingData } from '../../types/briefing';
import { getCompleteBriefing } from '../../services/briefingService';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import TipCard from '../../components/TipCard';

export default function BriefingScreen() {
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ─── FUNGSI FETCH ASYNC DENGAN PROMISE HANDLING (Kriteria Modul 3) ─────────
  const loadBriefingData = useCallback(async () => {
    try {
      setErrorMessage(null);
      const result = await getCompleteBriefing();
      setData(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server API.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBriefingData();
  }, [loadBriefingData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBriefingData();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#FF5500"
          colors={['#FF5500']}
        />
      }
    >
      {/* Header Halaman */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.statusBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>LIVE API DATA</Text>
          </View>
          <Text style={styles.timeTag}>
            {data ? `Pembaruan: ${data.fetchedAt}` : 'Memeriksa server...'}
          </Text>
        </View>

        <Text style={styles.pageTitle}>BRIEFING KESIAPAN PAGI</Text>
        <Text style={styles.pageSubtitle}>
          Prakiraan cuaca real-time kampus dan rekomendasi sebelum berangkat kuliah
        </Text>
      </View>

      {/* Konten Utama: Loading, Error, atau Data */}
      {loading ? (
        <LoadingIndicator message="Mengambil cuaca real-time dari Open-Meteo & quote DummyJSON..." />
      ) : errorMessage ? (
        <ErrorMessage message={errorMessage} onRetry={loadBriefingData} />
      ) : data ? (
        <>
          {/* 1. KARTU CUACA REAL-TIME (OPEN-METEO API) */}
          <View style={styles.weatherCard}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.sectionTag}>SENSOR CUACA SATELLITE</Text>
                <Text style={styles.locationTitle}>Kota Malang (Kampus III UMM)</Text>
              </View>
              <View style={styles.weatherCodeBadge}>
                <Text style={styles.weatherCodeText}>{data.weather.conditionLabel}</Text>
              </View>
            </View>

            <View style={styles.weatherMainRow}>
              <Text style={styles.tempText}>{data.weather.temperature}°C</Text>
              <View style={styles.weatherStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>KELEMBABAN</Text>
                  <Text style={styles.statValue}>{data.weather.humidity}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>KECEPATAN ANGIN</Text>
                  <Text style={styles.statValue}>{data.weather.windSpeed} km/h</Text>
                </View>
              </View>
            </View>

            <View style={styles.adviceBox}>
              <Text style={styles.adviceLabel}>SARAN PERSIAPAN BERANGKAT</Text>
              <Text style={styles.adviceText}>{data.weather.campusAdvice}</Text>
            </View>
          </View>

          {/* 2. KARTU MOTIVASI HARIAN (DUMMYJSON QUOTE API) */}
          <View style={styles.quoteCard}>
            <Text style={styles.sectionTag}>MOTIVASI HARIAN DUMMYJSON API</Text>
            <Text style={styles.quoteText}>{`"${data.quote.quote}"`}</Text>
            <Text style={styles.quoteAuthor}>Penulis: {data.quote.author}</Text>
          </View>

          {/* 3. DAFTAR PANDUAN & TIPS KAMPUS (DYNAMIC ROUTE DEMO) */}
          <View style={styles.tipsSection}>
            <View style={styles.tipsHeaderRow}>
              <Text style={styles.sectionTag}>PANDUAN & AKSI KESIAPAN KULIAH</Text>
              <Text style={styles.tipsCount}>{data.tips.length} Artikel</Text>
            </View>
            <Text style={styles.tipsSub}>
              Ketuk salah satu kartu di bawah untuk membuka halaman dinamis rute [id].tsx
            </Text>

            {data.tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </View>
        </>
      ) : null}

      {/* Tombol Kembali ke Alarm */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Kembali ke Manajemen Alarm"
      >
        <Text style={styles.backButtonText}>← KEMBALI KE MENU ALARM</Text>
      </TouchableOpacity>

      {/* Identitas Mahasiswa */}
      <View style={styles.footer}>
        <Text style={styles.footerName}>Bayu Adi Nugroho</Text>
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
  header: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  timeTag: {
    color: '#6F788B',
    fontSize: 11,
    fontWeight: '600',
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    color: '#8E97A8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF5500',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  weatherCard: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  weatherCodeBadge: {
    backgroundColor: '#1E2330',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2D3446',
  },
  weatherCodeText: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: '700',
  },
  weatherMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2330',
    marginBottom: 12,
  },
  tempText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  weatherStats: {
    gap: 6,
  },
  statItem: {
    alignItems: 'flex-end',
  },
  statLabel: {
    color: '#6F788B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  adviceBox: {
    backgroundColor: '#0F1118',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5500',
  },
  adviceLabel: {
    color: '#6F788B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  adviceText: {
    color: '#8E97A8',
    fontSize: 12,
    lineHeight: 17,
  },
  quoteCard: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 20,
    marginVertical: 8,
  },
  quoteAuthor: {
    color: '#8E97A8',
    fontSize: 11,
    fontWeight: '700',
  },
  tipsSection: {
    marginTop: 4,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipsCount: {
    color: '#6F788B',
    fontSize: 11,
    fontWeight: '600',
  },
  tipsSub: {
    color: '#6F788B',
    fontSize: 11,
    marginBottom: 12,
    marginTop: 2,
  },
  backButton: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 14,
  },
  backButtonText: {
    color: '#FF5500',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1D27',
  },
  footerName: {
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
