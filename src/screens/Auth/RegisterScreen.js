import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation, onRegister }) {
  const [name, setName] = useState('Hermes Demo');
  const [email, setEmail] = useState('demo@hermes.app');
  const [password, setPassword] = useState('demopass');
  const [confirm, setConfirm] = useState('demopass');

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!name || name.trim().length < 2) e.name = 'Nombre requerido';
    if (!emailRegex.test(email.trim())) e.email = 'Email inválido';
    if (!password || password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (confirm !== password) e.confirm = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (loading) return;
    if (!validate()) return;

    setAuthError(null);
    setLoading(true);

    try {
      // 1) Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      console.log('SIGNUP result:', { data, error });

      if (error) {
        let message = 'No se pudo crear la cuenta. Inténtalo de nuevo.';
        const msg = error.message?.toLowerCase() ?? '';

        if (msg.includes('user already registered')) {
          message = 'Este correo ya está registrado. Intenta iniciar sesión.';
        } else if (msg.includes('password')) {
          message = 'La contraseña no cumple los requisitos mínimos.';
        }

        setAuthError(message);
        return;
      }

      const user = data.user;
      const session = data.session;

      if (!user) {
        setAuthError('No se pudo obtener el usuario creado.');
        return;
      }

      // 2) Insert en tu tabla "users"
      //    password_hash es NOT NULL en el schema, así que ponemos un valor dummy
      const {
        data: userRow,
        error: insertError,
      } = await supabase
        .from('users')
        .insert({
          full_name: name.trim(),
          email: user.email,
          password_hash: 'supabase_auth_managed', // placeholder
          is_active: true,
        })
        .select()
        .single();

      console.log('INSERT users result:', { userRow, insertError });

      if (insertError) {
        // Aquí YA NO lo dejamos solo en consola: se lo mostramos al usuario
        setAuthError(
          `No se pudo guardar tu perfil en la tabla users: ${insertError.message}`
        );
        return;
      }

      // 3) Si ya desactivaste la confirmación por correo, deberías tener session
      if (!session) {
        setAuthError(
          'El registro se realizó, pero no se obtuvo sesión. Revisa la configuración de confirmación de correo en Supabase.'
        );
        return;
      }

      const payload = {
        user,
        session,
        email: user.email,
        name: name.trim(),
      };

      onRegister?.(payload);
    } catch (err) {
      console.error('Error inesperado en registro:', err);
      setAuthError(
        'Ocurrió un error inesperado. Revisa tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const clearFieldError = (field) => {
    if (errors[field] || authError) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setAuthError(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear cuenta</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={(text) => {
              setName(text);
              clearFieldError('name');
            }}
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              clearFieldError('email');
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
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearFieldError('password');
            }}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />
          {errors.password && <Text style={styles.error}>{errors.password}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={[styles.input, errors.confirm && styles.inputError]}
            value={confirm}
            onChangeText={(text) => {
              setConfirm(text);
              clearFieldError('confirm');
            }}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />
          {errors.confirm && <Text style={styles.error}>{errors.confirm}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <Text style={styles.buttonText}>Registrarme</Text>
          )}
        </TouchableOpacity>

        {authError ? (
          <Text style={styles.errorCenter}>{authError}</Text>
        ) : null}

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { width: '100%', maxWidth: 420 },
  title: { color: colors.white, fontSize: 24, marginBottom: 16, textAlign: 'center' },
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
