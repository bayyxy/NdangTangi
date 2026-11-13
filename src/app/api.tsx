// src/app/api.tsx
// Pola dibuat 100% IDENTIK dengan src/app/briefing/index.tsx
// Saat live coding demo, kamu cuma perlu ganti baris yang ada tanda ⚠️

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';

export default function ApiScreen() {
  // 1. STATE (PERSIS DENGAN BRIEFING)
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2. FUNGSI ASYNC FETCH (PERSIS DENGAN BRIEFING)
  const loadData = async () => {
    try {
      setErrorMessage(null);

      // ⚠️ GANTI URL API DI SINI JIKA SOALNYA BEDA
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
      const json = await response.json();
      setData(json);

    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghubungi server API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 3. USEEFFECT (TRIGGER FETCH SAAT BUKA HALAMAN)
  useEffect(() => {
    loadData();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0B0C10', padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadData(); }}
          tintColor="#FF5500"
        />
      }
    >
      {/* 4. RENDER: LOADING -> ERROR -> DATA */}
      {loading ? (
        <LoadingIndicator message="Mengambil data dari API..." />
      ) : errorMessage ? (
        <ErrorMessage message={errorMessage} onRetry={loadData} />
      ) : (
        data.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor: '#15171E',
              borderWidth: 1,
              borderColor: '#232733',
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
            }}
          >
            {/* ⚠️ GANTI FIELD TAMPILAN SESUAI SOAL ASLAB */}
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
            <Text style={{ color: '#FF5500', fontSize: 13, marginTop: 4 }}>✉ {item.email}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
