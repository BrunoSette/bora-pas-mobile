import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import UserPage from "../userPage/UserPage";
import Ranking from "../ranking/Ranking";
import UserStack from "./UserStack";
import NotificationsPage from "../notifications/NotificationsPage";

const NotificationsPageStack = createStackNavigator();

export default function NotificationsStack({ route, navigation }) {
  return (
    <NotificationsPageStack.Navigator>
      <NotificationsPageStack.Screen
        options={{ headerShown: false }}
        component={NotificationsPage}
        name="NotificationPage"
      />
      <NotificationsPageStack.Screen
        options={({ route }) => ({ title: route.params.user.username })}
        component={UserStack}
        name="UserStack"
      />
    </NotificationsPageStack.Navigator>
  );
}
