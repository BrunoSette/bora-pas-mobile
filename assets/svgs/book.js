import React from "react";
import { Path } from "react-native-svg";
import Svg from "react-native-svg";

export default function Book() {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#fff"
      width={100}
      height={100}
    >
      <Path d="M0 0h24v24H0z" fill="none" />
      <Path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
    </Svg> 
  );
}
