import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../styles/globalStyles';
import Input from '../components/Input';
import Button from '../components/Button';
import LocalDB from '../../persistence/localdb';

type ProductsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface ProductInput {
  id: number;
  name: string;
  price: string;
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({ navigation }) => {
  const [products, setProducts] = useState<ProductInput[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserIdAndProducts();
  }, []);

  const loadUserIdAndProducts = async () => {
    const id = await AsyncStorage.getItem('userId');
    setUserId(id);
    if (id) {
      await loadProducts(id);
    }
  };

  const loadProducts = async (userId: string) => {
    const db = await LocalDB.connect();
    return new Promise<void>((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM productos WHERE usuario_id = ?',
          [userId],
          (_, { rows }) => {
            const loadedProducts = rows.raw().map((row) => ({
              id: row.id,
              name: row.nombre_producto,
              price: row.ganancia_producto,
            }));
            setProducts(loadedProducts);
            resolve();
          },
          (_, error) => {
            console.error('Error loading products:', error);
            reject(error);
          }
        );
      });
    });
  };

  const addNewProduct = async () => {
    if (!userId) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    const db = await LocalDB.connect();
    return new Promise<void>((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT MAX(id) as maxId FROM productos WHERE usuario_id = ?',
          [userId],
          (_, { rows }) => {
            const maxId = rows.item(0).maxId || 0;
            const newId = maxId + 1;
            setProducts([...products, { id: newId, name: '', price: '' }]);
            resolve();
          },
          (_, error) => {
            console.error('Error getting max product id:', error);
            reject(error);
          }
        );
      });
    });
  };

  const updateProduct = (id: number, field: 'name' | 'price', value: string) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  const saveProducts = async () => {
    if (!userId) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    const db = await LocalDB.connect();
    db.transaction((tx) => {
      products.forEach((product) => {
        if (product.name && product.price) {
          tx.executeSql(
            'INSERT OR REPLACE INTO productos (id, nombre_producto, ganancia_producto, usuario_id) VALUES (?, ?, ?, ?)',
            [product.id, product.name, product.price, userId],
            () => {},
            (error) => console.error('Error saving product:', error)
          );
        }
      });
    }, (error) => {
      console.error('Transaction error:', error);
      Alert.alert('Error', 'No se pudieron guardar los productos');
    }, () => {
      Alert.alert('Éxito', 'Productos guardados exitosamente');
      navigation.navigate('Sales');
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={addNewProduct}>
        <Image 
          source={require('../../assets/+.png')} 
          style={styles.addButtonImage}
        />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        <Text style={globalStyles.title}>Productos</Text>
        <Text style={globalStyles.subtitle}>Dinos qué productos vendes, y cuánto ganas por cada uno</Text>
        
        {products.map((product) => (
          <View key={product.id} style={styles.productInputs}>
            <Input
              label="Nombre"
              placeholder="El nombre de tu producto"
              value={product.name}
              onChangeText={(text: string) => updateProduct(product.id, 'name', text)}
            />
            <Input
              label="Ganancia"
              placeholder="0"
              keyboardType="numeric"
              value={product.price}
              onChangeText={(text: string) => updateProduct(product.id, 'price', text)}
            />
          </View>
        ))}
      </ScrollView>

      <Button title="Guardar productos" onPress={saveProducts} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    paddingTop: 60, // Make room for the add button
  },
  scrollView: {
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 1,
  },
  addButtonImage: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  productInputs: {
    marginBottom: 20,
  },
});

export default ProductsScreen;