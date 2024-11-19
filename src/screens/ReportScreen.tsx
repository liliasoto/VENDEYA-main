import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { globalStyles } from '../styles/globalStyles';
import ZoneCard from '../components/ZoneCard';
import LocalDB from '../../persistence/localdb';

type ReportScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface ZoneSummary {
  zone: string;
  earnings: number;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ navigation }) => {
  const [zoneSummaries, setZoneSummaries] = useState<ZoneSummary[]>([]);

  useEffect(() => {
    loadZoneSummaries();
  }, []);

  const loadZoneSummaries = async () => {
    const db = await LocalDB.connect();
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT zona as zone, SUM(v.cantidad * CAST(p.ganancia_producto AS FLOAT)) as earnings
         FROM ventas v
         JOIN productos p ON v.producto_id = p.id
         GROUP BY zona
         ORDER BY earnings DESC`,
        [],
        (_, { rows }) => {
          const summaries = rows.raw().map(row => ({
            zone: row.zone,
            earnings: parseFloat(row.earnings)
          }));
          setZoneSummaries(summaries);
        },
        (_, error) => console.error('Error loading zone summaries:', error)
      );
    });
  };

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Reporte</Text>
      
      <Text style={globalStyles.subtitle}>Zonas con más ventas</Text>
      {zoneSummaries.slice(0, 3).map((summary, index) => (
        <ZoneCard
          key={summary.zone}
          zone={summary.zone}
          earnings={summary.earnings}
          onPress={() => navigation.navigate('ZoneDetail', { zone: summary.zone })}
        />
      ))}
      
      <Text style={globalStyles.subtitle}>Zonas con menos ventas</Text>
      {zoneSummaries.slice(-3).reverse().map((summary, index) => (
        <ZoneCard
          key={summary.zone}
          zone={summary.zone}
          earnings={summary.earnings}
          onPress={() => navigation.navigate('ZoneDetail', { zone: summary.zone })}
          isLowPerforming
        />
      ))}
    </ScrollView>
  );
};

export default ReportScreen;