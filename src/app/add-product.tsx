import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

// 1. Interface Product (Kriteria Interface Modul 3)
export interface Product {
  mouse: string;
  keyboard: string;
  monitor: string;
}

// 2. Custom Async Function menggunakan Promise dan resolve (Kriteria Modul 3)
export function pengambilan_barang(): Promise<Product> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        mouse: 'Logitech G Pro Wireless',
        keyboard: 'Keychron K2 Mechanical Keyboard',
        monitor: 'LG UltraGear 24 Inch 144Hz',
      });
    }, 3000); // Delay 3000ms (3 detik)
  });
}

// 3. React Component untuk menampilkan hasil data pengambilan barang
export default function AddProductScreen() {
  const [barang, setBarang] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Memanggil custom async function dengan Promise .then()
    pengambilan_barang()
      .then((hasil: Product) => {
        setBarang(hasil);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Kembali ke layar sebelumnya"
      >
        <Text style={styles.backButtonText}>← Kembali</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Pengambilan Produk / Barang</Text>
      <Text style={styles.subtitle}>
        Hasil simulasi custom async function (Promise & resolve 3 detik)
      </Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FF5500" />
          <Text style={styles.loadingText}>
            Sedang mengambil data barang asinkron (3 detik)...
          </Text>
        </View>
      ) : barang ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daftar Perangkat Diambil:</Text>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Mouse</Text>
            <Text style={styles.itemValue}>{barang.mouse}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Keyboard</Text>
            <Text style={styles.itemValue}>{barang.keyboard}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Monitor</Text>
            <Text style={styles.itemValue}>{barang.monitor}</Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1118',
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1E2330',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FF5500',
    fontWeight: '700',
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 24,
  },
  loadingBox: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15171E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2330',
  },
  loadingText: {
    color: '#8E8E93',
    marginTop: 14,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#15171E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E2330',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5500',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2330',
  },
  itemLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  itemValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
