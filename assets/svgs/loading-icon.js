import * as React from "react";
import Svg, { Circle } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: animateTransform */

export default function LoadingIcon() {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        margin: "auto",
        background: "0 0",
      }}
      width={100}
      height={100}
      viewBox="10 10 100 100"
      preserveAspectRatio="xMidYMid"
      display="block"
    >
      <Circle
        cx={50}
        cy={50}
        fill="none"
        stroke="#2d9c49"
        strokeWidth={10}
        r={41}
        strokeDasharray="193.20794819577225 66.40264939859075"
      ></Circle>
    </Svg>
  );
}
