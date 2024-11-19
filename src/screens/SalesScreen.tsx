import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { globalStyles } from '../styles/globalStyles';
import LocalDB from '../../persistence/localdb';

type SalesScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface Product {
  id: number;
  nombre_producto: string;
  ganancia_producto: string;
  count: number;
}

const SalesScreen: React.FC<SalesScreenProps> = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentZone, setCurrentZone] = useState<string>('');

  useFocusEffect(
    React.useCallback(() => {
      loadUserIdAndProducts();
      getCurrentLocation();
    }, [])
  );

  const loadUserIdAndProducts = async () => {
    const id = await AsyncStorage.getItem('userId');
    setUserId(id);
    if (id) {
      await loadProducts(id);
    }
  };

  const loadProducts = async (userId: string) => {
    const db = await LocalDB.connect();
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM productos WHERE usuario_id = ?',
        [userId],
        (_, { rows }) => {
          const loadedProducts = rows.raw().map(product => ({
            ...product,
            count: 0
          }));
          setProducts(loadedProducts);
        },
        (error) => console.error('Error loading products:', error)
      );
    });
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const zone = await LocalDB.getZoneFromCoordinates(latitude, longitude);
        setCurrentZone(zone);
      },
      (error) => console.error('Error getting location:', error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const updateProductCount = (id: number, increment: boolean) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === id
          ? { ...product, count: Math.max(0, product.count + (increment ? 1 : -1)) }
          : product
      )
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.nombre_producto}</Text>
      <View style={styles.productControls}>
        <TouchableOpacity onPress={() => updateProductCount(item.id, false)}>
          <Image
            source={require('../../assets/minus-button.png')}
            style={styles.controlButton}
          />
        </TouchableOpacity>
        <Text style={styles.productCount}>{item.count}</Text>
        <TouchableOpacity onPress={() => updateProductCount(item.id, true)}>
          <Image
            source={require('../../assets/plus-button.png')}
            style={styles.controlButton}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleAddSale = async () => {
    if (!userId) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    const productsToSave = products.filter(product => product.count > 0);
    if (productsToSave.length === 0) {
      Alert.alert('Error', 'No hay productos para agregar a la venta');
      return;
    }

    try {
      for (const product of productsToSave) {
        await LocalDB.saveSale(product.id, product.count, currentZone, parseInt(userId));
      }
      Alert.alert('Éxito', 'Venta agregada correctamente');
      // Reset product counts after successful sale
      setProducts(products.map(product => ({ ...product, count: 0 })));
    } catch (error) {
      console.error('Error saving sale:', error);
      Alert.alert('Error', 'No se pudo guardar la venta');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.headerButton}>
          <Image
            source={require('../../assets/back-arrow.png')}
            style={styles.headerButtonImage}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Ventas</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Products')} style={styles.headerButton}>
          <Image
            source={require('../../assets/menu-icon.png')}
            style={styles.headerButtonImage}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.zoneText}>Zona actual: {currentZone}</Text>
      {products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noProductsText}>Aún no hay productos</Text>
      )}
      <TouchableOpacity style={styles.addSaleButton} onPress={handleAddSale}>
        <Text style={styles.addSaleButtonText}>Agregar venta</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.viewReportButton} 
        onPress={() => navigation.navigate('Report')}
      >
        <Text style={styles.viewReportButtonText}>Ver reporte</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButton: {
    padding: 10,
  },
  headerButtonImage: {
    width: 24,
    height: 24,
  },
  title: {
    ...globalStyles.title,
  },
  zoneText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#4CAF50',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  productName: {
    fontSize: 16,
    color: 'black',
  },
  productControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 30,
    height: 30,
  },
  productCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: 'black',
  },
  noProductsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  addSaleButton: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 5,
    alignItems: 'center',
  },
  addSaleButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  viewReportButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    alignItems: 'center',
  },
  viewReportButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SalesScreen;