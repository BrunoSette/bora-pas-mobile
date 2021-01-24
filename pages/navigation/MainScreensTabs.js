import React from "react";
import { View, Text, TabBarIOSItem } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import HomePage from "../HomaPage/HomePage";
import HomeStack from "./HomeStack";
import Ranking from "../ranking/Ranking";
import GenericHeader from "../../shered-components/GenericHeader";
import RankingStack from "./RankingStack";
import GameMenu from "../game/GameMenu";
import GameStack from "./GameStack";

const MainTabs = createMaterialBottomTabNavigator();

export default function MainScreensTabs() {
  return (
    <MainTabs.Navigator
      inactiveColor="rgb(200, 200, 200)"
      activeColor="rgb(45, 156, 73)"
      barStyle={{
        backgroundColor: "white",
        elevation: 200,
        borderTopColor: "rgb(230, 230, 230)",
        borderTopWidth: 2,
      }}
      tabBarOptions={{
        tabBarOptions: {
          showIcon: false,
        },
      }}
    >
      <MainTabs.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => {
            return <MaterialIcons name="home" color={color} size={22} />;
          },
        }}
      />
      <MainTabs.Screen
        options={{
          tabBarLabel: "Game",
          tabBarIcon: ({ color }) => {
            return <MaterialIcons name="book" color={color} size={22} />;
          },
        }}
        name="Game"
        component={GameStack}
      />
      <MainTabs.Screen
        options={{
          tabBarLabel: "Ranking",
          tabBarIcon: ({ color }) => {
            return <MaterialIcons name="star" color={color} size={22} />;
          },
        }}
        name="Ranking"
        component={RankingStack}
        initialParams={{ pageType: "default" }}
      />
      <MainTabs.Screen
        options={{
          tabBarLabel: "Sobre",
          tabBarIcon: ({ color }) => {
            return <MaterialIcons name="pending" color={color} size={22} />;
          },
        }}
        name="Sobre"
        component={Sobre}
      />
    </MainTabs.Navigator>
  );
}

function Sobre() {
  return (
    <View>
      <GenericHeader text="Sobre"/>
    </View>
  );
}
