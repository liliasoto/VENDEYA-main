import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ProductItemProps {
  name: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ name, count, onIncrement, onDecrement }) => (
  <View style={styles.productItem}>
    <Text style={styles.productName}>{name}</Text>
    <View style={styles.counter}>
      <TouchableOpacity style={styles.counterButton} onPress={onDecrement}>
        <Text style={styles.counterButtonText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.counterValue}>{count}</Text>
      <TouchableOpacity style={styles.counterButton} onPress={onIncrement}>
        <Text style={styles.counterButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productName: {
    fontSize: 16,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  counterButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  counterValue: {
    fontSize: 16,
    minWidth: 30,
    textAlign: 'center',
  },
});

export default ProductItem;