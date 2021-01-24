import React, { useContext, useRef, useState } from "react";
import {
  Image,
  ImagePickerIOS,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { GlobalContext } from "../../../context/GlobalContext";
import { styles } from "../index";
import userDefaultImage from "../../../assets/images/user-default-image.png";
import { firestore, auth, storage } from "../../../firebase/firebaseContext";

export default function LoginModal() {
  const refContainer = useRef("");
  const [globalState, setGlobalState] = useContext(GlobalContext);

    const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [userImagePreview, setUserImagePreview] = useState(userDefaultImage);
  const [inputFieldValues, setInputFieldValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handlePress() {
    checkInputFields();
  }

  function checkInputFields() {
    const MIN_LENGTH = 6;
    for (let prop in inputFieldValues) {
      if (inputFieldValues[prop].length === 0) {
        setErrorMsg(`Por favor, preencha o campo: ${prop}`);
        return;
      }

      if (inputFieldValues[prop].length > 20 && prop !== "email") {
        setErrorMsg(`${prop} deve ter no máximo 20 caracteres `);
        return;
      }

      if (inputFieldValues[prop].length < MIN_LENGTH) {
        setErrorMsg(`${prop} deve ter no mínimo 6 caracteres `);
        return;
      }

      if (inputFieldValues.password !== inputFieldValues.confirmPassword) {
        setErrorMsg("Senhas são diferentes");
        return;
      }

      signUpUser();
    }
  }

  function signUpUser() {
    const { email, password } = inputFieldValues;
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        //uploadImageFile();
        createUserReferences();

        setGlobalState((globalState) => {
          return {
            ...globalState,
            user: { ...globalState.user, isLoggedIn: true },
          };
        });
      })
      .catch((err) => {
          let msg;
          switch (err.code) {
            case "auth/email-already-in-use":
              msg = "Email já pertence a uma conta existente";
              break;
            case "auth/invalid-email":
              msg = "Email mal formatado";
              break;
            case "auth/weak-password":
              msg = "A senha deve conter no mínimo 6 caracteres";
          }
          setErrorMsg(msg ? msg : err.message);

      });

    function createUserReferences() {
      const { username } = inputFieldValues;
      firestore.collection("users").doc(auth.currentUser.uid).set({
        username,
        bio: "",
        points: 0,
        achivs: [],
        following: [],
        subjects: [],
        privateInfo: false,
      });
    }
  }

  return (
    <>
      <View>
        <Image
          style={{
            width: 100,
            height: 100,
            alignSelf: "center",
            marginBottom: 20,
          }}
          source={require("../../../assets/images/user-default-image.png")}
        />
        <TextInput
          onChangeText={(text) =>
            setInputFieldValues((values) => {
              return { ...values, username: text };
            })
          }
          value={inputFieldValues.username}
          style={styles["input"]}
          placeholder="Username..."
        />
        <TextInput
          onChangeText={(text) =>
            setInputFieldValues((values) => {
              return { ...values, email: text };
            })
          }
          value={inputFieldValues.email}
          style={styles["input"]}
          placeholder="Email..."
        />
        <TextInput
          onChangeText={(text) =>
            setInputFieldValues((values) => {
              return { ...values, password: text };
            })
          }
          value={inputFieldValues.password}
          style={styles["input"]}
          placeholder="Senha..."
        />
        <TextInput
          onChangeText={(text) =>
            setInputFieldValues((values) => {
              return { ...values, confirmPassword: text };
            })
          }
          value={inputFieldValues.confirmPassword}
          style={styles["input"]}
          placeholder="Confirmar senha"
        />
      </View>
      <Text style={styles["errorMsg"]}>{errorMsg}</Text>
      <TouchableOpacity onPress={handlePress}>
        <View style={styles["btnContainer"]}>
          <Text style={styles["btn"]}>Criar conta</Text>
        </View>
      </TouchableOpacity>
    </>
  );
}
