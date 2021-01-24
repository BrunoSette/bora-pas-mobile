import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import UserPage from "../userPage/UserPage";
import Ranking from "../ranking/Ranking";
import UserStack from "./UserStack";

const RankingPageStack = createStackNavigator();

export default function RankingStack({route, navigation}) {
    const {pageType, uid} = route.params
    console.log('UID FROM Stack: ' + uid)
  return (
    <RankingPageStack.Navigator>
      <RankingPageStack.Screen
        options={{ headerShown: false }}
        component={Ranking}
        name="RankingPage"
        initialParams={{pageType, uid}}
      />
      <RankingPageStack.Screen
        options={({ route }) => ({ title: route.params.user.username })}
        component={UserStack}
        name="UserPage"
        initialParams={{pageType, uid}}
      />
    </RankingPageStack.Navigator>
  );
}

//<HomePageStack.Screen name="UserPage" component={UserPage} />
