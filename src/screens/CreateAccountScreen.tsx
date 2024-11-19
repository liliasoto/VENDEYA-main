import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { globalStyles } from '../styles/globalStyles';
import Input from '../components/Input';
import Button from '../components/Button';
import LocalDB from '../../persistence/localdb';

type CreateAccountScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({ navigation }) => {
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [ganancia, setGanancia] = useState('');

  const handleCreateAccount = async () => {
    try {
      const userId = await LocalDB.createAccount(usuario, correo, contraseña, ganancia);
      if (userId) {
        Alert.alert('Éxito', 'Cuenta creada exitosamente');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'No se pudo crear la cuenta');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Error', 'Ocurrió un error al crear la cuenta: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>Crea una cuenta</Text>
      
      <Input 
        label="Usuario" 
        placeholder="Tu nombre de usuario" 
        value={usuario}
        onChangeText={setUsuario}
      />
      <Input 
        label="Correo" 
        placeholder="Tu correo electrónico" 
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
      />
      <Input 
        label="Contraseña" 
        placeholder="Tu contraseña" 
        secureTextEntry
        value={contraseña}
        onChangeText={setContraseña}
      />
      <Input 
        label="Ganancia diaria promedio" 
        placeholder="¿Cuánto ganas al día en promedio?" 
        keyboardType="numeric"
        value={ganancia}
        onChangeText={setGanancia}
      />

      <Button title="Crear cuenta" onPress={handleCreateAccount} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    justifyContent: 'center',
  },
});

export default CreateAccountScreen;