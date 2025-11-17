import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';

const PlanCard = ({ plan, onPress, onDelete }) => (
  <View style={styles.card}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <TouchableOpacity onPress={() => onPress(plan)} style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{plan.name}</Text>
        {plan.destination ? (
          <Text style={styles.cardDestination}>{plan.destination}</Text>
        ) : null}
        <Text style={styles.cardDates}>{plan.startDate} - {plan.endDate}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(plan)}>
        <Text style={{ color: '#EF4444' }}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function PlansScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPlans, setUserPlans] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmPlanId, setConfirmPlanId] = useState(null);
  const [showConfirmPlan, setShowConfirmPlan] = useState(false);
  const [confirmPlanChecked, setConfirmPlanChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!authUser) {
          setError('No hay sesión activa.');
          return;
        }

        const { data: userRow, error: userError } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', authUser.email)
          .maybeSingle();
        if (userError) throw userError;
        if (!userRow) {
          setError('No se encontró tu perfil de usuario.');
          return;
        }

        const { data: trips, error: tripsError } = await supabase
          .from('trips')
          .select('trip_id, title, start_date, end_date')
          .eq('user_id', userRow.user_id)
          .order('start_date', { ascending: false });
        if (tripsError) throw tripsError;

        const mapped = (trips || []).map((t) => ({
          id: String(t.trip_id),
          name: t.title,
          startDate: t.start_date,
          endDate: t.end_date,
          destination: null,
        }));
        if (isMounted) setUserPlans(mapped);
      } catch (err) {
        console.error('Error cargando planes:', err);
        setError('No se pudieron cargar tus planes.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPlans();
    return () => { isMounted = false; };
  }, []);

  const handlePlanPress = (plan) => {
    navigation.navigate('PlanDetalle', { plan });
  };

  const handleCreatePlan = async () => {
    if (saving) return;
    setError(null);
    const title = (formTitle || '').trim();
    const start = (formStart || '').trim();
    const end = (formEnd || '').trim();
    if (!title || !start || !end) {
      setError('Título, fecha de inicio y fecha de fin son obligatorios.');
      return;
    }
    if (start > end) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }
    setSaving(true);
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authUser) throw new Error('No hay sesión activa.');
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', authUser.email)
        .maybeSingle();
      if (userError) throw userError;
      if (!userRow) throw new Error('No se encontró tu perfil de usuario.');
      const { data: inserted, error: insError } = await supabase
        .from('trips')
        .insert({ user_id: userRow.user_id, title, start_date: start, end_date: end })
        .select('trip_id, title, start_date, end_date')
        .maybeSingle();
      if (insError) throw insError;
      if (inserted) {
        const newPlan = {
          id: String(inserted.trip_id),
          name: inserted.title,
          startDate: inserted.start_date,
          endDate: inserted.end_date,
          destination: null,
        };
        setUserPlans((prev) => [newPlan, ...prev]);
        setShowAddForm(false);
        setFormTitle('');
        setFormStart('');
        setFormEnd('');
      }
    } catch (err) {
      console.error('Error creando plan:', err);
      setError('No se pudo crear el plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (plan) => {
    try {
      const { error: delError } = await supabase
        .from('trips')
        .delete()
        .eq('trip_id', Number(plan.id));
      if (delError) throw delError;
      setUserPlans((prev) => prev.filter((p) => String(p.id) !== String(plan.id)));
    } catch (err) {
      console.error('Error eliminando viaje:', err);
      setError('No se pudo eliminar el viaje.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddForm((s) => !s)}>
          <Text style={styles.addButtonText}>{showAddForm ? 'Cerrar formulario' : 'Crear plan'}</Text>
        </TouchableOpacity>
        {showAddForm && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Nuevo plan de viaje</Text>
            <TextInput
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="Título del plan"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TextInput
                value={formStart}
                onChangeText={setFormStart}
                placeholder="Inicio (YYYY-MM-DD)"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, { width: '48%' }]}
              />
              <TextInput
                value={formEnd}
                onChangeText={setFormEnd}
                placeholder="Fin (YYYY-MM-DD)"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, { width: '48%' }]}
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleCreatePlan} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.black} /> : <Text style={styles.saveButtonText}>Guardar plan</Text>}
            </TouchableOpacity>
          </View>
        )}
        {loading ? (
          <ActivityIndicator color={colors.cyan} />
        ) : error ? (
          <Text style={{ color: '#EF4444' }}>{error}</Text>
        ) : (
          <FlatList
            data={userPlans}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlanCard
                plan={item}
                onPress={handlePlanPress}
                onDelete={(p) => { setConfirmPlanId(p.id); setShowConfirmPlan(true); setConfirmPlanChecked(false); }}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={{ color: colors.white }}>No tienes planes aún.</Text>}
          />
        )}
        {/* Confirmación de eliminación de viaje */}
        <Modal visible={showConfirmPlan} transparent animationType="fade" onRequestClose={() => setShowConfirmPlan(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <View style={{ backgroundColor: colors.gray, borderRadius: 12, padding: 16, width: '90%' }}>
              <Text style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}>Confirmar eliminación</Text>
              <Text style={{ color: '#D1D5DB', marginTop: 8 }}>¿Seguro que deseas eliminar este viaje? Esta acción es permanente y eliminará sus eventos asociados.</Text>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }} onPress={() => setConfirmPlanChecked((c) => !c)}>
                <Ionicons name={confirmPlanChecked ? 'checkbox-outline' : 'square-outline'} size={22} color={colors.cyan} />
                <Text style={{ color: colors.white, marginLeft: 8 }}>Confirmo que deseo eliminar el viaje</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
                <TouchableOpacity onPress={() => { setShowConfirmPlan(false); setConfirmPlanChecked(false); setConfirmPlanId(null); }} style={{ paddingVertical: 8, paddingHorizontal: 12, marginRight: 8 }}>
                  <Text style={{ color: colors.white }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={!confirmPlanChecked}
                  onPress={async () => {
                    const id = confirmPlanId;
                    setShowConfirmPlan(false);
                    setConfirmPlanChecked(false);
                    setConfirmPlanId(null);
                    if (id) {
                      const planObj = userPlans.find((p) => String(p.id) === String(id));
                      if (planObj) await handleDeletePlan(planObj);
                    }
                  }}
                  style={{ backgroundColor: confirmPlanChecked ? '#EF4444' : '#6B7280', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }}
                >
                  <Text style={{ color: colors.black, fontWeight: 'bold' }}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  content: {
    padding: 16,
  },
  listContainer: {
    paddingVertical: 8,
  },
  addButton: { marginBottom: 12, backgroundColor: colors.cyan, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: colors.black, fontWeight: 'bold' },
  form: { backgroundColor: colors.gray, borderRadius: 12, padding: 12, marginBottom: 12 },
  sectionTitle: { color: colors.white, marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#111827', color: colors.white, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8 },
  saveButton: { marginTop: 12, backgroundColor: colors.cyan, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: colors.black, fontWeight: 'bold' },
  card: {
    backgroundColor: colors.gray,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  cardDestination: {
    fontSize: 14,
    color: colors.lightGray,
    marginBottom: 4,
  },
  cardDates: {
    fontSize: 14,
    color: colors.cyan,
  },
});