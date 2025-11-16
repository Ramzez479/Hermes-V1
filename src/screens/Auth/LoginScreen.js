import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('demo@hermes.app');
  const [password, setPassword] = useState('demopass');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!emailRegex.test(email.trim())) e.email = 'Email inválido';
    if (!password || password.length < 6) e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (loading) return;
    if (!validate()) return;

    setAuthError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log('LOGIN result:', { data, error });

      if (error) {
        let message = 'No se pudo iniciar sesión. Inténtalo de nuevo.';
        const msg = error.message?.toLowerCase() ?? '';

        if (msg.includes('invalid login credentials')) {
          message = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        } else if (msg.includes('email not confirmed')) {
          message = 'Debes confirmar tu correo antes de iniciar sesión.';
        }

        setAuthError(message);
        return;
      }

      const user = data.user;
      const session = data.session;

      const payload = {
        user,
        session,
        email: user?.email ?? email.trim(),
        name:
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email ||
          'Usuario',
      };

      onLogin?.(payload);
    } catch (err) {
      console.error('Error inesperado en login:', err);
      setAuthError(
        'Ocurrió un error inesperado. Revisa tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../LogoHermes.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Hermes Travel</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email || authError) {
              setErrors((prev) => ({ ...prev, email: undefined }));
              setAuthError(null);
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
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
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password || authError) {
              setErrors((prev) => ({ ...prev, password: undefined }));
              setAuthError(null);
            }
          }}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
      </View>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.black} />
        ) : (
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>

      {authError ? <Text style={styles.errorCenter}>{authError}</Text> : null}

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    padding: 24,
    justifyContent: 'center',
  },
  logo: { width: 140, height: 140, alignSelf: 'center', marginBottom: 12 },
  title: { color: colors.white, fontSize: 28, textAlign: 'center', marginBottom: 24 },
  field: { marginBottom: 12 },
  label: { color: colors.white, marginBottom: 6 },
  input: {
    backgroundColor: colors.gray,
    color: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputError: { borderWidth: 1, borderColor: '#EF4444' },
  error: { color: '#EF4444', marginTop: 4, fontSize: 13 },
  errorCenter: { color: '#EF4444', marginTop: 10, textAlign: 'center', fontSize: 13 },
  button: { backgroundColor: colors.cyan, padding: 12, borderRadius: 8, marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.black, textAlign: 'center', fontWeight: 'bold' },
  link: { color: colors.cyan, textAlign: 'center', marginTop: 12 },
});
