import React, { useEffect, useState } from
"react";
import { NavigationContainer } from
"@react-navigation/native";
import { createNativeStackNavigator } from
"@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import LoginScreen from
"./screens/LoginScreen";
import ChatScreen from "./screens/ChatScreen";
import { auth } from "./firebase";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
export type RootStackParamList = {
Login: undefined;
Chat: undefined;
};
const Stack =
createNativeStackNavigator<RootStackParamList>();
export default function App() {
const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
useEffect(() => {
const unsub = auth().onAuthStateChanged((u) => {
if (u) setUser(u);
else setUser(null);
});
return () => unsub();
}, []);
  return (
	<NavigationContainer>
	  <Stack.Navigator id="main">
		{!user ? (
		  <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
		) : (
		  <Stack.Screen 
			name="Chat" 
			component={ChatScreen}
			options={{
			  title: "Kerkom PBP",
			  headerTitleAlign: "center",
			  headerStyle: {
				backgroundColor: "#fff",
			  },
			  headerTitleStyle: {
				fontWeight: "bold",
				fontSize: 18,
			  },
			  headerRight: () => (
				<TouchableOpacity onPress={() => auth().signOut()} style={{ marginRight: -9, padding: 5 }}>
				  <Icon name="log-out-outline" size={35} color="#ff3b30" />
				</TouchableOpacity>
			  ),
			}}
		  />
		)}
	  </Stack.Navigator>
	</NavigationContainer>
  );
}