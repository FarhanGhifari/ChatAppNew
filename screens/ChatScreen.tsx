import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import firestore from '@react-native-firebase/firestore';

import { messagesCollection } from "../firebase";
import { RootStackParamList } from "../App";

// 1. Definisi Tipe Data
type MessageType = {
  id: string;
  text: string;
  user: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
};

// Pastikan nama route ('Chat') sesuai dengan yang ada di App.tsx
type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ route }: Props) {
  const { name } = route.params;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);

  // 2. Load Data Realtime
  useEffect(() => {
    const unsub = messagesCollection
      .orderBy("createdAt", "asc")
      .onSnapshot((snapshot) => {
        const list: MessageType[] = [];
        snapshot.forEach((doc) => {
          list.push({
            id: doc.id,
            ...(doc.data() as Omit<MessageType, "id">),
          });
        });
        setMessages(list);
      });

    return () => unsub();
  }, []);

  // 3. Kirim Pesan
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await messagesCollection.add({
        text: message,
        user: name,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  // 4. Render Item Chat Bubble
  const renderItem = ({ item }: { item: MessageType }) => {
    const isMyMessage = item.user === name;

    return (
      <View
        style={[
          styles.msgBox,
          isMyMessage ? styles.myMsg : styles.otherMsg,
        ]}
      >
        <Text style={styles.sender}>{item.user}</Text>
        <Text style={styles.msgText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90} // Sesuaikan offset dengan header kamu
    >
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
          // Opsional: Agar auto scroll ke bawah saat buka
          onContentSizeChange={() => {
             // Logic scroll to end bisa ditaruh di sini jika perlu
          }}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ketik pesan..."
            value={message}
            onChangeText={setMessage}
          />
          <Button title="Kirim" onPress={sendMessage} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  msgBox: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: "80%",
  },
  myMsg: {
    backgroundColor: "#d1f0ff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  otherMsg: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 12,
    color: "#555",
  },
  msgText: {
    fontSize: 16,
    color: "#000",
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    marginRight: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
});