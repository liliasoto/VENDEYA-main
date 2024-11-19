import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ZoneCardProps {
  zone: string;
  earnings: number;
  onPress: () => void;
  isLowPerforming?: boolean;
}

const ZoneCard: React.FC<ZoneCardProps> = ({ zone, earnings, onPress, isLowPerforming }) => (
  <TouchableOpacity
    style={[styles.zoneCard, isLowPerforming && styles.lowZoneCard]}
    onPress={onPress}
  >
    <Text style={styles.zoneTitle}>Zona {zone}</Text>
    <Text style={styles.zoneEarnings}>
      Ganancia: $ {earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  zoneCard: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  lowZoneCard: {
    backgroundColor: '#FF5252',
  },
  zoneTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  zoneEarnings: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ZoneCard;