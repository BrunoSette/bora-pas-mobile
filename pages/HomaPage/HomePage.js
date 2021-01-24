import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Header from "../../shered-components/Header";
import Snippet from "../../shered-components/Snippet";
import { auth, firestore, storage } from "../../firebase/firebaseContext";
import User from "../../shered-components/User";
import { useGetUserImages } from "../../hooks&functions/useGetUserImages";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import Book from "../../assets/svgs/book";
import { CommonActions } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { GlobalContext } from "../../context/GlobalContext";
//import SimpleBar from "simplebar-react";
//import Simplebar from 'simplebar'
//import "simplebar/dist/simplebar.min.css";
//import { loadGetInitialProps } from "next/dist/next-server/lib/utils";

export default function HomePage({ navigation }) {
  //const navigation = useNavigation()
  const [users, setUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [globalState, setGlobalState] = useContext(GlobalContext);

  const [isLoadingRanking, setIsLoadingRanking] = useState(true)
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(true)

  useEffect(() => {
    function getUsersWithHigherPontuations() {
      let position = 0;
      firestore
        .collection("users")
        .where("privateInfo", "==", false)
        .orderBy("points", "desc")
        .limit(10)
        .get()
        .then((users) => {
          users.forEach((user) => {
            position++;
            let aUser = { ...user.data(), position, id: user.id };

            useGetUserImages(aUser, user.id, setUsers);
          });
          setIsLoadingRanking(false)
        });
    }

    function getFollowingUsers() {
      setIsLoadingData(true);
      let position = 0;

      firestore
        .collection("users")
        .doc(auth.currentUser.uid)
        .get()
        .then((userCred) => {
          const currentUser = userCred.data();
          const user = {
            ...userCred.data(),
            id: userCred.id,
          };
          useGetUserImages(
            globalState.currentUser,
            globalState.currentUser.uid,
            setCurrentUser,
            false
          );

          firestore
            .collection("users")
            .orderBy("points", "desc")
            .limit(10)
            .get()
            .then((users) => {
              setIsLoadingData(false);
              users.forEach((userCred) => {
                position++;

                let user = userCred.data();
                if (!currentUser.following.includes(userCred.id)) return;
                let aUser = { ...user, id: userCred.id, position };

                useGetUserImages(aUser, userCred.id, setFollowingUsers);
                setIsLoadingFollowing(false)
              });
            });
        });
    }

    getUsersWithHigherPontuations();
    getFollowingUsers();
  }, []);

  return (
    <>
      <Header />
      <View>
        <ScrollView style={{ marginBottom: 100 }} scrollEnabled={true}>
          <TouchableOpacity
            style={{ height: 103 }}
            onPress={() => {
              currentUser.following &&
                navigation.navigate("UserPage", {
                  user: currentUser,
                });
            }}
          >
            <Snippet size="small">
              <Text
                style={{ fontWeight: "bold", fontSize: 20, marginLeft: 15 }}
              >
                Seus pontos:{" "}
                <Text style={{ color: "rgb(45, 156, 73)" }}>
                  {globalState.currentUser.points}
                </Text>
              </Text>
            </Snippet>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Game")}>
            <Snippet color="green" text="Testar meus conecimentos">
              <Book />
            </Snippet>
          </TouchableOpacity>

          <Snippet size="big">
            {!isLoadingRanking ? (
              <ScrollView style={{ paddingHorizontal: 8, paddingTop: 5 }}>
                <Text style={{ fontWeight: "bold", fontSize: 22 }}>
                  Ranking geral:
                </Text>
                {users.map((user) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("UserStack", {
                          user,
                        });
                      }}
                    >
                      <User user={user}></User>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <View
                style={{
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <ActivityIndicator
                  style={{ alignSelf: "center" }}
                  color="rgb(45, 156, 73)"
                  size={50 || "large"}
                />
              </View>
            )}
          </Snippet>

          <Snippet size="big">
            {!isLoadingFollowing ? (
              <ScrollView style={{ paddingHorizontal: 8, paddingTop: 0 }}>
                <Text style={{ fontWeight: "bold", fontSize: 22 }}>
                  Você segue:
                </Text>
                {followingUsers.map((user) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("UserStack", {
                          user,
                        });
                      }}
                    >
                      <User user={user}></User>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <View
                style={{
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <ActivityIndicator
                  style={{ alignSelf: "center" }}
                  color="rgb(45, 156, 73)"
                  size={50 || "large"}
                />
              </View>
            )}
          </Snippet>
        </ScrollView>
      </View>
    </>
  );
}
