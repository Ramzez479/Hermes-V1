import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { plans } from '../data/plans';

const PlanCard = ({ plan, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(plan)}>
    <Text style={styles.cardTitle}>{plan.name}</Text>
    <Text style={styles.cardDestination}>{plan.destination}</Text>
    <Text style={styles.cardDates}>{plan.startDate} - {plan.endDate}</Text>
  </TouchableOpacity>
);

export default function PlansScreen({ navigation }) {
  const handlePlanPress = (plan) => {
    navigation.navigate('PlanDetalle', { plan });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PlanCard plan={item} onPress={handlePlanPress} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  content: {
    padding: 16,
  },
  listContainer: {
    paddingVertical: 8,
  },
  card: {
    backgroundColor: colors.gray,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  cardDestination: {
    fontSize: 14,
    color: colors.lightGray,
    marginBottom: 4,
  },
  cardDates: {
    fontSize: 14,
    color: colors.cyan,
  },
});