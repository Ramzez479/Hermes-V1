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

// Construye una matriz de semanas que cubre completamente un rango [start, end]
function getRangeMatrix(startIso, endIso) {
  const startDate = new Date(startIso);
  const endDate = new Date(endIso || startIso);
  // Inicio en domingo de la semana de start
  const s = new Date(startDate);
  s.setHours(0, 0, 0, 0);
  s.setDate(s.getDate() - s.getDay());
  // Fin en sábado de la semana de end
  const e = new Date(endDate);
  e.setHours(0, 0, 0, 0);
  e.setDate(e.getDate() + (6 - e.getDay()));

  // Garantizar al menos 5 semanas (35 días visibles) para evitar que se vea "corto"
  const MS = 24 * 60 * 60 * 1000;
  const cells = Math.round((e - s) / MS) + 1; // días mostrados
  if (cells < 35) {
    const minEnd = new Date(s);
    minEnd.setDate(minEnd.getDate() + 34); // domingo -> sábado tras 5 semanas
    if (minEnd > e) {
      e.setTime(minEnd.getTime());
    }
  }

  const matrix = [];
  let cursor = new Date(s);
  while (cursor <= e) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(cursor);
      const iso = date.toISOString().slice(0, 10);
      const inRange = (!startIso || iso >= startIso) && (!endIso || iso <= endIso);
      week.push({ date, inMonth: inRange });
      cursor.setDate(cursor.getDate() + 1);
    }
    matrix.push(week);
  }
  return matrix;
}

export default function Calendar({ year, month, markedDates = [], onSelectDate, rangeStart, rangeEnd }) {
  const [selected, setSelected] = useState(null);
  const startIso = rangeStart ? new Date(rangeStart).toISOString().slice(0,10) : null;
  const endIso = rangeEnd ? new Date(rangeEnd).toISOString().slice(0,10) : null;
  const matrix = useMemo(() => {
    if (startIso) return getRangeMatrix(startIso, endIso || startIso);
    return getMonthMatrix(year, month);
  }, [year, month, startIso, endIso]);
  const markedSet = useMemo(() => new Set(markedDates), [markedDates]);

  // Etiquetas de días de la semana (usar keys únicas, no solo la letra)
  const weekdays = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  let header = `${months[month]} ${year}`;
  if (startIso) {
    const s = new Date(startIso);
    const e = new Date(endIso || startIso);
    const sameMonthYear = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
    header = sameMonthYear
      ? `${months[s.getMonth()]} ${s.getFullYear()}`
      : `${months[s.getMonth()]} ${s.getFullYear()} – ${months[e.getMonth()]} ${e.getFullYear()}`;
  }

  const handlePress = (date) => {
    const iso = date.toISOString().slice(0,10);
    // Bloquear selección fuera de rango cuando se especifica el rango
    const inRange = (!startIso || iso >= startIso) && (!endIso || iso <= endIso);
    if (!inRange) return;
    setSelected(iso);
    onSelectDate?.(iso);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{header}</Text>
      <View style={styles.weekRow}>
        {weekdays.map((w, idx) => (
          <Text key={`wd-${idx}`} style={styles.weekLabel}>{w}</Text>
        ))}
      </View>
      {matrix.map((week, wi) => (
        <View key={`week-${wi}`} style={styles.weekRow}>
          {week.map(({ date, inMonth }) => {
            const iso = date.toISOString().slice(0,10);
            const isMarked = markedSet.has(iso);
            const isSelected = selected === iso;
            const isStart = !!startIso && iso === startIso;
            const isEnd = !!endIso && iso === endIso;
            const inRange = (!startIso || iso >= startIso) && (!endIso || iso <= endIso);
            return (
              <TouchableOpacity
                key={`day-${iso}`}
                style={[
                  styles.day,
                  !inMonth && styles.dayMuted,
                  !inRange && styles.dayOutOfRange,
                  isSelected && styles.daySelected,
                ]}
                onPress={() => handlePress(date)}
                disabled={!inRange}
              >
                <Text style={[styles.dayText, !inMonth && styles.dayTextMuted]}>{date.getDate()}</Text>
                {isMarked && <View style={styles.dot} />}
                {isStart && <View style={styles.startDot} />}
                {isEnd && <View style={styles.endDot} />}
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
  dayOutOfRange: { opacity: 0.25 },
  dayText: { color: colors.white },
  dayTextMuted: { color: '#D1D5DB' },
  dot: { position: 'absolute', bottom: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.cyan },
  startDot: { position: 'absolute', top: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  endDot: { position: 'absolute', top: 4, right: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
});