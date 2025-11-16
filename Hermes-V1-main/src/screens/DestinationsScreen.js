import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { destinations } from '../data/destinations';

const screenWidth = Dimensions.get('window').width;
const contentWidth = screenWidth - 32; // container padding horizontal
const columnWidth = (contentWidth - 8) / 2; // gap 8

const DestinationCard = ({ destination, style }) => (
  <View style={[styles.card, style]}>
    <Image source={{ uri: destination.image }} style={styles.image} />
    <View style={styles.topBadge}>
      <Ionicons name="location-outline" size={14} color={colors.white} />
      <Text style={styles.badgeText}>{destination.country}</Text>
    </View>
    <View style={styles.overlay}>
      <Text style={styles.name}>{destination.name}</Text>
    </View>
  </View>
);

export default function DestinationsScreen() {
  const [d1, d2, d3, d4, d5] = destinations;
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Destinos populares</Text>
        {/* Banner superior */}
        <DestinationCard destination={d1} style={{ width: contentWidth, height: 160, marginBottom: 8 }} />
        {/* Zona bento: dos columnas */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: columnWidth }}>
            <DestinationCard destination={d2} style={{ width: '100%', height: 140, marginBottom: 8 }} />
            <DestinationCard destination={d4} style={{ width: '100%', height: 90 }} />
          </View>
          <View style={{ width: columnWidth }}>
            <DestinationCard destination={d3} style={{ width: '100%', height: 240 }} />
          </View>
        </View>
        {/* Tarjeta inferior adicional para completar el bento */}
        <View style={{ marginTop: 8 }}>
          <DestinationCard destination={d5} style={{ width: contentWidth, height: 120 }} />
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.black,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});