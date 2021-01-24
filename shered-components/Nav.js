import React, { useContext } from 'react'
import { GlobalContext } from '../context/GlobalContext';
import { Text, TextInput, View } from 'react-native';

export default function nav({isAdmin}) {
  const [globalContext, setGlobalContext] = useContext(GlobalContext)
  const {currentPage} = globalContext

  console.log(isAdmin)

    return (
      <View>
        <View>
          <Text>Home</Text>
        </View>

        <View>
          <Text>Game</Text>
        </View>

        <View>
          <Text>Ranking</Text>
        </View>

        {isAdmin && (
          <View>
            <Text>Admin</Text>
          </View>
        )}

        <View className={`nav-item ${currentPage === "Sobre" && "active"}`}>
          <Text>Sobre</Text>
        </View>
      </View>
    );
}
