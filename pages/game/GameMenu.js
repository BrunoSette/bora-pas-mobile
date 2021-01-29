import React, { useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { GlobalContext } from '../../context/GlobalContext';
import { firestore } from '../../firebase/firebaseContext';
import GenericHeader from '../../shered-components/GenericHeader';
import Snippet from '../../shered-components/Snippet';
import {subjects} from './subjectsList'

export default function GameMenu({navigation}) {
    const [globalState, setGlobalState] = useContext(GlobalContext);
    const [pasType, setPasType] = useState("");
    const {currentUser} = globalState
    const [areas, setAreas] = useState([])

    useEffect(()=> {
        let areas = [];

        subjects.forEach((subject) => {
          if (areas.includes(subject.area)) return;
          areas.push(subject.area);
        });

        const formatedAreas = areas.map((area) => {
          if (!area) return;
          let subjectsInThisArea = [];

          subjects
            .filter((subject) => subject.area === area)
            .forEach((subject) => {
              if (subjectsInThisArea.includes(subject.name)) return;
              subjectsInThisArea.push(subject.name);
            });

          return {
            areaName: area,
            subjects: subjectsInThisArea,
          };
        });

        setAreas(formatedAreas)
    }, [])

    useEffect(()=> {
        setPasType(currentUser.pasType)
    }, [])

    function changePasType(type) {
        if(type === pasType) return
        setPasType(type)

        function updatePasTypeReferences() {
            firestore.doc(`users/${currentUser.uid}`).update({ pasType: type });

            setGlobalState(state => {
                return {...state, currentUser: {...state.currentUser, pasType: type}}
            })
        }
        
        updatePasTypeReferences()
    }

    return (
      <>
        <GenericHeader text="Game:" />
        <ScrollView>
          <View>
            <View
              style={{
                flexDirection: "row",
                alignSelf: "center",
                alignContent: "space-between",
                justifyContent: "space-evenly",
              }}
            >
              <TouchableOpacity
                style={{ paddingBottom: 5 }}
                onPress={() => {
                  changePasType(1);
                }}
              >
                <Snippet color={pasType === 1 ? "green" : "white"} size="tiny">
                  <Text
                    style={[
                      styles["pasTypeText"],
                      pasType === 1 ? styles["whiteText"] : styles["blackText"],
                    ]}
                  >
                    Etapa 1
                  </Text>
                </Snippet>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingBottom: 5 }}
                onPress={() => {
                  changePasType(2);
                }}
              >
                <Snippet color={pasType === 2 ? "green" : "white"} size="tiny">
                  <Text
                    style={[
                      styles["pasTypeText"],
                      pasType === 2 ? styles["whiteText"] : styles["blackText"],
                    ]}
                  >
                    Etapa 2
                  </Text>
                </Snippet>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingBottom: 5 }}
                onPress={() => {
                  changePasType(3);
                }}
              >
                <Snippet color={pasType === 3 ? "green" : "white"} size="tiny">
                  <Text
                    style={[
                      styles["pasTypeText"],
                      pasType === 3 ? styles["whiteText"] : styles["blackText"],
                    ]}
                  >
                    Etapa 3
                  </Text>
                </Snippet>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{ paddingBottom: 5 }}
              onPress={() => {
                navigation.navigate("GamePage", { subject: 'Geral' });
              }}
            >
              <Snippet
                width={"100%"}
                size="big"
                align="center"
                textSize={55}
                color="green"
                text="Geral"
              ></Snippet>
            </TouchableOpacity>

            <View>
              {areas.map((area) => {
                return (
                  <View style={{ marginVertical: 30 }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        alignSelf: "center",
                        fontSize: 20,
                      }}
                    >
                      {area.areaName}:
                    </Text>
                    {area.subjects.map((subject) => (
                      <TouchableOpacity
                        style={{ paddingBottom: 5 }}
                        onPress={() => {
                          navigation.navigate("GamePage", { subject });
                        }}
                      >
                        <Snippet
                          width={"100%"}
                          align="center"
                          text="Geral"
                          textColor="black"
                          text={subject}
                          size="small"
                        ></Snippet>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </>
    );
}

const styles = StyleSheet.create({
  pasTypeText: {
    textAlign: "center",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 15.3,
  },

  whiteText: {
      color: 'white'
  },

  blackText: {
      color: 'black'
  }
});
