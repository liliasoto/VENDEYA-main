import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import ProductsScreen from '../screens/ProductsScreen';
import SalesScreen from '../screens/SalesScreen';
import ReportScreen from '../screens/ReportScreen';
import ZoneDetailScreen from '../screens/ZoneDetailScreen';
import LocalDB from '../../persistence/localdb';
// @ts-ignore
import SQLite from 'react-native-sqlite-storage';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  useEffect(() => {
    // Inicializar la base de datos al arrancar la aplicación
    const initializeDatabase = async () => {
      try {
        // Eliminar la base de datos antes de inicializarla
        await SQLite.deleteDatabase({ name: 'veneya' });
        console.log('Database deleted');

        // Crear e inicializar la base de datos nuevamente
        await LocalDB.init();
        console.log('Database initialized');
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };
 

    initializeDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="Sales" component={SalesScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="ZoneDetail" component={ZoneDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
