import React from 'react'
import {NavigationContainer} from '@react-navigation/native'
import { createStackNavigator } from "@react-navigation/stack";
import UserPage from '../userPage/UserPage'
import HomePage from '../HomaPage/HomePage'
import LoadingPage from '../LoadingPage/LoadingPage'
import UserStack from './UserStack';

const HomePageStack = createStackNavigator()

export default function HomeStack() {
  return (
    <HomePageStack.Navigator>
      <HomePageStack.Screen
        options={{ headerShown: false }}
        component={HomePage}
        name="HomePage"
      />
      <HomePageStack.Screen
        options={({ route }) => ({ title: route.params.user.username })}
        component={UserStack}
        name="UserStack"
      />
    </HomePageStack.Navigator>
  );
} 

//<HomePageStack.Screen name="UserPage" component={UserPage} />