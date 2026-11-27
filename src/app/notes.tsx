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
    if (!content.trim()) {
      Alert.alert('');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('notes').insert([{ content }]);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tulis Catatan</Text>

      <TextInput
        style={styles.input}
        placeholder=""
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 48,
  },
  topHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#8E97A8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#15171E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#232733',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E97A8',
    letterSpacing: 1.2,
  },
  sectionSubDesc: {
    fontSize: 12,
    color: '#6F788B',
    marginBottom: 14,
    marginTop: 2,
    lineHeight: 17,
  },
  relativeNotice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5500',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  timeUnitBlock: {
    alignItems: 'center',
    gap: 8,
  },
  stepperButton: {
    width: 60,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#1F2430',
    borderWidth: 1,
    borderColor: '#2D3444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  timeDisplayBox: {
    width: 90,
    height: 84,
    backgroundColor: '#0F1117',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    includeFontPadding: false,
  },
  unitSubText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6F788B',
    letterSpacing: 1.5,
    marginTop: -2,
  },
  timeColon: {
    fontSize: 44,
    fontWeight: '900',
    color: '#495266',
    marginTop: -12,
  },
  quickPresetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2430',
  },
  quickPresetBtn: {
    backgroundColor: '#1A1E27',
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#282F3E',
  },
  quickPresetText: {
    color: '#B0B8C8',
    fontSize: 11,
    fontWeight: '700',
  },
  inputField: {
    backgroundColor: '#0F1117',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#262C3A',
    marginTop: 4,
  },
  presetGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presetTextBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  presetText: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: '700',
  },
  presetDivider: {
    color: '#3A4254',
    fontSize: 10,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 4,
  },
  dayButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#1A1E27',
    borderWidth: 1,
    borderColor: '#282F3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#FF5500',
    borderColor: '#FF5500',
  },
  dayButtonText: {
    color: '#7B8496',
    fontSize: 12,
    fontWeight: '800',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  repeatSummaryText: {
    color: '#6F788B',
    fontSize: 12,
    marginTop: 12,
    lineHeight: 16,
  },
  challengeGrid: {
    gap: 10,
  },
  challengeCard: {
    backgroundColor: '#0F1117',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#232938',
  },
  challengeCardActive: {
    borderColor: '#FF5500',
    backgroundColor: 'rgba(255, 85, 0, 0.05)',
  },
  challengeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  challengeBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6F788B',
    letterSpacing: 1,
  },
  challengeBadgeActive: {
    color: '#FF5500',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#384154',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#FF5500',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5500',
  },
  challengeCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DCE2EE',
  },
  challengeTitleActive: {
    color: '#FFFFFF',
  },
  challengeCardDesc: {
    fontSize: 12,
    color: '#7D879C',
    marginTop: 4,
    lineHeight: 16,
  },
  difficultyContainer: {
    gap: 8,
    marginTop: 4,
  },
  difficultyOption: {
    backgroundColor: '#0F1117',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#232938',
  },
  diffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diffName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#CBD3E1',
  },
  diffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  diffDescText: {
    fontSize: 11,
    color: '#6F788B',
    marginTop: 3,
  },
  snoozeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  snoozeInfo: {
    flex: 1,
    paddingRight: 12,
  },
  snoozeSub: {
    fontSize: 12,
    color: '#6F788B',
    marginTop: 4,
    lineHeight: 16,
  },
  saveActionButton: {
    backgroundColor: '#FF5500',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF5500',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  saveActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  studentFooter: {
    color: '#4B5569',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

});
