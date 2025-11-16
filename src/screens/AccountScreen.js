import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Switch,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';

export default function AccountScreen({ onLogout }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('');
  const [budgetLevel, setBudgetLevel] = useState(''); // low | medium | high
  const [travelStyle, setTravelStyle] = useState(''); // relaxed | adventure | cultural | mixed

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newsletterEnabled, setNewsletterEnabled] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [appUserId, setAppUserId] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!authUser) {
          setError('No se encontró una sesión activa.');
          setLoading(false);
          return;
        }

        // 1) Buscar usuario en tabla "users" por email
        const { data: userRow, error: appUserError } = await supabase
          .from('users')
          .select('user_id, full_name, email, is_active')
          .eq('email', authUser.email)
          .maybeSingle();

        if (appUserError) throw appUserError;
        if (!userRow) {
          setError(
            'No se encontró tu perfil en la tabla users. Intenta cerrar sesión y registrarte de nuevo.'
          );
          setLoading(false);
          return;
        }

        setAppUserId(userRow.user_id);
        setEmail(userRow.email || authUser.email || '');
        setFullName(
          userRow.full_name ||
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            ''
        );

        // 2) Cargar preferencias si existen
        const { data: prefsRow, error: prefsError } = await supabase
          .from('user_preferences')
          .select(
            'preferred_language, preferred_currency, budget_level, travel_style'
          )
          .eq('user_id', userRow.user_id)
          .maybeSingle();

        if (prefsError) throw prefsError;

        if (prefsRow) {
          setPreferredLanguage(prefsRow.preferred_language || '');
          setPreferredCurrency(prefsRow.preferred_currency || '');
          setBudgetLevel(prefsRow.budget_level || '');
          setTravelStyle(prefsRow.travel_style || '');
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
        setError('No se pudieron cargar tus datos. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (saving || !appUserId) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1) Actualizar nombre en tabla users
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim() || null,
        })
        .eq('user_id', appUserId);

      if (updateUserError) throw updateUserError;

      // 2) Upsert en tabla user_preferences
      const { error: upsertPrefsError } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: appUserId,
            preferred_language: preferredLanguage || null,
            preferred_currency: preferredCurrency || null,
            budget_level: budgetLevel || null,
            travel_style: travelStyle || null,
          },
          { onConflict: 'user_id' }
        );

      if (upsertPrefsError) throw upsertPrefsError;

      setSuccessMessage('Cambios guardados correctamente.');
    } catch (err) {
      console.error('Error guardando perfil:', err);
      setError('No se pudieron guardar los cambios. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      onLogout?.();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.cyan} />
        <Text style={styles.loadingText}>Cargando tu cuenta...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <Image
            source={require('../../LogoHermes.png')}
            style={styles.avatar}
          />
          <Text style={styles.name}>
            {fullName && fullName.trim().length > 0 ? fullName : 'Viajero Hermes'}
          </Text>
          <Text style={styles.email}>
            {email || 'sin-correo@hermes.app'}
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Perfil</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setError(null);
                setSuccessMessage(null);
              }}
              placeholder="Tu nombre"
              placeholderTextColor={colors.lightGray}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
            />
            <Text style={styles.helperText}>
              El correo se gestiona desde tu cuenta de Hermes/Supabase.
            </Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Preferencias de viaje</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Idioma preferido</Text>
            <TextInput
              style={styles.input}
              value={preferredLanguage}
              onChangeText={(text) => {
                setPreferredLanguage(text);
                setError(null);
                setSuccessMessage(null);
              }}
              placeholder="es-ES, en-US..."
              placeholderTextColor={colors.lightGray}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Moneda preferida</Text>
            <TextInput
              style={styles.input}
              value={preferredCurrency}
              onChangeText={(text) => {
                setPreferredCurrency(text);
                setError(null);
                setSuccessMessage(null);
              }}
              placeholder="MXN, USD, EUR..."
              placeholderTextColor={colors.lightGray}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nivel de presupuesto</Text>
            <TextInput
              style={styles.input}
              value={budgetLevel}
              onChangeText={(text) => {
                setBudgetLevel(text);
                setError(null);
                setSuccessMessage(null);
              }}
              placeholder="low, medium, high"
              placeholderTextColor={colors.lightGray}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Estilo de viaje</Text>
            <TextInput
              style={styles.input}
              value={travelStyle}
              onChangeText={(text) => {
                setTravelStyle(text);
                setError(null);
                setSuccessMessage(null);
              }}
              placeholder="relaxed, adventure, cultural, mixed"
              placeholderTextColor={colors.lightGray}
            />
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Configuración</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notificaciones</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                setError(null);
                setSuccessMessage(null);
              }}
              trackColor={{ false: colors.gray, true: colors.cyan }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Newsletter</Text>
            <Switch
              value={newsletterEnabled}
              onValueChange={(value) => {
                setNewsletterEnabled(value);
                setError(null);
                setSuccessMessage(null);
              }}
              trackColor={{ false: colors.gray, true: colors.cyan }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {successMessage ? (
          <Text style={styles.successText}>{successMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  scrollContent: { paddingBottom: 32 },
  content: { padding: 16 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.white },
  profileSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: 'bold', color: colors.white, marginBottom: 4 },
  email: { fontSize: 16, color: colors.lightGray },
  formSection: { marginTop: 8, marginBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 14, color: colors.lightGray, marginBottom: 4 },
  input: {
    backgroundColor: colors.gray,
    color: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputDisabled: { opacity: 0.7 },
  helperText: { fontSize: 12, color: colors.lightGray, marginTop: 4 },
  settingsSection: { marginTop: 8 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  settingLabel: { fontSize: 16, color: colors.white },
  errorText: { color: '#EF4444', marginTop: 12, textAlign: 'center', fontSize: 13 },
  successText: { color: colors.cyan, marginTop: 12, textAlign: 'center', fontSize: 13 },
  saveButton: {
    backgroundColor: colors.cyan,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: colors.black },
  logoutButton: {
    backgroundColor: colors.gray,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: colors.white },
});
