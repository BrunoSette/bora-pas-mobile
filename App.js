import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import LoginPage from './pages/LoginPage/index'
import {GlobalContextProvider} from './context/GlobalContext'
import LoginModal from './pages/LoginPage/components/LoginModal';
import CurrentPage from './pages/currentPage/CurrentPage'

import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import LoadingPage from './pages/LoadingPage/LoadingPage';
import HomePage from './pages/HomaPage/HomePage';
import MainScreensTabs from './pages/navigation/MainScreensTabs';

const MainStack = createStackNavigator()

export default function App() {

  return (
    <>
    <StatusBar backgroundColor="white"/>
    <NavigationContainer>
      <GlobalContextProvider>
        <MainStack.Navigator>
          <MainStack.Screen
            options={{ headerShown: false }}
            name="Loading"
            component={LoadingPage}
          />
          <MainStack.Screen
            options={{ headerShown: false }}
            name="Login"
            component={LoginPage}
          />
          <MainStack.Screen
            options={{ headerShown: false }}
            name="Home"
            component={MainScreensTabs}
          />
        </MainStack.Navigator>
      </GlobalContextProvider>
    </NavigationContainer>
    </>
  );
 
}
