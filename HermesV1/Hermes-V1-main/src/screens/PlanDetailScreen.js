import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors } from '../theme/colors';
import Calendar from '../components/Calendar';

export default function PlanDetailScreen({ route }) {
  const { plan } = route.params;
  const start = new Date(plan.startDate);
  const [selectedDate, setSelectedDate] = useState(plan.startDate);

  const markedDates = useMemo(() => plan.events.map((e) => e.date), [plan.events]);
  const dayEvents = useMemo(() => plan.events.filter((e) => e.date === selectedDate), [plan.events, selectedDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{plan.name}</Text>
      <Text style={styles.sub}>{plan.destination}</Text>
      <Text style={styles.range}>{plan.startDate} → {plan.endDate}</Text>
      <View style={{ marginVertical: 12 }}>
        <Calendar year={start.getFullYear()} month={start.getMonth()} markedDates={markedDates} onSelectDate={setSelectedDate} />
      </View>
      <Text style={styles.sectionTitle}>Eventos para {selectedDate}</Text>
      {dayEvents.length === 0 ? (
        <Text style={styles.empty}>No hay eventos para esta fecha.</Text>
      ) : (
        <FlatList
          data={dayEvents}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.event}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventMeta}>{item.time} · {item.location}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black, padding: 16 },
  title: { color: colors.cyan, fontSize: 22 },
  sub: { color: '#93C5FD' },
  range: { color: '#D1D5DB', marginTop: 4 },
  sectionTitle: { color: colors.white, marginTop: 8 },
  empty: { color: '#9CA3AF', marginTop: 8 },
  event: { backgroundColor: colors.gray, borderRadius: 12, padding: 12 },
  eventTitle: { color: colors.white, fontSize: 16 },
  eventMeta: { color: '#D1D5DB', marginTop: 4 },
});