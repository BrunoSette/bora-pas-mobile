import React, { useContext, useEffect, useState } from "react";
import LoginPage from "../LoginPage/index";
//import UserPage from "../";
import { GlobalContext } from "../../context/GlobalContext";
import { auth } from "../../firebase/firebaseContext";
import LoadingPage from "../LoadingPage/LoadingPage";
import { Text, View } from "react-native";
import HomePage from '../HomaPage/HomePage'
import StackNavigation from '../navigation/HomeStack'

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import UserPage from "../userPage/UserPage";

function CurrentPage() {
  const [globalState, setGlobalState] = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = globalState;

  const UserPageStack = createStackNavigator();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setGlobalState((state) => {
          return { ...state, user: { ...state.user, isLoggedIn: true } };
        });
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <View>
        <LoadingPage />
      </View>
    );
  }

  return (
    <View>
      {user.isLoggedIn ? (
        <HomePage></HomePage>
      ) : (
        <View>
          <LoginPage />
        </View>
      )}
    </View>
  );
}

export default CurrentPage;
