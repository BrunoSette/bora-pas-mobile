import React, { useContext, useEffect, useState } from "react";
import { View, Text, FlatList, Dimensions, ActivityIndicator } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { GlobalContext } from "../../context/GlobalContext";
import { firestore } from "../../firebase/firebaseContext";
import { useGetUserImages } from "../../hooks&functions/useGetUserImages";
import GenericHeader from "../../shered-components/GenericHeader";
import User from "../../shered-components/User";

export default function Ranking({ route, navigation }) {
  const { pageType, uid } = route.params;
  const [users, setUsers] = useState([]);
  const [globalState, setGlobalState] = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [lastFetchUser, setLastFetchUser] = useState(false);
  const [globalPosition, setGlobalPosition] = useState(0);
  const [isDataEmpty, setIsDataEmpty] = useState(false);
  const [isFollowingPage, setIsFollowinPage] = useState(false);
  const [isCurrentUserFollowingPage, setIsCurrentUserFollowingPage] = useState(
    false
  );
  const [username, setUsername] = useState("");

  const { height, width } = Dimensions.get("window");

  useEffect(() => {
    if (pageType === "default") {
      loadDefaultContent();
    } else if (pageType === "currentUserFollowing") {
      setIsCurrentUserFollowingPage(true);
    } else if (pageType === "generalFollowing") {
        console.log('gerneral following page')
      setIsFollowinPage(true);
      loadFollowingUsers()
      console.log('UID: '+ uid)
    } else {
        console.log('none')
    }
  }, []);

  async function loadDefaultContent() {
    setIsLoadingData(true);
    let position = globalPosition;

    const ref = firestore
      .collection("users")
      .where("privateInfo", "==", false)
      .orderBy("points", "desc")
      .startAfter(lastFetchUser || 3000)
      .limit(10);

    const data = await ref.get();

    if (data.empty) {
      setIsDataEmpty(true);
    }

    data.forEach((user) => {
      position++;
      setGlobalPosition(position);
      let aUser = { ...user.data(), position, id: user.id };

      useGetUserImages(aUser, user.id, setUsers);
    });

    setIsLoadingData(false);
    setLastFetchUser(data.docs[data.docs.length - 1]);
  }

  async function loadFollowingUsers() {
    setIsLoadingData(true);
    let position = globalPosition;

    const dataCurrentUser = await firestore.collection("users").doc(uid).get()

    let currentUser = dataCurrentUser.data()
    //console.log(uid)
    //setCurrentUser({ ...currentUser, id: uid });

    const followingUsers = await firestore
      .collection("users")
      .orderBy("points", "desc")
      .startAfter(lastFetchUser || 3000)
      .limit(10)
      .get();

    if (followingUsers.empty) {
      setIsLoadingData(false);
      setIsDataEmpty(true);
    }

    followingUsers.forEach((userCred) => {
      position++;
      setGlobalPosition(position);
      let user = userCred.data();

      console.log(currentUser)
      if (!currentUser.following.includes(userCred.id)) return;

      let aUser = { ...user, id: userCred.id, position };

      useGetUserImages(aUser, userCred.id, setUsers);
    });

    setIsLoadingData(false);
    setLastFetchUser(followingUsers.docs[followingUsers.docs.length - 1]);
  }

  function handleScrollEnd() {
    if (isDataEmpty) return;

    if (isFollowingPage) {
      loadFollowingUsers();
    } else {
      loadDefaultContent();
    }
  }

  return (
    <>
      {pageType === 'default' ? <GenericHeader text="Ranking geral:" /> : <View></View>}
      <FlatList
        data={users}
        renderItem={(users) => (
          <TouchableOpacity onPress={()=> {
              navigation.navigate('UserPage', {
                  user: users.item
              })
          }}>
            <User user={users.item} big={true} />
          </TouchableOpacity>
        )}
        onEndReached={() => {
          console.log("END OF SCROLL");
          handleScrollEnd();
        }}
        onEndReachedThreshold={0}
      ></FlatList>
      {isLoadingData ? (
        <View style={{ marginVertical: 20 }}>
          <ActivityIndicator color="rgb(45, 156, 73)" size={50 || 'large'} />
        </View>
      ) : (
        <View></View>
      )}
    </>
  );
}
