import React, { useState } from "react";
import { View, Text, TextInput, Image, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { signIn, signUp } from "../firebase";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (isSignUp && !username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password, username);
        Alert.alert("Success", "Account created!");
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../android/app/src/main/res/mipmap-xxxhdpi/logo.png')} 
        style={styles.logoImage}
      />
      <Text style={styles.appName}>ChatApp</Text>
      
      <View style={styles.formContainer}>
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>{isSignUp ? "Sign Up" : "Log In"}</Text>
        </TouchableOpacity>
        
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>
        
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggle}>
          <Text style={styles.toggleText}>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <Text style={styles.toggleTextBold}>{isSignUp ? "Log In" : "Sign Up"}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
    padding: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#dbdbdb",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#0095f6",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#dbdbdb",
  },
  orText: {
    marginHorizontal: 15,
    color: "#8e8e8e",
    fontSize: 13,
    fontWeight: "600",
  },
  toggle: {
    alignItems: "center",
  },
  toggleText: {
    color: "#262626",
    fontSize: 14,
  },
  toggleTextBold: {
    color: "#0095f6",
    fontWeight: "600",
  },
});