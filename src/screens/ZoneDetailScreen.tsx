import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import LocalDB from '../../persistence/localdb';

type ZoneDetailScreenProps = {
  route: RouteProp<{ params: { zone: string } }, 'params'>;
};

interface ProductSale {
  nombre_producto: string;
  cantidad: number;
  ganancia: number;
}

const ZoneDetailScreen: React.FC<ZoneDetailScreenProps> = ({ route }) => {
  const { zone } = route.params;
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    loadZoneDetails();
  }, [zone]);

  const loadZoneDetails = async () => {
    const db = await LocalDB.connect();
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT p.nombre_producto, SUM(v.cantidad) as cantidad, SUM(v.cantidad * CAST(p.ganancia_producto AS FLOAT)) as ganancia
         FROM ventas v
         JOIN productos p ON v.producto_id = p.id
         WHERE v.zona = ?
         GROUP BY p.id`,
        [zone],
        (_, { rows }) => {
          const sales = rows.raw().map(row => ({
            nombre_producto: row.nombre_producto,
            cantidad: row.cantidad,
            ganancia: parseFloat(row.ganancia)
          }));
          setProductSales(sales);
          setTotalEarnings(sales.reduce((sum, sale) => sum + sale.ganancia, 0));
        },
        (_, error) => console.error('Error loading zone details:', error)
      );
    });
  };

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Zona {zone}</Text>
      
      <View style={styles.earningsContainer}>
        <Text style={globalStyles.subtitle}>Ganancias</Text>
        {productSales.map((sale, index) => (
          <View key={index} style={styles.earningsRow}>
            <Text>{sale.nombre_producto}</Text>
            <Text>$ {sale.ganancia.toFixed(2)}</Text>
          </View>
        ))}
        <View style={[styles.earningsRow, styles.totalRow]}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalAmount}>$ {totalEarnings.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.salesBreakdownContainer}>
        <Text style={globalStyles.subtitle}>Desglose de Ventas</Text>
        {productSales.map((sale, index) => (
          <View key={index} style={styles.salesBreakdownRow}>
            <Text>{sale.nombre_producto}</Text>
            <Text>{sale.cantidad} unidades</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  earningsContainer: {
    flex: 1,
    marginTop: 20,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#4CAF50',
    marginTop: 10,
    paddingTop: 10,
  },
  totalText: {
    fontWeight: 'bold',
  },
  totalAmount: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  salesBreakdownContainer: {
    flex: 1,
    marginTop: 20,
  },
  salesBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default ZoneDetailScreen;