import React, { useState } from 'react'
import { TextInput, StyleSheet, TouchableHighlight, View, Text } from 'react-native'
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal'

export default function index() {
    const [modalState, setModalState] = useState('login')

    function handlePress() {
        modalState === "login"
          ? setModalState("signUp")
          : setModalState("login");
    }

    return (
      <View style={styles["pageContainer"]}>
        <Text style={styles["title"]}>
          BORA <Text style={{ color: "rgb(45, 156, 73)" }}>PAS</Text>
        </Text>
        {modalState === "login" ? <LoginModal /> : <SignUpModal />}

        <View style={{ marginTop: 40 }}>
          <Text style={{ textAlign: "center", opacity: 0.7 }}>
            {modalState === "login" ? "Ainda não tem conta? " : "Já tem conta? "}
            <Text style={{ color: "rgb(45, 156, 73)" }} onPress={handlePress}>
              {modalState === "login" ? "Criar conta" : "Login"}
            </Text>
          </Text>
        </View>
      </View>
    );
}

export const styles = StyleSheet.create({
  pageContainer: {
    width: 300,
    height: '100%',
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
  },

  title: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    padding: 10,
    backgroundColor: "rgb(235, 235, 235)",
    borderRadius: 10,
    marginBottom: 15,
  },

  btnContainer: {
    backgroundColor: "red",
    flex: 1,
    width: 300,
    marginVertical: 20,
  },

  btn: {
    backgroundColor: "rgb(45, 156, 73)",
    color: "white",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
  },

  errorMsg: {
    color: "rgb(170, 16, 16)",
    textAlign: "center",
    marginTop: 15,
  },
});
