/**
 * Navegação da Criança (Bottom Tabs)
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ChildDashboardScreen from '../screens/child/ChildDashboardScreen';
import TasksListScreen from '../screens/child/TasksListScreen';
import RewardsShopScreen from '../screens/child/RewardsShopScreen';
import ProfileScreen from '../screens/child/ProfileScreen';
import { COLORS } from '../utils/constants';

export type ChildTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Shop: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ChildTabParamList>();

const ChildNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: COLORS.child.primary,
        tabBarInactiveTintColor: COLORS.common.textLight,
        headerStyle: {
          backgroundColor: COLORS.child.primary,
        },
        headerTintColor: COLORS.common.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ChildDashboardScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksListScreen}
        options={{
          title: 'Tarefas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Shop"
        component={RewardsShopScreen}
        options={{
          title: 'Loja',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shopping" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ChildNavigator;
