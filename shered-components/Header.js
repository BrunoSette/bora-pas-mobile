import React, { useEffect, useState, useContext, useRef } from "react";
import { GlobalContext } from "../context/GlobalContext";
import { auth, firestore, storage } from "../firebase/firebaseContext";
//import searchIcon from "../public/images/search-icon.svg";
//import closeIcon from "../public/images/close-icon.svg";
import User from "./User";
import { Image, Text, TextInput, View, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Header() {
  const navigation = useNavigation()
  const refContainer = useRef("");
  const [username, setUsername] = useState("");
  const [userImage, setUserimage] = useState(
    require("../assets/images/user-default-image.png")
  );
  const [hasCustomImage, setHasCustomImage] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [results, setResults] = useState([]);
  const [queryReturnEmptyResults, setQueryReturnEmptyResults] = useState(false);
  const [endAnimation, setEndAnimation] = useState(false);

  const [globalState, setGlobalState] = useContext(GlobalContext);
  let { currentUser } = globalState;
  let user;

  const [uid, setUid] = useState(false)

  useEffect(()=> {
    storage.ref(`users`)
  }, [])

  useEffect(() => {
    if (uid) return;
    auth.onAuthStateChanged((user) => {
      if (user) {
  

        setUid(auth.currentUser.uid);
      } else {
        if (typeof window !== "undefined") window.location.href = "/";
      }
    });
  }, [uid]);



  useEffect(() => {
      console.log(uid)
      if(!uid) return
    function getUsername() {
      try {
        firestore
          .collection("users")
          .doc(uid)
          .get()
          .then((user) =>
            setUsername(user.data() ? user.data().username : "username")
          );
      } catch {
        setUsername("username");
      }
    }

    function getUserImage() {
      const storageRef = storage.ref(`users/${uid}/profileImage`);
      storageRef.getDownloadURL().then((url) => {
        setUserimage(url);
        setHasCustomImage(true)
      });
    }

    function checkIfUserIsAdmin() {
      auth.currentUser.getIdTokenResult().then((result) => {
        if (result.claims.admin) {
          setIsAdmin(true);
        }
      });
    }

    checkIfUserIsAdmin();
    getUsername();
    getUserImage();
  }, [uid]);

  useEffect(() => {
    if (!endAnimation) return;
    setTimeout(() => {
      setSearchMode(false);
      setEndAnimation(false);
    }, 220);
  }, [endAnimation]);

    useEffect(() => {
      console.log("USER  IMAGE: " + userImage);
    }, [userImage]);


  async function handleSearch() {
    const data = await firestore
      .collection("users")
      .where("username", "==", searchInputValue)
      .get();

    if (data.empty) {
      setQueryReturnEmptyResults(true);
      return;
    }

    data.forEach((doc) => {
      const user = { ...doc.data(), id: doc.id };
      getUserImages(user, doc.id, setResults);
    });

    function getUserImages(user, id, callback) {
      storage
        .ref(`/users/${id}/profileImage`)
        .getDownloadURL()
        .then((url) => {
          user = { ...user, image: url };

          callback((users) => {
            return [...users, user]
              .sort((a, b) => {
                return b.points - a.points;
              })
              .filter((user) => {
                return user.points !== 0;
              });
          });
        });
    }
  }

  function handlePressSearch() {
      setSearchMode(true)
  }

  if (!searchMode) {
    return (
      <>
        <View style={styles["headerContainer"]}>
          <Text style={{ flex: 2, fontSize: 25, fontWeight: "bold" }}>
            BORA <Text style={{ color: "rgb(45, 156, 73)" }}>PAS</Text>
          </Text>

          <View style={{ flex: 0.5 }}>
            <TouchableOpacity onPress={handlePressSearch}>
              <Image
                style={{ width: 25, height: 25 }}
                source={require("../assets/images/search-icon.png")}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={()=> {
            navigation.navigate("UserStack", { user: {...currentUser, image: userImage, id: currentUser.uid} });
          }}>
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <Text style={{ fontWeight: "bold" }}>{username}</Text>
              {userImage ? (
                <Image
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 45,
                    marginLeft: 10,
                  }}
                  source={hasCustomImage ? { uri: userImage } : userImage}
                />
              ) : (
                <Text>Algo deu erado</Text>
              )}
            
          </View>
          </TouchableOpacity>
        </View>
      </>
    );
  } else if (uid && searchMode) {
    return (
      <>
        <View
          style={
            (styles["headerContainer"])
          }
        >
          <TextInput
            onChangeText={(e) => {
              setSearchInputValue(e.target.value);
              setResults([]);
              setQueryReturnEmptyResults(false);
            }}
            value={searchInputValue}
            placeholder="Buscar usuário..."
            ref={refContainer}
            style={{ flex: 1, marginLeft: 10 }}
          />

          <View style={{ flex: 0, marginRight: 10 }}>
            <Text onPress={()=> {
              setSearchMode(false)
            }}>X</Text>
            {/*<img onClick={handleSearch} src={searchIcon} alt="buscar" />
            <img
              onClick={() => {
                setEndAnimation(true);
                setQueryReturnEmptyResults(false);
                setSearchInputValue("");
                setResults([]);
              }}
              src={closeIcon}
              alt="fechar"
              className="close-icon"
            />*/}
          </View>
        </View>

        {(results.length !== 0 || queryReturnEmptyResults) && (
          <View
            onTouchStart={() => {
              setSearchMode(false);
            }}
          >
            {!queryReturnEmptyResults ? (
              results.map((user) => {
                return <User user={user} />;
              })
            ) : (
              <Text>
                Nenhum resultado... (verifique se digitou o nome do usuário
                corretamente)
              </Text>
            )}
          </View>
        )}
      </>
    );
  }

  return <Text>Algo errado com a página</Text>;
}

export const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingVertical: 7,
    borderBottomColor: "rgb(220, 220, 220)",
    borderBottomWidth: 2,
    height: 80,
    alignItems: 'center',
    marginTop: 25,
    backgroundColor: 'white'
  },

  searchContainer: {
    alignContent: 'flex-start'
  }

  
});
