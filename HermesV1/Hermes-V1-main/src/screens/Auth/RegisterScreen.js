import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation, onRegister }) {
  const [name, setName] = useState('Hermes Demo');
  const [email, setEmail] = useState('demo@hermes.app');
  const [password, setPassword] = useState('demopass');
  const [confirm, setConfirm] = useState('demopass');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name || name.trim().length < 2) e.name = 'Nombre requerido';
    if (!emailRegex.test(email)) e.email = 'Email inválido';
    if (!password || password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (confirm !== password) e.confirm = 'No coincide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;
    onRegister?.({ name, email });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear cuenta</Text>
        <View style={styles.field}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput style={[styles.input, errors.name && styles.inputError]} value={name} onChangeText={setName} />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        </View>
        <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={[styles.input, errors.email && styles.inputError]} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}
        </View>
        <View style={styles.field}>
        <Text style={styles.label}>Contraseña</Text>
        <TextInput style={[styles.input, errors.password && styles.inputError]} value={password} onChangeText={setPassword} secureTextEntry />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
        </View>
        <View style={styles.field}>
        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput style={[styles.input, errors.confirm && styles.inputError]} value={confirm} onChangeText={setConfirm} secureTextEntry />
        {errors.confirm && <Text style={styles.error}>{errors.confirm}</Text>}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarme</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black, padding: 24, justifyContent: 'center', alignItems: 'center' },
  content: { width: '100%', maxWidth: 420 },
  title: { color: colors.white, fontSize: 24, marginBottom: 16, textAlign: 'center' },
  field: { marginBottom: 12 },
  label: { color: colors.white, marginBottom: 6 },
  input: { backgroundColor: colors.gray, color: colors.white, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  inputError: { borderWidth: 1, borderColor: '#EF4444' },
  error: { color: '#EF4444', marginTop: 4 },
  button: { backgroundColor: colors.cyan, padding: 12, borderRadius: 8, marginTop: 8 },
  buttonText: { color: colors.black, textAlign: 'center', fontWeight: 'bold' },
  link: { color: colors.cyan, textAlign: 'center', marginTop: 12 },
});