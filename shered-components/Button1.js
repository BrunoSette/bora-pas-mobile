import React from 'react'
import { View, Text } from 'react-native'

export default function Button1({text, color, width, marginHorizontal, marginVertical}) {
    return (
      <View
        style={{
          backgroundColor:
            color === "default" ? "rgb(45, 156, 73)" : "rgb(190, 190, 190)",
          padding: 8,

          minWidth: width || "80%",
          alignItems: "center",
          marginVertical: marginVertical || 15,
          borderRadius: 10,
          marginHorizontal: marginHorizontal || 0
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>{text}</Text>
      </View>
    );
}
