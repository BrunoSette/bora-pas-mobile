import React, { useContext, useState, useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { GlobalContext } from "../../context/GlobalContext";
import Button1 from "../../shered-components/Button1";
import ImageFilter from "react-native-image-filter";
import { auth, firestore, functions } from "../../firebase/firebaseContext";
import { useGetUserImages } from "../../hooks&functions/useGetUserImages";
import convertSubjectNameToUTF8 from "../../context/convertSubjectNameToUTF8";
import { Checkbox } from "react-native-paper";

export default function UserPage({ route, navigation }) {
  const { user } = route.params;
  const [globalState, setGlobalState] = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(false);
  const [uid, setUid] = useState(user.id);
  const [isFollowing, setIsFollowing] = useState([]);
  const { currentUser } = globalState;

  //Estados no caso do usário estar na página de seu próprio perfil:
  const [isCurrentUserPage, setIsCurrentUserPage] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newImage, setNewImage] = useState("");
  const [checkPrivateInfoCheckbox, setCheckPrivateInfoCheckbox] = useState(
    currentUser.privateInfo
  );

  const [currentUsername, setCurrentUsername] = useState(user.username);
  const [currentBio, setCurrentBio] = useState(user.bio);

  const [usernameInputValue, setUsernameInputValue] = useState(user.username);
  const [bioInputValue, setBioInputValue] = useState(user.bio);

  //Estados no caso do usuário estar na página de outro perfil:
  const [isBeeigFollowed, setIsBeingFollowed] = useState(false);
  const [currentUserFollowing, setCurrentUserFollowing] = useState([]);
  

  useEffect(() => {
    if(!currentUser.username) return
    function checkFollowing() {
      if (currentUser.following.includes(user.id)) setIsBeingFollowed(true);
      else setIsBeingFollowed(false);
    }
    checkFollowing();
  }, [currentUser]);

  useEffect(() => {
    function getFollowingUsers() {
      const following = user.following.slice(0, 4);
      following.forEach((id) => {
        firestore
          .doc("users/" + id)
          .get()
          .then((userCred) => {
            if (!userCred.data()) return;
            const user = {
              ...userCred.data(),
              id: userCred.id,
            };
            if(user.hasImage) {
                useGetUserImages(user, userCred.id, setIsFollowing, false);
            } else {
                setIsFollowing(users => {
                    return [...users, user]
                })
            }
            
          });
      });
    }
    getFollowingUsers();
  }, []);

  useEffect(() => {
    if(!currentUser.username) setIsCurrentUserPage(false)
     else if (globalState.currentUser.uid === user.id) setIsCurrentUserPage(true);
  }, [globalState, user]);

  function handlePress() {
    if (isCurrentUserPage) {
      if (!editMode) {
        setEditMode(true);
      } else if (editMode) {
        function submitUserInfoChanges() {
          firestore
            .collection("users")
            .doc(uid)
            .update({ username: usernameInputValue, bio: bioInputValue });
        }

        setGlobalState((state) => {
          return {
            ...state,
            currentUser: {
              ...state.currentUser,
              username: usernameInputValue,
              bio: bioInputValue,
            },
          };
        });

        setCurrentUsername(usernameInputValue);
        setCurrentBio(bioInputValue);
        setEditMode(false);
        submitUserInfoChanges();
      }
    } else {
      let update;

      if (isBeeigFollowed) {
        update = currentUser.following.filter((id) => {
          return id !== user.id;
        });

        submitFollowingUpdate(update);
        setIsBeingFollowed(false);
      } else {
        update = [...currentUser.following, user.id];
        submitFollowingUpdate(update);
        setIsBeingFollowed(true);

          const sendPush = functions.httpsCallable("sendPush");
          sendPush({
            msg: {
              to: user.notificationToken || false,
              title: `${currentUser.username} está agora te seguindo`,
              body: `Veja`,
              sound: "default",
              time: Date.now(),
            },
            destinationUid: user.id,
            senderUid: currentUser.uid,
          });
        
      }

      function submitFollowingUpdate(update) {
        firestore
          .collection("users")
          .doc(currentUser.uid)
          .update({ following: update });

        setGlobalState((state) => {
          return {
            ...state,
            currentUser: { ...state.currentUser, following: update },
          };
        });
      }
    }
  }

  function handleSignOut() {
    auth.signOut().then(() => {
      setGlobalState((state) => {
        return { ...state, currentUser: { ...state.currentUser, isLoggedIn: false } };
      });
    });
  }

  function handleCheck() {
    const checked = checkPrivateInfoCheckbox;

    checkPrivateInfoCheckbox
      ? setCheckPrivateInfoCheckbox(false)
      : setCheckPrivateInfoCheckbox(true);

    function updatePrivateInfo() {
      setGlobalState((state) => {
        return {
          ...state,
          currentUser: {
            ...state.currentUser,
            privateInfo: checked ? false : true,
          },
        };
      });

      firestore
        .collection("users")
        .doc(uid)
        .update({ privateInfo: checked ? false : true });
    }

    updatePrivateInfo();
  }

  function getSubjects() {
    return user.subjects
      .filter((subject) => {
        return subject.points >= 15 && subject.subject !== "geral";
      })
      .slice(0, 3)
      .map((subject) => convertSubjectNameToUTF8(subject.subject).toLowerCase())
      .join(", ")
      .toString();
  }

  /*async function openImagePicker() {
    console.log("try to open picker");
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    const errerMsg = "Não foi possível acessar suas fotos";

    if (status === "granted") {
      let result;
      try {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } catch (err) {
        console.log(err);
        setErrorMsg(errorMsg);
      }

      if (!result.cancelled) setUserImagePreview(result.uri);
    } else {
      ImagePicker.getMediaLibraryPermissionsAsync();
      setErrorMsg(errorMsg);
    }
  }*/

  return (
    <ScrollView>
      <View style={{ flex: 1, alignItems: "center", marginTop: 30 }}>
        <View style={styles["mainInfoContainer"]}>
          <Image
            onPress={()=> {
              if(editMode) openImagePicker()
            }}
            style={{ width: 110, height: 110, borderRadius: 110, zIndex: -100 }}
            source={
              (user.hasImage && user.image)
                ? { uri: user.image }
                : require("../../assets/images/user-default-image.png")
            }
          />

          {!editMode ? (
            <Text
              style={{ fontSize: 28, fontWeight: "bold", marginVertical: 8 }}
            >
              {currentUsername}
            </Text>
          ) : (
            <TextInput
              onChangeText={(text) => {
                setUsernameInputValue(text);
              }}
              style={styles["input"]}
              value={usernameInputValue}
            />
          )}
          {!editMode ? (
            <Text style={{ color: "grey", textAlign: "center" }}>
              {currentBio || "..."}
            </Text>
          ) : (
            <TextInput
              onChangeText={(text) => {
                setBioInputValue(text);
              }}
              style={styles["input"]}
              value={bioInputValue}
            />
          )}
          <TouchableOpacity onPress={handlePress}>
            <Button1
              text={
                isCurrentUserPage
                  ? editMode
                    ? "Salvar mudanças"
                    : "Edtar perfil"
                  : isBeeigFollowed
                  ? "Parar de seguir"
                  : "Seguir"
              }
              color={
                !isBeeigFollowed || isCurrentUserPage ? "default" : "changed"
              }
            />
          </TouchableOpacity>
          {isCurrentUserPage ? (
            <Checkbox.Item
              onPress={handleCheck}
              label="Manter dados privados"
              labelStyle={{
                color: "grey",
              }}
              status={checkPrivateInfoCheckbox ? "checked" : "unchecked"}
              color="green"
              style={{
                marginVertical: 0,
                paddingVertical: 0,
              }}
            ></Checkbox.Item>
          ) : (
            <View></View>
          )}
        </View>

        {!user.privateInfo || isCurrentUserPage ? (
          <View style={styles["extraContainer"]}>
            <Text style={{ fontSize: 40, fontWeight: "bold" }}>
              Pontos: {user.points}
            </Text>

            {user.following && user.following.length ? (
              <Text style={styles["section"]}>
                Segue:{" "}
                <Text>
                  {isFollowing &&
                    isFollowing.map((user) => {
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            navigation.push("UserStack", { user });
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: "normal",
                              fontSize: 16,
                            }}
                          >
                            {user.username},{" "}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </Text>
                {(isFollowing && isFollowing.length) >= 2 ? (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("RankingStack", {
                        uid: user.id,
                        pageType: "generalFollowing",
                      });
                    }}
                  >
                    <Text style={{ color: "rgb(45, 156, 73)", fontSize: 16 }}>
                      mais...
                    </Text>
                  </TouchableOpacity>
                ) : (
                  ""
                )}
              </Text>
            ) : (
              <View></View>
            )}

            <Text style={styles["section"]}>
              Se da melhor em:{" "}
              <Text style={{ fontWeight: "normal" }}>
                {user.subjects.length
                  ? getSubjects(user.subjects) || "sem dados o suficiente"
                  : "sem dados o sufiiente"}
              </Text>
            </Text>
            <Text style={styles["section"]}>
              Conquistas:{" "}
              <Text style={{ fontWeight: "normal" }}>
                {user.achivs.length === 0
                  ? "Ainda nada..."
                  : user.achivs.join(", ")}
              </Text>
            </Text>
          </View>
        ) : (
          <Text>Informações privadas</Text>
        )}
      </View>
      {isCurrentUserPage ? (
        <TouchableOpacity onPress={()=> {
            handleSignOut()
        }}>
          <Text
            style={{
              textAlign: "center",
              marginVertical: 20,
              color: "rgb(170, 16, 16)",
            }}
          >
            Sair
          </Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainInfoContainer: {
    alignItems: "center",
    width: "75%",
  },

  input: {
    borderBottomWidth: 2,
    borderBottomColor: "rgb(200, 200, 200)",
    marginVertical: 5,
    width: "80%",
    textAlign: "center",
  },

  extraContainer: {
    alignItems: "center",
    maxWidth: "70%",
  },

  section: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    marginVertical: 10,
  },
});
