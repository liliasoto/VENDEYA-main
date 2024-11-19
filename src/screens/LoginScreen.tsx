import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../styles/globalStyles';
import Input from '../components/Input';
import Button from '../components/Button';
import LocalDB from '../../persistence/localdb';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const db = await LocalDB.connect();
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM cuenta WHERE usuario = ? AND contraseña = ?',
        [username, password],
        async (_, { rows }) => {
          if (rows.length > 0) {
            const user = rows.item(0);
            await AsyncStorage.setItem('userId', user.id.toString());
            await AsyncStorage.setItem('username', user.usuario);
            navigation.navigate('Sales');
          } else {
            Alert.alert('Error', 'Usuario o contraseña incorrectos');
          }
        },
        (error) => {
          console.error('Error verifying user:', error);
          Alert.alert('Error', 'Ocurrió un error al intentar iniciar sesión');
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Image 
          source={require('../../assets/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Inicia sesión</Text>
        <Text style={styles.subtitle}>Hola! Qué gusto volverte a ver!</Text>
        
        <Input 
          label="Usuario" 
          placeholder="Tu nombre de usuario" 
          value={username}
          onChangeText={setUsername}
        />
        <Input 
          label="Contraseña" 
          placeholder="Tu contraseña" 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />

        <Button title="Ingresar" onPress={handleLogin} />
        
        <TouchableOpacity 
          style={styles.forgotPasswordButton}
          onPress={() => {/* Handle forgot password */}}
        >
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.createAccountButton}
        onPress={() => navigation.navigate('CreateAccount')}
      >
        <Text style={styles.createAccountText}>Crea una cuenta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: '50%',
    height: '15%',
    alignSelf: 'center',
  },
  title: {
    ...globalStyles.title,
   
  },
  subtitle: {
    ...globalStyles.subtitle,
    marginBottom: 30,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#999',
    fontSize: 14,
  },
  createAccountButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  createAccountText: {
    color: '#4CAF50',
    fontSize: 16,
  },
});

export default LoginScreen;