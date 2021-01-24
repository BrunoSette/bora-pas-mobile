import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function GenericHeader({text}) {
    return (
        <View style={styles['generic']}>
            <Text style={{fontSize: 22, fontWeight: 'bold'}}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  generic: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingVertical: 7,
    borderBottomColor: "rgb(220, 220, 220)",
    borderBottomWidth: 2,
    height: 80,
    alignItems: "center",
    marginTop: 25,
    backgroundColor: "white",
  },
});
