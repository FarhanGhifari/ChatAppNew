import React, { useEffect, useState } from
"react";
import { NavigationContainer } from
"@react-navigation/native";
import { createNativeStackNavigator } from
"@react-navigation/native-stack";
import LoginScreen from
"./screens/LoginScreen";
import ChatScreen from "./screens/ChatScreen";
import { auth } from "./firebase";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
export type RootStackParamList = {
Login: undefined;
Chat: { name: string };
};
const Stack =
createNativeStackNavigator<RootStackParamList>();
export default function App() {
const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
useEffect(() => {
auth().signInAnonymously().catch(console.error);
const unsub = auth().onAuthStateChanged((u) => {
setUser(u);
});
return () => unsub();
}, []);
if (!user) return null;
  return (
	<NavigationContainer>
	  <Stack.Navigator id="main">
		<Stack.Screen name="Login"
		  component={LoginScreen} />
		<Stack.Screen name="Chat"
		  component={ChatScreen} />
	  </Stack.Navigator>
	</NavigationContainer>
  );
}