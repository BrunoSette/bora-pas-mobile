import React, { useContext, useState } from 'react'
import { Text, TextInput, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import { GlobalContext } from '../../../context/GlobalContext';
import { auth } from '../../../firebase/firebaseContext';
import {styles} from '../index'

export default function LoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [validInputFields, setValidInputFields] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [globalState, setGlobalState] = useContext(GlobalContext);

  function handleTouch() {
    checkInputFields();
  }

  function checkInputFields() {
    setValidInputFields(false);
    if (email.length === 0 && password.length === 0) {
      setErrorMsg("Por favor preencha os campos");
    } else if (email.length < 6) {
      setErrorMsg("Email é muito curto");
    } else if (password.length < 6) {
      setErrorMsg("Passowrd é muito curta");
    } else {
      tryToSignUser();
    }
  }

  function tryToSignUser() {
    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCred) => {
        setGlobalState((globalState) => {
          return {
            ...globalState,
            currentUser: { ...globalState.currentUser, isLoggedIn: true },
          };
        });
      })
      .catch((err) => {
        setErrorMsg('Email ou senha incorretos');
        setValidInputFields(false);
      });
  }
  
    return (
      <>
        <View>
          <TextInput
            onChangeText={(text) => setEmail(text)}
            value={email}
            style={styles["input"]}
            placeholder="Email..."
          />
          <TextInput
            onChangeText={(text) => setPassword(text)}
            value={password}
            style={styles["input"]}
            placeholder="Senha..."
          />
        </View>
        {errorMsg? <Text style={styles["errorMsg"]}>{errorMsg}</Text> : <View style={{width: 0, height: 0}}></View>}
        <TouchableOpacity onPress={handleTouch}>
          <View style={styles["btnContainer"]}>
            <Text style={styles["btn"]}>Login</Text>
          </View>
        </TouchableOpacity>
      </>
    );
}
