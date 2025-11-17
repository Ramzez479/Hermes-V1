import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import Calendar from '../components/Calendar';
import { supabase } from '../lib/supabase';

export default function PlanDetailScreen({ route }) {
  const { plan } = route.params;
  const start = new Date(plan.startDate);
  const [selectedDate, setSelectedDate] = useState(plan.startDate);
  const [markedDates, setMarkedDates] = useState([]);
  const [dayEvents, setDayEvents] = useState([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formDate, setFormDate] = useState(plan.startDate);
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formPlace, setFormPlace] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formCost, setFormCost] = useState('');
  const [saving, setSaving] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState('');
  const [confirmEventId, setConfirmEventId] = useState(null);
  const [showConfirmEvent, setShowConfirmEvent] = useState(false);
  const [confirmEventChecked, setConfirmEventChecked] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editPlace, setEditPlace] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadDays = async () => {
      setLoadingDays(true);
      setError(null);
      try {
        const { data: rows, error: daysError } = await supabase
          .from('trip_events')
          .select('date')
          .eq('trip_id', Number(plan.id));
        if (daysError) {
          // Fallback si la tabla unificada aún no existe
          const tableMissing = daysError?.code === 'PGRST205' || String(daysError?.message || '').includes('trip_events');
          if (!tableMissing) throw daysError;
          const { data: legacyDays, error: legacyErr } = await supabase
            .from('trip_days')
            .select('date')
            .eq('trip_id', Number(plan.id));
          if (legacyErr) throw legacyErr;
          const legacyDates = Array.from(new Set((legacyDays || []).map((d) => d.date)));
          if (isMounted) setMarkedDates(legacyDates);
          return;
        }
        const dates = Array.from(new Set((rows || []).map((r) => r.date)));
        if (isMounted) setMarkedDates(dates);
      } catch (err) {
        console.error('Error cargando fechas del viaje:', err);
        setError('No se pudieron cargar las fechas del plan.');
      } finally {
        if (isMounted) setLoadingDays(false);
      }
    };
    loadDays();
    return () => { isMounted = false; };
  }, [plan.id]);

  // Cargar moneda preferida del usuario
  useEffect(() => {
    let isMounted = true;
    const loadCurrency = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!authUser) return;
        const { data: userRow, error: userError } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', authUser.email)
          .maybeSingle();
        if (userError) throw userError;
        if (!userRow) return;
        const { data: prefsRow, error: prefsError } = await supabase
          .from('user_preferences')
          .select('preferred_currency')
          .eq('user_id', userRow.user_id)
          .maybeSingle();
        if (prefsError) throw prefsError;
        if (isMounted && prefsRow?.preferred_currency) {
          setPreferredCurrency(prefsRow.preferred_currency);
        }
      } catch (err) {
        console.warn('No se pudo cargar la moneda preferida:', err);
      }
    };
    loadCurrency();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadEventsForDate = async () => {
      setLoadingEvents(true);
      setError(null);
      try {
        const { data: events, error: evError } = await supabase
          .from('trip_events')
          .select('event_id, start_time, end_time, notes, place_name, estimated_cost')
          .eq('trip_id', Number(plan.id))
          .eq('date', selectedDate)
          .order('start_time', { ascending: true });
        if (evError) {
          const tableMissing = evError?.code === 'PGRST205' || String(evError?.message || '').includes('trip_events');
          if (!tableMissing) throw evError;
          // Fallback a tablas antiguas
          const { data: dayRow, error: findError } = await supabase
            .from('trip_days')
            .select('trip_day_id')
            .eq('trip_id', Number(plan.id))
            .eq('date', selectedDate)
            .maybeSingle();
          if (findError) throw findError;
          if (!dayRow) {
            if (isMounted) setDayEvents([]);
            return;
          }
          const { data: activities, error: actError } = await supabase
            .from('trip_activities')
            .select('activity_id, start_time, end_time, notes')
            .eq('trip_day_id', dayRow.trip_day_id)
            .order('start_time', { ascending: true });
          if (actError) throw actError;
          const mappedLegacy = (activities || []).map((a) => ({
            id: String(a.activity_id),
            date: selectedDate,
            title: a.notes || 'Actividad',
            start: a.start_time || '',
            end: a.end_time || '',
            location: '',
            cost: a.estimated_cost ?? null,
          }));
          if (isMounted) setDayEvents(mappedLegacy);
          return;
        }
        const mapped = (events || []).map((e) => ({
          id: String(e.event_id),
          date: selectedDate,
          title: e.notes || e.place_name || 'Actividad',
          start: e.start_time || '',
          end: e.end_time || '',
          location: e.place_name || '',
          cost: e.estimated_cost ?? null,
        }));
        if (isMounted) setDayEvents(mapped);
      } catch (err) {
        console.error('Error cargando actividades del día:', err);
        setError('No se pudieron cargar los eventos del día.');
      } finally {
        if (isMounted) setLoadingEvents(false);
      }
    };
    loadEventsForDate();
    return () => { isMounted = false; };
  }, [plan.id, selectedDate]);

  const fmtTime = (t) => {
    if (!t) return '--:--';
    const s = String(t);
    const m = s.match(/^([0-2]\d):([0-5]\d)/);
    return m ? `${m[1]}:${m[2]}` : s.slice(0,5);
  };

  // Permite solo números y un separador decimal ("," o ".")
  const sanitizeMoney = (text) => {
    if (!text) return '';
    let s = String(text).replace(/[^\d.,]/g, '');
    const sepIndex = s.search(/[.,]/);
    if (sepIndex !== -1) {
      const before = s.slice(0, sepIndex + 1);
      const after = s.slice(sepIndex + 1).replace(/[.,]/g, '');
      s = before + after;
    }
    if (s[0] === '.' || s[0] === ',') s = '0' + s;
    return s;
  };

  const withinRange = (iso) => {
    return (!plan.startDate || iso >= plan.startDate) && (!plan.endDate || iso <= plan.endDate);
  };

  const handleSubmitEvent = async () => {
    if (saving) return;
    setError(null);
    // Validaciones básicas
    const dateIso = (formDate || '').trim();
    const startTime = (formStart || '').trim();
    const endTime = (formEnd || '').trim();
    const notes = (formNotes || '').trim();
    const place = (formPlace || '').trim();
    const costNum = (() => {
      const v = (formCost || '').trim();
      if (!v) return null;
      const n = Number(v.replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    })();
    if (!dateIso || !startTime) {
      setError('Fecha y hora de inicio son obligatorias.');
      return;
    }
    if (!withinRange(dateIso)) {
      setError('La fecha debe estar dentro del rango del viaje.');
      return;
    }
    setSaving(true);
    try {
      const { error: insError } = await supabase
        .from('trip_events')
        .insert({
          trip_id: Number(plan.id),
          date: dateIso,
          start_time: startTime,
          end_time: endTime || null,
          notes: notes || null,
          place_name: place || null,
          estimated_cost: costNum,
        });
      if (insError) {
        const tableMissing = insError?.code === 'PGRST205' || String(insError?.message || '').includes('trip_events');
        if (!tableMissing) throw insError;
        // Fallback: crear/obtener día y guardar en trip_activities
        const { data: upsertDay, error: upErr } = await supabase
          .from('trip_days')
          .upsert({ trip_id: Number(plan.id), date: dateIso, day_index: Math.max(1, Math.floor((new Date(dateIso) - new Date(plan.startDate)) / (24*3600*1000)) + 1) }, { onConflict: 'trip_id,date' })
          .select('trip_day_id')
          .maybeSingle();
        if (upErr) throw upErr;
        const tripDayId = upsertDay?.trip_day_id;
        if (!tripDayId) {
          const { data: existingDay, error: findDayErr } = await supabase
            .from('trip_days')
            .select('trip_day_id')
            .eq('trip_id', Number(plan.id))
            .eq('date', dateIso)
            .maybeSingle();
          if (findDayErr) throw findDayErr;
          if (!existingDay) throw new Error('No se pudo obtener el día del viaje.');
          const { error: actInsErr } = await supabase
            .from('trip_activities')
            .insert({
              trip_day_id: existingDay.trip_day_id,
              start_time: startTime || null,
              end_time: endTime || null,
              notes: notes || null,
              estimated_cost: costNum,
            });
          if (actInsErr) throw actInsErr;
        } else {
          const { error: actInsErr } = await supabase
            .from('trip_activities')
            .insert({
              trip_day_id: tripDayId,
              start_time: startTime || null,
              end_time: endTime || null,
              notes: notes || null,
              estimated_cost: costNum,
            });
          if (actInsErr) throw actInsErr;
        }
      }
      // Refrescar listas
      setSelectedDate(dateIso);
      setShowAddForm(false);
      setFormDate(dateIso);
      setFormStart('');
      setFormEnd('');
      setFormPlace('');
      setFormNotes('');
      // Sin tipo de actividad
      setFormCost('');
      // recargar días y eventos
      // carga días
      // Recarga marcas (soporta ambas fuentes)
      const { data: rows, error: rErr } = await supabase
        .from('trip_events')
        .select('date')
        .eq('trip_id', Number(plan.id));
      if (rErr) {
        const tableMissing = rErr?.code === 'PGRST205' || String(rErr?.message || '').includes('trip_events');
        if (tableMissing) {
          const { data: legacyDays } = await supabase
            .from('trip_days')
            .select('date')
            .eq('trip_id', Number(plan.id));
          setMarkedDates(Array.from(new Set((legacyDays || []).map((d) => d.date))));
        }
      } else {
        setMarkedDates(Array.from(new Set((rows || []).map((r) => r.date))));
      }
      // carga eventos para fecha
      const { data: events, error: eErr } = await supabase
        .from('trip_events')
        .select('event_id, start_time, end_time, notes, place_name, estimated_cost')
        .eq('trip_id', Number(plan.id))
        .eq('date', dateIso)
        .order('start_time', { ascending: true });
      if (eErr) {
        const tableMissing = eErr?.code === 'PGRST205' || String(eErr?.message || '').includes('trip_events');
        if (tableMissing) {
          const { data: dayRow } = await supabase
            .from('trip_days')
            .select('trip_day_id')
            .eq('trip_id', Number(plan.id))
            .eq('date', dateIso)
            .maybeSingle();
          if (!dayRow) { setDayEvents([]); }
          else {
            const { data: activities } = await supabase
              .from('trip_activities')
              .select('activity_id, start_time, end_time, notes, estimated_cost')
              .eq('trip_day_id', dayRow.trip_day_id)
              .order('start_time', { ascending: true });
            setDayEvents((activities || []).map((a) => ({
              id: String(a.activity_id),
              date: dateIso,
              title: a.notes || 'Actividad',
              start: a.start_time || '',
              end: a.end_time || '',
              location: '',
              cost: a.estimated_cost ?? null,
            })));
          }
        }
      } else {
        setDayEvents((events || []).map((e) => ({
          id: String(e.event_id),
          date: dateIso,
          title: e.notes || e.place_name || 'Actividad',
          start: e.start_time || '',
          end: e.end_time || '',
          location: e.place_name || '',
          cost: e.estimated_cost ?? null,
        })));
      }
    } catch (err) {
      console.error('Error guardando actividad:', err);
      setError('No se pudo guardar la actividad.');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (item) => {
    setEditEventId(item.id);
    setEditDate(item.date);
    setEditStart(item.start || '');
    setEditEnd(item.end || '');
    setEditPlace(item.location || '');
    // title puede venir de notes o place_name; usamos description como notas
    setEditNotes(item.title && item.location !== item.title ? item.title : (item.title || ''));
    setEditCost(typeof item.cost === 'number' ? String(item.cost) : '');
    setShowEditEvent(true);
  };

  const handleUpdateEvent = async () => {
    if (editSaving) return;
    setError(null);
    const dateIso = (editDate || '').trim();
    const startTime = (editStart || '').trim();
    const endTime = (editEnd || '').trim();
    const notes = (editNotes || '').trim();
    const place = (editPlace || '').trim();
    const costNum = (() => {
      const v = (editCost || '').trim();
      if (!v) return null;
      const n = Number(v.replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    })();
    if (!dateIso || !startTime) {
      setError('Fecha y hora de inicio son obligatorias.');
      return;
    }
    if (!withinRange(dateIso)) {
      setError('La fecha debe estar dentro del rango del viaje.');
      return;
    }
    setEditSaving(true);
    try {
      const { error: upError } = await supabase
        .from('trip_events')
        .update({
          date: dateIso,
          start_time: startTime,
          end_time: endTime || null,
          notes: notes || null,
          place_name: place || null,
          estimated_cost: costNum,
        })
        .eq('event_id', Number(editEventId));
      if (upError) {
        const tableMissing = upError?.code === 'PGRST205' || String(upError?.message || '').includes('trip_events');
        if (!tableMissing) throw upError;
        // Fallback: tablas antiguas (trip_activities). No movemos de día (date permanece)
        const { error: legacyErr } = await supabase
          .from('trip_activities')
          .update({
            start_time: startTime,
            end_time: endTime || null,
            notes: notes || null,
            estimated_cost: costNum,
          })
          .eq('activity_id', Number(editEventId));
        if (legacyErr) throw legacyErr;
      }

      // cerrar modal
      setShowEditEvent(false);
      // refrescar marcas
      try {
        const { data: rows, error: rErr } = await supabase
          .from('trip_events')
          .select('date')
          .eq('trip_id', Number(plan.id));
        if (rErr) {
          const tableMissing = rErr?.code === 'PGRST205' || String(rErr?.message || '').includes('trip_events');
          if (tableMissing) {
            const { data: legacyDays } = await supabase
              .from('trip_days')
              .select('date')
              .eq('trip_id', Number(plan.id));
            setMarkedDates(Array.from(new Set((legacyDays || []).map((d) => d.date))));
          }
        } else {
          setMarkedDates(Array.from(new Set((rows || []).map((r) => r.date))));
        }
      } catch {}

      // refrescar eventos del día actual (si cambió la fecha, usamos la editada)
      const targetDate = dateIso;
      try {
        const { data: events, error: eErr } = await supabase
          .from('trip_events')
          .select('event_id, start_time, end_time, notes, place_name, estimated_cost')
          .eq('trip_id', Number(plan.id))
          .eq('date', targetDate)
          .order('start_time', { ascending: true });
        if (eErr) {
          const tableMissing = eErr?.code === 'PGRST205' || String(eErr?.message || '').includes('trip_events');
          if (tableMissing) {
            const { data: dayRow } = await supabase
              .from('trip_days')
              .select('trip_day_id')
              .eq('trip_id', Number(plan.id))
              .eq('date', targetDate)
              .maybeSingle();
            if (!dayRow) { setDayEvents([]); }
            else {
              const { data: activities } = await supabase
                .from('trip_activities')
                .select('activity_id, start_time, end_time, notes, estimated_cost')
                .eq('trip_day_id', dayRow.trip_day_id)
                .order('start_time', { ascending: true });
              setDayEvents((activities || []).map((a) => ({
                id: String(a.activity_id),
                date: targetDate,
                title: a.notes || 'Actividad',
                start: a.start_time || '',
                end: a.end_time || '',
                location: '',
                cost: a.estimated_cost ?? null,
              })));
            }
          }
        } else {
          setDayEvents((events || []).map((e) => ({
            id: String(e.event_id),
            date: targetDate,
            title: e.notes || e.place_name || 'Actividad',
            start: e.start_time || '',
            end: e.end_time || '',
            location: e.place_name || '',
            cost: e.estimated_cost ?? null,
          })));
        }
        setSelectedDate(targetDate);
      } catch {}
    } catch (err) {
      console.error('Error actualizando actividad:', err);
      setError('No se pudo actualizar la actividad.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const { error: delError } = await supabase
        .from('trip_events')
        .delete()
        .eq('event_id', Number(eventId));
      if (delError) throw delError;
      setDayEvents((prev) => prev.filter((e) => String(e.id) !== String(eventId)));
    } catch (err) {
      console.error('Error eliminando evento:', err);
      setError('No se pudo eliminar el evento.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
      <View>
        <Text style={styles.title}>{plan.name}</Text>
        {plan.destination ? <Text style={styles.sub}>{plan.destination}</Text> : null}
        <Text style={styles.range}>{plan.startDate} → {plan.endDate}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => { setShowAddForm((s) => !s); setFormDate(selectedDate); }}>
          <Text style={styles.addButtonText}>{showAddForm ? 'Cerrar formulario' : 'Agregar actividad'}</Text>
        </TouchableOpacity>
        <View style={{ marginVertical: 12 }}>
          {loadingDays ? (
            <ActivityIndicator color={colors.cyan} />
          ) : (
            <Calendar
              year={start.getFullYear()}
              month={start.getMonth()}
              markedDates={markedDates}
              rangeStart={plan.startDate}
              rangeEnd={plan.endDate}
              onSelectDate={(iso) => { setSelectedDate(iso); setFormDate(iso); }}
            />
          )}
        </View>
        {showAddForm && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Nueva actividad</Text>
            <TextInput
              value={formDate}
              onChangeText={setFormDate}
              placeholder="Fecha (YYYY-MM-DD)"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TextInput
                value={formStart}
                onChangeText={setFormStart}
                placeholder="Inicio (HH:MM)"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, { width: '48%' }]}
              />
              <TextInput
                value={formEnd}
                onChangeText={setFormEnd}
                placeholder="Fin (HH:MM opcional)"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, { width: '48%' }]}
              />
            </View>
            <TextInput
              value={formPlace}
              onChangeText={setFormPlace}
              placeholder="Lugar"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <TextInput
              value={formNotes}
              onChangeText={setFormNotes}
              placeholder="Descripción"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <TextInput
              value={formCost}
              onChangeText={(t) => setFormCost(sanitizeMoney(t))}
              placeholder="Costo (opcional)"
              keyboardType="numeric"
              inputMode="decimal"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmitEvent} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.black} /> : <Text style={styles.saveButtonText}>Guardar actividad</Text>}
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.sectionTitle}>Eventos para {selectedDate}</Text>
        {error ? (
          <Text style={styles.empty}>{error}</Text>
        ) : loadingEvents ? (
          <ActivityIndicator color={colors.cyan} />
        ) : dayEvents.length === 0 ? (
          <Text style={styles.empty}>No hay eventos para esta fecha.</Text>
        ) : (
          <FlatList
            data={dayEvents}
            keyExtractor={(i) => String(i.id)}
            renderItem={({ item }) => (
              <View style={styles.event}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={() => openEditModal(item)}>
                      <Text style={{ color: colors.cyan }}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setConfirmEventId(item.id); setShowConfirmEvent(true); setConfirmEventChecked(false); }}>
                      <Text style={{ color: '#EF4444' }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.eventMeta}>
                  {fmtTime(item.start)}{item.end ? `–${fmtTime(item.end)}` : ''}
                  {item.location ? ` · ${item.location}` : ''}
                  {typeof item.cost === 'number' ? ` · Costo: ${preferredCurrency ? preferredCurrency + ' ' : ''}${item.cost}` : ''}
                </Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        )}
      </View>
      {/* Confirmación de eliminación de evento */}
      <Modal visible={showConfirmEvent} transparent animationType="fade" onRequestClose={() => setShowConfirmEvent(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View style={{ backgroundColor: colors.gray, borderRadius: 12, padding: 16, width: '90%' }}>
            <Text style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}>Confirmar eliminación</Text>
            <Text style={{ color: '#D1D5DB', marginTop: 8 }}>¿Seguro que deseas eliminar este evento? Esta acción es permanente y no puede deshacerse.</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }} onPress={() => setConfirmEventChecked((c) => !c)}>
              <Ionicons name={confirmEventChecked ? 'checkbox-outline' : 'square-outline'} size={22} color={colors.cyan} />
              <Text style={{ color: colors.white, marginLeft: 8 }}>Confirmo que deseo eliminar el evento</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity onPress={() => { setShowConfirmEvent(false); setConfirmEventId(null); setConfirmEventChecked(false); }} style={{ paddingVertical: 8, paddingHorizontal: 12, marginRight: 8 }}>
                <Text style={{ color: colors.white }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!confirmEventChecked}
                onPress={async () => {
                  const id = confirmEventId;
                  setShowConfirmEvent(false);
                  setConfirmEventChecked(false);
                  setConfirmEventId(null);
                  if (id) await handleDeleteEvent(id);
                }}
                style={{ backgroundColor: confirmEventChecked ? '#EF4444' : '#6B7280', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }}
              >
                <Text style={{ color: colors.black, fontWeight: 'bold' }}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edición de evento */}
      <Modal visible={showEditEvent} transparent animationType="fade" onRequestClose={() => setShowEditEvent(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View style={{ backgroundColor: colors.gray, borderRadius: 12, padding: 16, width: '90%' }}>
            <Text style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}>Editar actividad</Text>
            <TextInput
              value={editDate}
              onChangeText={setEditDate}
              placeholder="Fecha (YYYY-MM-DD)"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TextInput
                value={editStart}
                onChangeText={setEditStart}
                placeholder="Inicio (HH:MM)"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, { width: '48%' }]}
              />
              <TextInput
                value={editEnd}
                onChangeText={setEditEnd}
                placeholder="Fin (HH:MM opcional)"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, { width: '48%' }]}
              />
            </View>
            <TextInput
              value={editPlace}
              onChangeText={setEditPlace}
              placeholder="Lugar"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <TextInput
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Descripción"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <TextInput
              value={editCost}
              onChangeText={(t) => setEditCost(sanitizeMoney(t))}
              placeholder="Costo (opcional)"
              keyboardType="numeric"
              inputMode="decimal"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity onPress={() => setShowEditEvent(false)} style={{ paddingVertical: 10, paddingHorizontal: 12, marginRight: 8 }}>
                <Text style={{ color: colors.white }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateEvent} disabled={editSaving}>
                {editSaving ? <ActivityIndicator color={colors.black} /> : <Text style={styles.saveButtonText}>Guardar cambios</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black, padding: 16 },
  title: { color: colors.cyan, fontSize: 22 },
  sub: { color: '#93C5FD' },
  range: { color: '#D1D5DB', marginTop: 4 },
  addButton: { marginTop: 8, backgroundColor: colors.cyan, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: colors.black, fontWeight: 'bold' },
  sectionTitle: { color: colors.white, marginTop: 8 },
  empty: { color: '#9CA3AF', marginTop: 8 },
  event: { backgroundColor: colors.gray, borderRadius: 12, padding: 12 },
  eventTitle: { color: colors.white, fontSize: 16 },
  eventMeta: { color: '#D1D5DB', marginTop: 4 },
  form: { backgroundColor: colors.gray, borderRadius: 12, padding: 12, marginBottom: 12 },
  input: { backgroundColor: '#111827', color: colors.white, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8 },
  saveButton: { marginTop: 12, backgroundColor: colors.cyan, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: colors.black, fontWeight: 'bold' },
});