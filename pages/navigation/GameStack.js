import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import UserPage from "../userPage/UserPage";
import Ranking from "../ranking/Ranking";
import UserStack from "./UserStack";
import Game from "../game/Game";
import GameMenu from "../game/GameMenu";

const GamePageStack = createStackNavigator();

export default function GameStack() {
  return (
    <GamePageStack.Navigator>
      <GamePageStack.Screen
        options={{ headerShown: false }}
        component={GameMenu}
        name="GameMenuPage"
      />
      <GamePageStack.Screen
        options={({ route }) => ({ title: route.params.subject })}
        component={Game}
        name="GamePage"
      />
    </GamePageStack.Navigator>
  );
}
