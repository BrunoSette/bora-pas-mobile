import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { GlobalContext } from "../../context/GlobalContext";
import { firestore, storage } from "../../firebase/firebaseContext";
import GenericHeader from "../../shered-components/GenericHeader";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

export default function NotificationsPage({ route, navigation }) {
  const [globasState, setGlobalState] = useContext(GlobalContext);
  const { currentUser } = globasState;
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!globasState) return;
    function updatePendigNotifications() {
      setGlobalState((state) => {
        return {
          ...state,
          currentUser: { ...state.currentUser, pendingNotifications: false },
        };
      });

      firestore.collection("users").doc(currentUser.uid).update({
        pendingNotifications: false,
      });
    }

    updatePendigNotifications();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.notifications?.length) {
      fetchNotifications();
    } else {
      setIsLoading(false);
    }

    function fetchNotifications() {
      currentUser.notifications.forEach((notification) => {
        firestore
          .collection("users")
          .doc(notification.uid)
          .get()
          .then((userCred) => {
            const value = { ...notification, user: {...userCred.data(), id: userCred.id} };

            if(value.user.hasImage) {
                getUserImage(value, notification.uid, setNotifications);
            } else {
                setNotifications(notifications => {
                    return [...notifications, value]
                })
            }
            
            setIsLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
            console.log(err);
          });
      });

      function getUserImage(notification, id, callback) {
        storage
          .ref(`/users/${id}/profileImage`)
          .getDownloadURL()
          .then((url) => {
            notification = {
              ...notification,
              user: { ...notification.user, image: url },
            };
            callback((notifications) => {
              return [...notifications, notification].sort((a, b) => {
                return (b.time|| 0) - (a.time || 0)
              })
            });
          });
      }
    }
  }, []);

  function handlePress() {
      setNotifications([])
      firestore.collection("users").doc(currentUser.uid).update({
        notifications: [],
      });
  }

  if (isLoading) {
    return (
      <>
        <GenericHeader text="Notificações" />
        <View
          style={{
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator color="green" size="large" />
        </View>
      </>
    );
  }

  return (
    <>
      <GenericHeader text="Notificações" />
      {notifications.length > 0 ? (
        <ScrollView>
          <View>
            {notifications.map((notification) => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("UserStack", {
                    user: notification.user,
                  });
                }}
              >
                <View
                  style={{
                    paddingVertical: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: "rgb(230, 230, 230)",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 30,
                      marginRight: 10,
                    }}
                    source={
                      notification.user.hasImage
                        ? { uri: notification.user.image }
                        : require('../../assets/images/user-default-image.png')
                    }
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      marginRight: 10,
                    }}
                  >
                    {notification.title}
                  </Text>
                  <MaterialIcons name="notifications" color="green" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View
          style={{
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "rgb(180, 180, 180)",
              fontSize: 20,
              paddingBottom: 100,
            }}
          >
            Nenhuma nova notificação
          </Text>
        </View>
      )}
      {notifications.length > 0 ? (
        <TouchableOpacity onPress={handlePress}>
          <View style={{ backgroundColor: "rgb(240, 240, 240)" }}>
            <Text
              style={{
                textAlign: "center",
                paddingVertical: 20,
                color: "green",
                fontWeight: "bold",
                borderTopWidth: 2,
                borderTopColor: "rgb(220, 220, 220)",
                backgroundColor: "rgb(230, 0, 0",
              }}
            >
              Limpar notificações
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View></View>
      )}
    </>
  );
}
