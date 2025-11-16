// App.js
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  NavigationContainer,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import PlansScreen from './src/screens/PlansScreen';
import PlanDetailScreen from './src/screens/PlanDetailScreen';
import DestinationsScreen from './src/screens/DestinationsScreen';
import AccountScreen from './src/screens/AccountScreen';
import { colors } from './src/theme/colors';
import { supabase } from './src/lib/supabase';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs({ onLogout }) {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Chatbot') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Planes') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Destinos') {
            iconName = focused ? 'earth' : 'earth-outline';
          } else if (route.name === 'Cuenta') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: colors.black,
          borderTopColor: colors.gray,
        },
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: colors.white,
        headerStyle: {
          backgroundColor: colors.black,
        },
        headerTintColor: colors.white,
        headerTitleAlign: 'center',
      })}
    >
      <Tabs.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{ title: 'Hermes' }}
      />
      <Tabs.Screen
        name="Planes"
        component={PlansScreen}
        options={{ title: 'Mis Planes' }}
      />
      <Tabs.Screen
        name="Destinos"
        component={DestinationsScreen}
        options={{ title: 'Destinos Populares' }}
      />
      <Tabs.Screen name="Cuenta" options={{ title: 'Cuenta' }}>
        {(props) => <AccountScreen {...props} onLogout={onLogout} />}
      </Tabs.Screen>
    </Tabs.Navigator>
  );
}

export default function App() {
  // user tiene siempre este shape: { user, session, email, name } o null
  const [user, setUser] = useState(null);

  // Inicializar sesión y escuchar eventos de auth
  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.log('Error obteniendo sesión inicial:', error);
          return;
        }

        if (session?.user && isMounted) {
          const u = session.user;
          setUser({
            user: u,
            session,
            email: u.email,
            name:
              u.user_metadata?.full_name ||
              u.user_metadata?.name ||
              u.email,
          });
        }
      } catch (err) {
        console.log('Error inesperado al inicializar sesión:', err);
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        return;
      }

      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        const u = session.user;
        setUser({
          user: u,
          session,
          email: u.email,
          name:
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            u.email,
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Test de Supabase solo en desarrollo
  useEffect(() => {
    if (!__DEV__) return;

    const testSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('countries')
          .select('*')
          .limit(3);
        console.log('Supabase test data:', data);
        if (error) console.log('Supabase test error:', error);
      } catch (err) {
        console.log('Error en prueba de Supabase:', err);
      }
    };

    testSupabase();
  }, []);

  const theme = useMemo(
    () => ({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: colors.black,
        card: colors.gray,
        text: colors.white,
        primary: colors.cyan,
        border: '#374151',
      },
    }),
    []
  );

  const handleLogin = (authPayload) => {
    // authPayload: { user, session, email, name }
    setUser(authPayload);
  };

  const handleLogout = () => {
    // supabase.auth.signOut se ejecuta en AccountScreen;
    // aquí solo limpiamos el estado local para volver al stack de auth
    setUser(null);
  };

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.black },
          headerTintColor: colors.white,
        }}
      >
        {user ? (
          <Stack.Screen name="HermesTravel" options={{ headerShown: false }}>
            {(props) => <MainTabs {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => (
                <LoginScreen
                  {...props}
                  onLogin={handleLogin}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register" options={{ headerShown: false }}>
              {(props) => (
                <RegisterScreen
                  {...props}
                  onRegister={handleLogin}
                />
              )}
            </Stack.Screen>
          </>
        )}
        <Stack.Screen
          name="PlanDetalle"
          component={PlanDetailScreen}
          options={{ title: 'Plan' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
