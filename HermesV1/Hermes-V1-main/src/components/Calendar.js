import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

function getMonthMatrix(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const startWeekday = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const matrix = [];
  let day = 1 - startWeekday; // start from Sunday of the first week
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(year, monthIndex, day);
      const inMonth = date.getMonth() === monthIndex;
      week.push({ date, inMonth });
      day++;
    }
    matrix.push(week);
  }
  return matrix;
}

export default function Calendar({ year, month, markedDates = [], onSelectDate }) {
  const [selected, setSelected] = useState(null);
  const matrix = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const markedSet = useMemo(() => new Set(markedDates), [markedDates]);

  const weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const header = `${months[month]} ${year}`;

  const handlePress = (date) => {
    const iso = date.toISOString().slice(0,10);
    setSelected(iso);
    onSelectDate?.(iso);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{header}</Text>
      <View style={styles.weekRow}>
        {weekdays.map((w) => (
          <Text key={w} style={styles.weekLabel}>{w}</Text>
        ))}
      </View>
      {matrix.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map(({ date, inMonth }, di) => {
            const iso = date.toISOString().slice(0,10);
            const isMarked = markedSet.has(iso);
            const isSelected = selected === iso;
            return (
              <TouchableOpacity key={di} style={[styles.day, !inMonth && styles.dayMuted, isSelected && styles.daySelected]} onPress={() => handlePress(date)}>
                <Text style={[styles.dayText, !inMonth && styles.dayTextMuted]}>{date.getDate()}</Text>
                {isMarked && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.gray, borderRadius: 12, padding: 12 },
  header: { color: colors.white, fontSize: 18, marginBottom: 8, textAlign: 'center' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  weekLabel: { color: '#9CA3AF', width: 36, textAlign: 'center' },
  day: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  dayMuted: { opacity: 0.3 },
  daySelected: { backgroundColor: '#0EA5E9' },
  dayText: { color: colors.white },
  dayTextMuted: { color: '#D1D5DB' },
  dot: { position: 'absolute', bottom: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.cyan },
});