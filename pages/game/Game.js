import React, { useContext, useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Image } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { Animated } from "react-native";
import convertSubjectNameToUTF8 from "../../context/convertSubjectNameToUTF8";
import { GlobalContext } from "../../context/GlobalContext";
import { firestore, storage } from "../../firebase/firebaseContext";
import Button1 from "../../shered-components/Button1";
import checkAchivs from "../../hooks&functions/checkAchivs";

export default function Game({ route, navigation }) {
  let { subject } = route.params;
  const rawSubject = subject
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const [globalState, setGlobalState] = useContext(GlobalContext);
  const { currentUser } = globalState;
  const [isLoading, setIsLoading] = useState(false);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(
    questions && currentIndex ? questions[currentIndex] : ""
  );
  const [questionImage, setQuestionImage] = useState("");
  const [gameIsRunning, setGameIsRunning] = useState(false);
  const [pointsInThisGame, setPointsInThisGame] = useState(0);
  const [numberOfCorrectAnswers, setNumberOfCorrectAnswers] = useState(0);
  const [turnResult, setTurnResult] = useState();
  const [gameHasEnded, setGameHasEnded] = useState(false);
  const [isTransitionHappening, setIsTransitionHappening] = useState(false);
  const [gameTime, setGameTime] = useState(null);
  const [newAchiv, setNewAchiv] = useState(null);

  //Animation
  const textAnimationValue = useState(new Animated.Value(1))[0];
  const buttonAnimationValue = useState(new Animated.Value(0))[0];
  const timingBarAnimationValue = useState(new Animated.Value(0))[0];
  const questionOutAnimationValue = useState(new Animated.Value(0))[0];
  const turnResultAnimationValue = useState(new Animated.Value(0))[0];

  const questionsInThisTurn = [0];
  const randomNumbersArray = [];
  const MAX_NUMBER_OF_QUESTIONS = 10;

  useEffect(() => {
    animate(textAnimationValue, 1.1, 300);
    animate(buttonAnimationValue, 1, 300);
  }, []);

  useEffect(() => {
    function getNumberOfQuestions() {
      firestore
        .doc("numberOfQuestions/numberOfQuestions")
        .get()
        .then((rawData) => {
          setNumberOfQuestions(rawData.data().number);
        });
    }

    getNumberOfQuestions();
  }, []);

  useEffect(() => {
    function createArrayOfRandomNumbers() {
      for (let i = 1; i <= numberOfQuestions; i++) {
        randomNumbersArray.push(i);
      }
    }

    createArrayOfRandomNumbers();

    if (gameHasStarted) {
      fetchQuestions().then(() => {
        setIsLoading(false);
        startGameTime();
      });
    }
  }, [gameHasStarted]);

  useEffect(() => {
    if (questions.length) {
      if (!questions[currentIndex]) {
        setGameHasEnded(true);
        return;
      }
      if (questions[currentIndex].hasImage) {
        setCurrentQuestion(questions[currentIndex]);
        storage
          .ref(`/questions/${questions[currentIndex].id}/questionImage`)
          .getDownloadURL()
          .then((url) => {
            setQuestionImage(url);
          });
      } else {
        setCurrentQuestion(questions[currentIndex]);
      }
    }
  }, [questions, currentIndex]);

  useEffect(() => {
    if (!gameHasStarted) return;

    const gameInfo = {
      uid: currentUser.uid,
      subject: rawSubject,
      pointsInThisGame,
      numberOfCorrectAnswers,
      MAX_NUMBER_OF_QUESTIONS,
      userPoints: currentUser.points,
      userAchivs: currentUser.achivs,
      userSubjects: currentUser.subjects,
    };

    setNewAchiv(checkAchivs(gameInfo));

    function updateUserInfo() { 
      firestore
        .collection("users")
        .doc(currentUser.uid)
        .update({ points: currentUser.points + pointsInThisGame });

      setGlobalState((state) => {
        return {
          ...state,
          currentUser: {
            ...state.currentUser,
            points: currentUser.points + pointsInThisGame,
          },
        };
      });
    }

    updateUserInfo();
    clearTimeout(gameTime);
    setGameTime(null);
  }, [gameHasEnded]);

  useEffect(() => {
    if ((!currentQuestion || !currentQuestion.id) && currentIndex)
      setGameHasEnded(true);
  }, [currentQuestion]);

  useEffect(() => {
    questionOutAnimationValue.setValue(0);
    if (isTransitionHappening) {
      animate(questionOutAnimationValue, 100, 600);
      animateWithIteration(turnResultAnimationValue, 0, 1.3, 600);
    }
  }, [isTransitionHappening]);

  async function fetchQuestions() {
    if (randomNumbersArray.length === 0) return;

    for (let i = 0; i < MAX_NUMBER_OF_QUESTIONS; i++) {
      if (randomNumbersArray.length === 0) return;
      const ref = firestore.collection("questions");
      const randomGraterThanOrLessThan =
        randomIntFromInterval(0, 1) === 0 ? "<=" : ">=";

      const randomIndex = randomIntFromInterval(
        0,
        randomNumbersArray.length - 1
      );
      const random = randomNumbersArray[randomIndex];

      let questionData;

      if (rawSubject === "geral") {
        questionData = await ref
          .where("pasType", "==", currentUser.pasType)
          .where("random", `>=`, random)
          .where("random", "not-in", questionsInThisTurn)
          .orderBy("random")
          .limit(1)
          .get();
      } else {
        questionData = await ref
          .where("pasType", "==", currentUser.pasType)
          .where("random", ">=", random)
          .where("random", "not-in", questionsInThisTurn)
          .where("subject", "==", rawSubject)
          .orderBy("random")
          .limit(1)
          .get();

        if (questionData.docs.length === 0) {
          questionData = await ref
            .where("pasType", "==", currentUser.pasType)
            .where("random", "<=", random)
            .where("random", "not-in", questionsInThisTurn)
            .where("subject", "==", rawSubject)
            .orderBy("random")
            .limit(1)
            .get();
        }
      }

      if (!questionData) return;

      questionData.forEach((question) => {
        questionsInThisTurn.push(question.data().random);
      });

      let question;
      let questionId;
      randomNumbersArray.splice(randomIndex, 1);

      questionData.forEach((questionData) => {
        if (!questionData.id) return;
        question = questionData.data();
        questionId = questionData.id;
      });

      if (!questionId) return;
      setQuestions((questions) => {
        return [...questions, { ...question, id: questionId }];
      });
    }

    function randomIntFromInterval(min, max) {
      // min and max included
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  }

  function startGameTime() {
    setGameIsRunning(true);

    if (gameTime === null || questions.length !== 0) {
      setGameIsRunning(true);
      timingBarAnimationValue.setValue(0);
      animate(timingBarAnimationValue, 100, 2 * 60 * 1000);
      setGameTime(
        setTimeout(() => {
          setCurrentIndex((value) => {
            return value + 1;
          });

          resetGame();
        }, 2 * 1000 * 60)
      );
    }
  }

  function resetGame() {
    clearTimeout(gameTime);
    setGameTime(null);
    setGameIsRunning(false);

    setTimeout(() => {
      startGameTime();
    }, 100);
  }

  function evalueteTurn(answer) {
    if (String(answer) == String(currentQuestion.answer)) {
      if (currentQuestion.type === "a") {
        setPointsInThisGame(pointsInThisGame + 1);
        setTurnResult("+1");
      } else {
        setPointsInThisGame(pointsInThisGame + 3);
        setTurnResult("+3");
      }
      setNumberOfCorrectAnswers(numberOfCorrectAnswers + 1);
    } else if (answer !== "jump") {
      if (currentQuestion.type === "a") {
        setPointsInThisGame(pointsInThisGame - 1);
        setTurnResult("-1");
      } else {
        setPointsInThisGame(pointsInThisGame - 3);
        setTurnResult("-3");
      }
    }

    setGameIsRunning(false);
    setIsTransitionHappening(true);

    clearTimeout(gameTime);
    setGameTime(null);

    setTimeout(() => {
      startGameTime();
      setTurnResult("");
      setCurrentIndex(currentIndex + 1);
      setIsTransitionHappening(false);
    }, 799);
  }

  //Animation related functions:
  function animate(value, finalValue, duration) {
    Animated.timing(value, {
      toValue: finalValue,
      duration: duration,
      useNativeDriver: false,
    }).start();
  }

  function animateWithIteration(
    value,
    firstTimeValue,
    secondTimeValue,
    totalDuration
  ) {
    Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: secondTimeValue,
          duration: (totalDuration * 2) / 3 + 20,
          useNativeDriver: false,
          //easing: Easing.linear()
        }),
        Animated.timing(value, {
          toValue: firstTimeValue,
          duration: (totalDuration * 1) / 3 + 20,
          useNativeDriver: false,
          //easing: Easing.linear()
        }),
      ])
    ).start();
  }

  if (gameHasEnded) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 20 }}>
          Pontuação obtida: {pointsInThisGame}{" "}
        </Text>
        {newAchiv ? (
          <View
            style={{
              padding: 10,
              backgroundColor: "rgb(45, 156, 73)",
              borderRadius: 5,
              marginTop: 10,
            }}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Nova conquista: <Text>{newAchiv[0]}</Text>
            </Text>
          </View>
        ) : (
          <View />
        )}
        <TouchableOpacity onPress={()=> {
          navigation.goBack()
        }}>
          <Button1 color="default" text="Voltar" />
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <ActivityIndicator color="rgb(45, 156, 73)" size={50 || "large"} />
      </View>
    );
  }

  if (!gameHasStarted) {
    return (
      <View
        style={{
          alignSelf: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: textAnimationValue }],
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text
            style={{ fontSize: 40, fontWeight: "bold", textAlign: "center" }}
          >
            {subject}
          </Text>
        </Animated.View>

        <TouchableOpacity
          onPress={() => {
            setIsLoading(true);
            setGameHasStarted(true);
          }}
        >
          <View
            style={{
              color: "white",
              textAlign: "center",
              backgroundColor: "rgb(45, 156, 73)",
              width: "100%",
              padding: 10,
              alignItems: "center",
              marginVertical: 15,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
              }}
            >
              Começar
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
  if (gameHasStarted) {
    return (
      <>
        <Text
          style={{
            color: "rgb(240, 240, 240)",
            position: "absolute",
            padding: 10,
            zIndex: 2,
            fontWeight: "bold",
          }}
        >
          Tempo para a próxima pergunta
        </Text>
        <Animated.View
          style={{
            width: timingBarAnimationValue.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: "green",
            height: 40,
          }}
        ></Animated.View>
        <View
          style={{
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ScrollView
            contentContainerStyle={{
              justifyContent: "center",
              height: "100%",
              alignSelf: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: "80%",
                justifyContent: "center",
              }}
            >
              {turnResult ? (
                <Animated.View
                  style={{
                    transform: [{ scale: turnResultAnimationValue }],
                    opacity: turnResultAnimationValue.interpolate({
                      inputRange: [0, 1.3],
                      outputRange: [0, 1],
                    }),
                    position: "absolute",
                    top: -40,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color:
                        turnResult[0] === "-" ? "rgb(170, 16, 16)" : "green",
                      fontSize: 30,
                      marginBottom: 40,
                    }}
                  >
                    {turnResult}
                  </Text>
                </Animated.View>
              ) : (
                <View></View>
              )}

              <Animated.View
                style={{
                  marginBottom: 10,
                  opacity: questionOutAnimationValue.interpolate({
                    inputRange: [0, 100],
                    outputRange: [1, 0],
                  }),
                  //transform: [{ translateX: questionOutAnimationValue }],
                }}
              >
                {currentQuestion.hasImage ? (
                  <Image
                    style={{
                      minWidth: "90%",
                      height: 200,
                      borderRadius: 20,
                      alignSelf: "center",
                      marginBottom: 10,
                    }}
                    source={
                      questionImage
                        ? { uri: questionImage }
                        : require("../../assets/images/image-placeholder.png")
                    }
                  />
                ) : (
                  <View />
                )}
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {currentQuestion.question}
                </Text>
              </Animated.View>
              {currentQuestion.type === "a" ? (
                <Animated.View
                  style={{
                    opacity: questionOutAnimationValue.interpolate({
                      inputRange: [0, 100],
                      outputRange: [1, 0],
                    }),
                    //transform: [{ translateX: questionOutAnimationValue }],
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignSelf: "center",
                      justifyContent: "space-evenly",
                      alignContent: "space-around",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        evalueteTurn("truly");
                      }}
                    >
                      <Button1 color="default" width={40} text="Correta" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        evalueteTurn("falsy");
                      }}
                    >
                      <Button1
                        marginHorizontal={10}
                        color="default"
                        width={40}
                        text="Errada"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        evalueteTurn("jump");
                      }}
                    >
                      <Button1 width={40} text="pular" />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ) : (
                <ScrollView style={{ width: "100%" }}>
                  <Animated.View
                    style={{
                      opacity: questionOutAnimationValue.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 0],
                      }),
                      transform: [{ translateX: questionOutAnimationValue }],
                    }}
                  >
                    <View
                      style={{
                        alignSelf: "center",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          evalueteTurn(1);
                        }}
                      >
                        <Button1
                          width={"100%"}
                          marginVertical={5}
                          color="default"
                          text={currentQuestion.alternatives?.alternative1}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          evalueteTurn(2);
                        }}
                      >
                        <Button1
                          marginVertical={5}
                          color="default"
                          text={currentQuestion.alternatives?.alternative2}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          evalueteTurn(3);
                        }}
                      >
                        <Button1
                          marginVertical={5}
                          color="default"
                          text={currentQuestion.alternatives?.alternative3}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          evalueteTurn(4);
                        }}
                      >
                        <Button1
                          marginVertical={5}
                          color="default"
                          text={currentQuestion.alternatives?.alternative4}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        marginVertical={5}
                        onPress={() => {
                          evalueteTurn("jump");
                        }}
                      >
                        <Button1 text="pular" />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </ScrollView>
              )}
            </View>
            <Text style={{ fontWeight: "bold", marginTop: 40 }}>
              Pontos nessa rodada: {pointsInThisGame}
            </Text>
          </ScrollView>
        </View>
      </>
    );
  }

  return <Text></Text>;
}
