/**
 * Navegação do Pai (Bottom Tabs)
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ParentDashboardScreen from '../screens/parent/ParentDashboardScreen';
import ManageTasksScreen from '../screens/parent/ManageTasksScreen';
import CreateRewardScreen from '../screens/parent/CreateRewardScreen';
import ManageChildrenScreen from '../screens/parent/ManageChildrenScreen';
import { COLORS } from '../utils/constants';

export type ParentTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Rewards: undefined;
  Children: undefined;
};

const Tab = createBottomTabNavigator<ParentTabParamList>();

const ParentNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        tabBarActiveTintColor: COLORS.parent.primary,
        tabBarInactiveTintColor: COLORS.common.textLight,
        headerStyle: {
          backgroundColor: COLORS.parent.primary,
        },
        headerTintColor: COLORS.common.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ParentDashboardScreen}
        options={{
          title: 'Início',
          headerShadowVisible: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={ManageTasksScreen}
        options={{
          title: 'Tarefas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Rewards"
        component={CreateRewardScreen}
        options={{
          title: 'Recompensas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="gift" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Children"
        component={ManageChildrenScreen}
        options={{
          title: 'Crianças',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ParentNavigator;
