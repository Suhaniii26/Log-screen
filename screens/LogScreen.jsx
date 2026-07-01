import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
const colors = { textMuted: '#6b7280' };

const ACTIVITY_TYPES = [
  { key: 'hike', label: 'Hike', icon: '🥾' },
  { key: 'ride', label: 'Ride', icon: '🚴' },
  { key: 'run', label: 'Run', icon: '🏃' },
  { key: 'other', label: 'Other', icon: '⚡' },
];

const DIFFICULTY_LABELS = {
  1: 'Easy',
  2: 'Moderate',
  3: 'Moderate',
  4: 'Hard',
  5: 'Epic',
};

const XP_RULES = {
  1: { base: 100, perKm: 5 },
  2: { base: 200, perKm: 10 },
  3: { base: 200, perKm: 10 },
  4: { base: 350, perKm: 15 },
  5: { base: 500, perKm: 20 },
};

export default function LogScreen() {
  const [activityName, setActivityName] = useState('');
  const [activityType, setActivityType] = useState(null);
  const [distance, setDistance] = useState('');
  const [difficulty, setDifficulty] = useState(null);
  const [expectedXp, setExpectedXp] = useState(null);

  useEffect(() => {
    if (!difficulty || !XP_RULES[difficulty]) {
      setExpectedXp(null);
      return;
    }

    const { base, perKm } = XP_RULES[difficulty];
    const parsedDistance = parseFloat(distance);
    const hasValidDistance = !isNaN(parsedDistance) && parsedDistance > 0;

    const xp = hasValidDistance
      ? Math.round(base + perKm * parsedDistance)
      : base;

    setExpectedXp(xp);
  }, [difficulty, distance]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Log Activity</Text>
        <Text style={styles.subtitle}>
          Record your latest conquest and earn XP.
        </Text>
      </View>

      {/* Activity Name */}
      <View style={styles.section}>
        <Text style={styles.label}>Activity Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Sunrise ridge hike"
          placeholderTextColor={colors.textMuted || '#6b7280'}
          value={activityName}
          onChangeText={setActivityName}
        />
      </View>

      {/* Activity Type */}
      <View style={styles.section}>
        <Text style={styles.label}>Activity Type</Text>
        <View style={styles.typeGrid}>
          {ACTIVITY_TYPES.map((type) => {
            const selected = activityType === type.key;
            return (
              <TouchableOpacity
                key={type.key}
                style={[styles.typeButton, selected && styles.typeButtonSelected]}
                onPress={() => setActivityType(type.key)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    selected && styles.typeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Distance */}
      <View style={styles.section}>
        <Text style={styles.label}>Distance (km)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.0"
          placeholderTextColor={colors.textMuted || '#6b7280'}
          keyboardType="numeric"
          value={distance}
          onChangeText={setDistance}
        />
      </View>

      {/* Difficulty */}
      <View style={styles.section}>
        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.difficultyRow}>
          {[1, 2, 3, 4, 5].map((level) => {
            const selected = difficulty === level;
            return (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyButton,
                  selected && styles.difficultyButtonSelected,
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text
                  style={[
                    styles.difficultyNumber,
                    selected && styles.difficultyNumberSelected,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {difficulty && (
          <Text style={styles.difficultyText}>
            {DIFFICULTY_LABELS[difficulty]}
          </Text>
        )}
      </View>

      {/* Expected XP Card */}
      <View style={styles.xpCard}>
        <Text style={styles.xpLabel}>Expected XP</Text>
        <Text style={styles.xpValue}>
          {expectedXp !== null ? `${expectedXp} XP` : '— XP'}
        </Text>
      </View>

      {/* Add Photo */}
      <View style={styles.section}>
        <Text style={styles.label}>Add Photo (Optional)</Text>
        <TouchableOpacity style={styles.photoArea}>
          <Text style={styles.photoIcon}>📷</Text>
          <Text style={styles.photoText}>Tap to add a photo</Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>✓  Log Adventure</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1a1d27',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#262a36',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeButton: {
    width: '48%',
    backgroundColor: '#1a1d27',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262a36',
  },
  typeButtonSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  typeIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  typeLabelSelected: {
    color: '#FFFFFF',
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 4,
    backgroundColor: '#1a1d27',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#262a36',
  },
  difficultyButtonSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  difficultyNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D1D5DB',
  },
  difficultyNumberSelected: {
    color: '#FFFFFF',
  },
  difficultyText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  xpCard: {
    backgroundColor: '#1a1d27',
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#262a36',
  },
  xpLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#00C9A7',
  },
  photoArea: {
    borderWidth: 2,
    borderColor: '#2e333f',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14161f',
  },
  photoIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  photoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});