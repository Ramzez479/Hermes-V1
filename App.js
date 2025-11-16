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

function MainTabs() {
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
      <Tabs.Screen
        name="Cuenta"
        component={AccountScreen}
        options={{ title: 'Cuenta' }}
      />
    </Tabs.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  // 🔹 PRUEBA de conexión a Supabase: se ejecuta una sola vez al montar App
  useEffect(() => {
    const testSupabase = async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .limit(3);

      console.log('Supabase test data:', data);
      console.log('Supabase test error:', error);
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
          <Stack.Screen
            name="HermesTravel"
            component={MainTabs}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => (
                <LoginScreen
                  {...props}
                  onLogin={(u) => setUser(u)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register" options={{ headerShown: false }}>
              {(props) => (
                <RegisterScreen
                  {...props}
                  onRegister={(u) => setUser(u)}
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
