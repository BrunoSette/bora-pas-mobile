import React, { useContext, useEffect, useState } from "react";
import { View, Text, FlatList, Dimensions, ActivityIndicator } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { GlobalContext } from "../../context/GlobalContext";
import { firestore, storage } from "../../firebase/firebaseContext";
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
      setIsFollowinPage(true);
      loadFollowingUsers()
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

    data.forEach((userCred) => {
      if(isInArray(userCred, users, 'id')) return
      

      position++;
      setGlobalPosition(position);
      let aUser = { ...userCred.data(), position, id: userCred.id };

      if(aUser.hasImage) {
        if (isInArray(aUser, users, "position")) return;
        useGetUserImages(aUser, userCred.id, setUsers);
      } else {
        if (isInArray(aUser, users, "position")) return;
          setUsers(users => {
            
              return [...users, aUser]
          })
      }
      
    });

    setIsLoadingData(false);
    setLastFetchUser(data.docs[data.docs.length - 1]);
  }

  useEffect(()=> {
    let seen = new Set();
    let hasDuplicates = users.some((currentObject) => {
      return seen.size === seen.add(currentObject.id).size;
    });

    if(hasDuplicates) removeDuplicate()
    else return
  }, [users])

  async function loadFollowingUsers() {
    setIsLoadingData(true);
    let position = globalPosition;

    const dataCurrentUser = await firestore.collection("users").doc(uid).get()

    let currentUser = dataCurrentUser.data()

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
            getUserImages(user, userCred.id, setUsers);
          } else {
            setUsers((users) => {
              return [...users, user].sort((a, b) => {
                return b.points - a.points;
              });
            });
          }
          setIsLoadingData(false);
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
              let position = 0;
              return sorted.map((user) => {
                position++;
                return { ...user, position };
              });
            });
          });

        return null;
      }
    });

    setIsLoadingData(false);
    //setLastFetchUser(followingUsers.docs[followingUsers.docs.length - 1]);
  }

  function removeDuplicate() {
    //Remove duplicate from Arraylist
    const newArrayList = [];
    users.forEach((obj) => {
      if (!newArrayList.some((item) => item.id === obj.id)) {
        newArrayList.push({ ...obj });
      }
    });

    setUsers(newArrayList);
  }

  function handleScrollEnd() {
    if (isDataEmpty || isFollowingPage) return;


      loadDefaultContent();
    

  }

  function isInArray(obj, array, comparing) {
    return array.some((item) => item[comparing] === obj[comparing]);
  }

  return (
    <>
      {pageType === 'default' ? <GenericHeader text="Ranking geral:" /> : <View></View>}
      {users.length > 0 && <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={(users) => (
          <TouchableOpacity onPress={()=> {
              navigation.push('UserStack', {
                  user: users.item
              })
          }}>
            <User user={users.item} big={true} />
          </TouchableOpacity>
        )}
        onEndReached={() => {
          handleScrollEnd();
        }}
        onEndReachedThreshold={0}
      ></FlatList>}
      {isLoadingData ? (
        <View style={{ marginVertical: 20, height: users.length > 0? 40 : '100%', justifyContent:  users.length > 0? 'flex-start' : 'center'}}>
          <ActivityIndicator color="rgb(45, 156, 73)" size={50 || 'large'} />
        </View>
      ) : (
        <View></View>
      )}
    </>
  );
}
