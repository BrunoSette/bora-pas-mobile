import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet, Dimensions } from "react-native";
//import BookLogo from "../public/images/icons/book-white-18dp.svg";
import {BoxShadow} from 'react-native-shadow'
import {LinearGradient} from 'expo-linear-gradient'
 
export default function Snippet({
  size,
  color,
  text,
  textColor,
  align,
  children,
  textSize,
  width,
  noPaddingBottom,
  marginBottom,
}) {

  const windowWidth = Dimensions.get('window').width
  const snippetWidth = (windowWidth * 9)/10
    
  return (
    <View
      style={[
        {
          justifySelf: "center",
          alignSelf: "center",
          marginVertical: 10,
        },
        size === "tiny" && styles["tiny"],
      ]}
    >
      <BoxShadow
        setting={{
          width: size === "tiny" ? 90 : snippetWidth,
          height:
            size === "small"
              ? 75
              : size === "big"
              ? 200
              : size === "tiny"
              ? 40
              : 140,
          color: "#000",
          border: 4,
          radius: 20,
          opacity: 0.12,
          x: 2,
          y: 14,
          style: { marginVertical: 1 },
        }}
      >
        <LinearGradient
          colors={
            color === "green"
              ? ["rgb(47, 163, 92)", "rgb(24, 153, 45)"]
              : ["rgb(255, 255, 255)", "rgb(245, 245, 245))"]
          }
          style={[
            styles["general"],
            { paddingBottom: noPaddingBottom ? 0 : 15,}
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              alignContent: "flex-start",
            }}
          >
            {children}
            {text && (
              <Text
                style={{
                  color: textColor ? textColor : "white",
                  fontWeight: "bold",
                  textAlign: align || "right",
                  fontSize: textSize || 20,
                  width: width || "60%",
                  alignSelf: align || "flex-start",
                  marginRight: 10,
                }}
              >
                {text}
              </Text>
            )}
          </View>
        </LinearGradient>
      </BoxShadow>
    </View>
  );
}

const styles = StyleSheet.create({
  general: {
    justifyContent: "center",
    alignSelf: "center",
    width: "98.5%",
    height: "97%",
    borderRadius: 20,
    elevation: 0,
    marginVertical: 13,
    padding: 15,
    

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

  
  },

  textColorWhite: {
    color: "white",
  },

  green: {
    backgroundColor: "rgb(45, 156, 73)",
  },

  tiny: {
    marginHorizontal: 10,
  }
});
