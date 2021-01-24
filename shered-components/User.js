import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native';
//import styles from '../pages/ranking/ranking.module.css'

export default function User({user, big}) {
  const defaultSize = 32
  const bigSize = 50

    return (
      <View style={[styles.userContainer, big && styles.big]}>
        <View style={styles["user"]}>
          <View style={styles["position"]}>
            <Text style={{ color: "white", textAlign: "center" }}>
              {user.privateInfo ? "?" : user.position}
            </Text>
          </View>
          <Image
            style={{
              width: big ? bigSize : defaultSize,
              height: big ? bigSize : defaultSize,
              borderRadius: big ? bigSize : defaultSize,
              marginRight: 10,
            }}
            source={{ uri: user.image }}
          />
          <View>
            <Text style={{ fontWeight: "bold", fontSize: big? 20 : 15 }}>{user.username}</Text>
            <Text>
              {user.privateInfo ? "privado" : `pontos: ${user.points}`}
            </Text>
          </View>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  userContainer: {
    borderBottomColor: "rgb(230, 230, 230)",
    borderBottomWidth: 2,
  },

  user: {
    flexDirection: "row",
    marginVertical: 5,
    paddingVertical: 2,
    alignContent: 'center',
    alignItems: 'center',
    transform: [
      {translateX: -2}
    ]
  },

  position: {
    backgroundColor: 'green',
    padding: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    transform: [
      {translateX: 6},
      {translateY: -10}
    ],
    zIndex: 2,
  },

  big: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingLeft: 15,
  }
});
