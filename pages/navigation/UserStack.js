import React, { useState } from "react";

import { createStackNavigator } from "@react-navigation/stack";
import UserPage from "../userPage/UserPage";
import Ranking from "../ranking/Ranking";
import RankingStack from "./RankingStack";

const RankingPageStack = createStackNavigator();

export default function UserStack({route, navigation}) {
    const {user} = route.params
    const headerTitleForUserFollowingPage = {...user, username: `${user.username} segue:`}
  return (
    <RankingPageStack.Navigator>
      <RankingPageStack.Screen
        options={{ headerShown: false }}
        component={UserPage}
        name="UserPage"
        initialParams={{ user }}
      />
      <RankingPageStack.Screen
        options={{ headerShown: false }}
        component={RankingStack}
        name="RankingStack"
        initialParams={{uid: user.id}}
      />
    </RankingPageStack.Navigator>
  );
}
