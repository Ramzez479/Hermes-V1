import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors } from '../../theme/colors';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('demo@hermes.app');
  const [password, setPassword] = useState('demopass');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!emailRegex.test(email)) e.email = 'Email inválido';
    if (!password || password.length < 6) e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    onLogin?.({ name: 'Hermes Demo', email });
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../LogoHermes.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Hermes Travel</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="••••••"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black, padding: 24, justifyContent: 'center' },
  logo: { width: 140, height: 140, alignSelf: 'center', marginBottom: 12 },
  title: { color: colors.white, fontSize: 28, textAlign: 'center', marginBottom: 24 },
  field: { marginBottom: 12 },
  label: { color: colors.white, marginBottom: 6 },
  input: { backgroundColor: colors.gray, color: colors.white, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  inputError: { borderWidth: 1, borderColor: '#EF4444' },
  error: { color: '#EF4444', marginTop: 4 },
  button: { backgroundColor: colors.cyan, padding: 12, borderRadius: 8, marginTop: 8 },
  buttonText: { color: colors.black, textAlign: 'center', fontWeight: 'bold' },
  link: { color: colors.cyan, textAlign: 'center', marginTop: 12 },
});