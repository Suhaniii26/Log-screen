import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Vibration,
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
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!activityName.trim()) {
      newErrors.activityName = 'Activity name is required.';
    }
    if (!activityType) {
      newErrors.activityType = 'Please select an activity type.';
    }
    const parsedDistance = parseFloat(distance);
    if (!distance.trim() || isNaN(parsedDistance) || parsedDistance <= 0) {
      newErrors.distance = 'Please enter a valid distance greater than 0.';
    }
    if (!difficulty) {
      newErrors.difficulty = 'Please select a difficulty level.';
    }
    return newErrors;
  };

  const isFormValid = () => {
    return Object.keys(validate()).length === 0;
  };

  const resetForm = () => {
    setActivityName('');
    setActivityType(null);
    setDistance('');
    setDifficulty(null);
    setExpectedXp(null);
    setErrors({});
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert('Incomplete Form', 'Please fill in all required fields.');
      return;
    }
    setErrors({});
    setIsSaving(true);

    try {
      const earnedXp = expectedXp ?? XP_RULES[difficulty].base;
      const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

      // --- 1. Save adventure ---
      const adventuresRaw = await AsyncStorage.getItem('@travelgram/adventures');
      const adventures = adventuresRaw ? JSON.parse(adventuresRaw) : [];

      const newAdventure = {
        name: activityName.trim(),
        type: activityType,
        distance: parseFloat(distance),
        difficulty,
        xp: earnedXp,
        date: today,
      };

      adventures.push(newAdventure);
      await AsyncStorage.setItem('@travelgram/adventures', JSON.stringify(adventures));

      // --- 2. Update user totalXP ---
      const userRaw = await AsyncStorage.getItem('@travelgram/user');
      const user = userRaw ? JSON.parse(userRaw) : { username: '', totalXP: 0 };
      user.totalXP = (user.totalXP || 0) + earnedXp;
      await AsyncStorage.setItem('@travelgram/user', JSON.stringify(user));

      // --- 3. Vibrate + success alert then clear form ---
      Vibration.vibrate(100);
      Alert.alert(
        'Adventure Logged! 🎉',
        `You earned ${earnedXp} XP 🎉`,
        [{ text: 'Awesome!', onPress: resetForm }]
      );
    } catch (e) {
      Alert.alert('Error', 'Something went wrong while saving. Please try again.');
      console.error('@travelgram save error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (submitted) {
      setErrors(validate());
    }
  }, [activityName, activityType, distance, difficulty]);

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
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
          style={[styles.input, errors.activityName && styles.inputError]}
          placeholder="e.g. Sunrise ridge hike"
          placeholderTextColor={colors.textMuted || '#6b7280'}
          value={activityName}
          onChangeText={setActivityName}
        />
        {errors.activityName && (
          <Text style={styles.errorText}>{errors.activityName}</Text>
        )}
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
        {errors.activityType && (
          <Text style={styles.errorText}>{errors.activityType}</Text>
        )}
      </View>

      {/* Distance */}
      <View style={styles.section}>
        <Text style={styles.label}>Distance (km)</Text>
        <TextInput
          style={[styles.input, errors.distance && styles.inputError]}
          placeholder="0.0"
          placeholderTextColor={colors.textMuted || '#6b7280'}
          keyboardType="numeric"
          value={distance}
          onChangeText={setDistance}
        />
        {errors.distance && (
          <Text style={styles.errorText}>{errors.distance}</Text>
        )}
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
        {errors.difficulty && (
          <Text style={styles.errorText}>{errors.difficulty}</Text>
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
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!isFormValid() || isSaving) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>✓  Log Adventure</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
    </TouchableWithoutFeedback>
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
    marginBottom: 20,
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
    fontWeight: '700',
    color: '#FF6B35',
    textAlign: 'center',
    letterSpacing: 0.3,
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
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    width: '100%',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
});