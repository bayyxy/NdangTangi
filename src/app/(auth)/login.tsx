// src/app/(auth)/login.tsx
// Halaman Autentikasi (Daftar & Masuk) menggunakan Supabase Auth + SecureStore

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggleMode = () => {
    setIsRegistering((prev) => !prev);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleAuth = async () => {
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanNim = nim.trim();

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!cleanEmail) {
      setErrorMessage('Alamat email wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    if (isRegistering && !cleanName) {
      setErrorMessage('Nama lengkap wajib diisi saat mendaftar.');
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              nim: cleanNim || '-',
              prodi: 'Teknik Informatika',
              semester: '5',
              university: 'Universitas Muhammadiyah Malang',
              role: 'student',
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
        } else if (data.session) {
          setSuccessMessage('Pendaftaran berhasil! Mengarahkan ke beranda...');
        } else {
          setSuccessMessage(
            'Akun berhasil dibuat. Silakan cek email verifikasi atau langsung masuk jika konfirmasi email dinonaktifkan.'
          );
          setIsRegistering(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
        }
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Terjadi gangguan jaringan. Coba lagi.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandHeader}>
          <View style={styles.brandBadge}>
            <View style={styles.brandDot} />
            <Text style={styles.brandBadgeText}>NDANG TANGI ACCESS</Text>
          </View>
          <Text style={styles.appTitle}>
            {isRegistering ? 'Buat Akun Baru' : 'Masuk ke NdangTangi'}
          </Text>
          <Text style={styles.appSubtitle}>
            {isRegistering
              ? 'Sinkronkan jadwal tugas dan progres kuliah ke akun cloud pribadimu.'
              : 'Masuk untuk mengakses alarm bangun pagi dan jadwal tugas tersinkronisasi.'}
          </Text>
        </View>

        <View style={styles.card}>
          {isRegistering && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>NAMA LENGKAP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Bayu Adi Nugroho"
                  placeholderTextColor="#5C667A"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>NIM (OPSIONAL)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 202410370110193"
                  placeholderTextColor="#5C667A"
                  value={nim}
                  onChangeText={setNim}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="nama@webmail.umm.ac.id"
              placeholderTextColor="#5C667A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              editable={!loading}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>KATA SANDI</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#5C667A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType={isRegistering ? 'newPassword' : 'password'}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
                }
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#8E97A8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={isRegistering ? 'Daftar Akun' : 'Masuk ke Aplikasi'}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isRegistering ? 'Daftar & Masuk' : 'Masuk Sekarang'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeBtn}
            onPress={toggleMode}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.switchModeText}>
              {isRegistering ? 'Sudah punya akun? ' : 'Belum punya akun? '}
              <Text style={styles.switchModeHighlight}>
                {isRegistering ? 'Masuk di sini' : 'Daftar di sini'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#8E97A8" />
          <Text style={styles.securityNoteText}>
            Sesi dilindungi Supabase JWT & Expo SecureStore
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B0C10',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 40,
  },
  brandHeader: {
    marginBottom: 24,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255, 85, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5500',
  },
  brandBadgeText: {
    color: '#FF5500',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    color: '#8E97A8',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 20,
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#8E97A8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0B0C10',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#FFFFFF',
    fontSize: 14,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0C10',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#FFFFFF',
    fontSize: 14,
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    flex: 1,
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  submitButton: {
    backgroundColor: '#FF5500',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  switchModeBtn: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchModeText: {
    color: '#8E97A8',
    fontSize: 13,
    fontWeight: '500',
  },
  switchModeHighlight: {
    color: '#FF5500',
    fontWeight: '800',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
  },
  securityNoteText: {
    color: '#6F788B',
    fontSize: 11,
    fontWeight: '600',
  },
});
