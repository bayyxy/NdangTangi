import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function NotesScreen() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      Alert.alert('Perhatian', 'Isi catatan tidak boleh kosong.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('notes').insert([{ content: trimmed }]);
    setLoading(false);

    if (error) {
      Alert.alert('Gagal Menyimpan', error.message);
      return;
    }

    setContent('');
    Alert.alert('Berhasil', 'Catatan berhasil disimpan ke Supabase.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tulis Catatan</Text>

      <TextInput
        style={styles.input}
        placeholder="Tulis catatan di sini..."
        placeholderTextColor="#6F788B"
        value={content}
        onChangeText={setContent}
        multiline
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Simpan</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C10',
    padding: 20,
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 10,
    color: '#FFFFFF',
    padding: 14,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FF5500',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
