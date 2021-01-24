import { auth, firestore } from '../../firebase/firebaseContext';
import React, { useContext, useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'
import { GlobalContext } from '../../context/GlobalContext';
//import loadingIcon from '../../assets/images/loading-icon.gif'
//import './loadingPageStyle.css'

export default function LoadingPage({navigation}) {
  const [globalState, setGlobalState] = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false)
  const { user } = globalState;

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.navigate("Home");

        async function getUserData() {
          const data = await firestore.doc('users/' + auth.currentUser.uid).get()

          setGlobalState((state) => {
            return {
              ...state,
              currentUser: {
                ...state.user,
                isLoggedIn: true,
                uid: auth.currentUser.uid,
                ...data.data()
              },
            };
          });
        }

        getUserData()
      } else {
        navigation.navigate("Login");
      }
    });
  }, []);

  /*if(!isLoading && loggedIn) {
    navigation.navigate("Home");
  } else if(!isLoading && !loggedIn) {
    
    navigation.navigate("Login");
  }*/

    return (
      <View style={{justifyContent: 'center', justifySelf: 'center', alignContent: 'center', width: 300, alignSelf: 'center', height: '100%'}}>
        <Text style={{ fontWeight: "bold", fontSize: 45, width: 300, textAlign: 'center' }}>
          BORA <Text style={{ color: "rgb(45, 156, 73)" }}>PAS</Text>
        </Text>
    <Image style={{width: 70, height: 60, alignSelf: 'center', marginTop: 10}} source={require("../../assets/images/loading-icon.gif")}></Image>
      </View>
    );
}
