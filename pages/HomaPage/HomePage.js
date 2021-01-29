import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Header from "../../shered-components/Header";
import Snippet from "../../shered-components/Snippet";
import { auth, firestore, storage } from "../../firebase/firebaseContext";
import User from "../../shered-components/User";
import { useGetUserImages } from "../../hooks&functions/useGetUserImages";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import Book from "../../assets/svgs/book";
import { useNavigation } from "@react-navigation/native";
import { GlobalContext } from "../../context/GlobalContext";
import * as Notifications from "expo-notifications";
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
  const uid = globalState.currentUser.uid;

  const [isLoadingRanking, setIsLoadingRanking] = useState(true);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(true);

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

            if (aUser.hasImage) {
              useGetUserImages(aUser, user.id, setUsers);
            } else {
              setUsers((users) => {
                return [...users, aUser];
              });
            }
          });
          setIsLoadingRanking(false);
        });
    }

    function getFollowingUsers() {
      setIsLoadingData(true);

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

         
             const following = currentUser.following;
            following.forEach((id) => { 
              console.log(id);
              firestore
                .collection("users")
                .doc(id)
                .get()
                .then((userCred) => {
                  
                  const user = { ...userCred.data(), id: userCred.id };
                  console.log(user);
                  if (user.hasImage) {
                    getUserImages(user, userCred.id, setFollowingUsers);
                  } else {
                    setFollowingUsers((users) => {
                      return [...users, user].sort((a, b) => {
                        return b.points - a.points;
                      });
                    });
                  }
                  setIsLoadingFollowing(false);
                })
                .catch((err) => console.log(err));
    

                function getUserImages(user, id, callback) {
                  storage
                    .ref(`/users/${id}/profileImage`)
                    .getDownloadURL()
                    .then((url) => {
                      user = { ...user, image: url };
                        callback((users) => {
                          const sorted = [...users, user].sort((a, b) => {
                            return b.points - a.points;
                          });
                          let position = 0 
                          return sorted.map(user => {
                            position++
                            return {...user, position}
                          })
                        });
                    });

                  return null;
                }
            })
        });
    }

    getUsersWithHigherPontuations();

    getFollowingUsers();
  }, []);

  useEffect(() => {
    if (uid) checkNotificationsPermissions(uid);
  }, [uid]);

  async function checkNotificationsPermissions(uid) {
    try {
      const {
        status: existingStatus,
      } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;

      firestore.collection("users").doc(uid).set(
        {
          notificationToken: token,
        },
        { merge: true }
      );
    } catch (err) {
      console.log("PERMISSION_ERROR: " + err);
    }
  }

  return (
    <>
      <Header />
      <View>
        <ScrollView style={{ marginBottom: 100 }}>
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
            <Snippet color="green" text="Testar meus conhecimentos">
              <Book />
            </Snippet>
          </TouchableOpacity>

          <Snippet noPaddingBottom={true} size="big">
            {!isLoadingRanking ? (
              <ScrollView style={{ paddingHorizontal: 8, paddingTop: 5 }}>
                <Text style={{ fontWeight: "bold", fontSize: 22 }}>
                  Ranking geral:
                </Text>
                {users.map((user) => {
                  return (
                    <TouchableOpacity
                      key={user.id}
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

          <Snippet marginBottom={500} noPaddingBottom={true} size="big">
            {!isLoadingFollowing ? (
              followingUsers.length > 0 ? (
                <ScrollView style={{ paddingHorizontal: 8, paddingTop: 0 }}>
                  <Text style={{ fontWeight: "bold", fontSize: 22 }}>
                    Você segue:
                  </Text>
                  {followingUsers.map((user) => {
                    return (
                      <TouchableOpacity
                        key={user.id}
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
                <View style={{ width: "100%", alignItems: "center" }}>
                  <Text
                    style={{
                      textAlign: "center",
                      width: "80%",
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "grey",
                    }}
                  >
                    Você ainda não segue ninguém
                  </Text>
                </View>
              )
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
