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
  Image,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';

import { messagesCollection, auth, usersCollection, getUsernameByUid } from "../firebase";
import { RootStackParamList } from "../App";

// 1. Definisi Tipe Data
type MessageType = {
  id: string;
  text: string;
  user: string;
  uid: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
  imageUrl?: string;
};

// Pastikan nama route ('Chat') sesuai dengan yang ada di App.tsx
type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ route }: Props) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>("");

  // 2. Fetch current user's username
  useEffect(() => {
    const fetchUsername = async () => {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const username = await getUsernameByUid(currentUser.uid);
        setCurrentUsername(username);
      }
    };
    fetchUsername();
  }, []);

  // 3. Load Data Realtime with username fetching
  useEffect(() => {
    const unsub = messagesCollection
      .orderBy("createdAt", "asc")
      .onSnapshot(async (snapshot) => {
        if (!snapshot) return;
        const list: MessageType[] = [];
        
        for (const doc of snapshot.docs) {
          const data = doc.data();
          let displayName = data.user || "Unknown";
          
          // If message has uid, fetch username from users collection
          if (data.uid) {
            const fetchedUsername = await getUsernameByUid(data.uid);
            displayName = fetchedUsername;
          }
          
          list.push({
            id: doc.id,
            text: data.text || "",
            user: displayName,
            uid: data.uid || "",
            createdAt: data.createdAt,
            imageUrl: data.imageUrl,
          });
        }
        
        setMessages(list);
      });

    return () => unsub();
  }, []);

  // 3. Pick and Save Image
  const pickAndUploadImage = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    // Request permission for Android 13+
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: 'Photo Library Permission',
          message: 'App needs access to your photos',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Cannot access photo library');
        return;
      }
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
      includeBase64: true,
    });

    if (result.didCancel || !result.assets || !result.assets[0]) return;

    const imageBase64 = result.assets[0].base64;
    if (!imageBase64) return;

    try {
      setUploading(true);
      await messagesCollection.add({
        text: '',
        user: currentUsername || "Unknown",
        uid: currentUser.uid,
        imageUrl: `data:image/jpeg;base64,${imageBase64}`,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving image: ", error);
    } finally {
      setUploading(false);
    }
  };

  // 4. Kirim Pesan
  const sendMessage = async () => {
    if (!message.trim()) return;
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    try {
      await messagesCollection.add({
        text: message,
        user: currentUsername || "Unknown",
        uid: currentUser.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  // 5. Render Item Chat Bubble
  const renderItem = ({ item }: { item: MessageType }) => {
    const currentUser = auth().currentUser;
    const isMyMessage = item.uid === currentUser?.uid;

    return (
      <View
        style={[
          styles.msgBox,
          isMyMessage ? styles.myMsg : styles.otherMsg,
        ]}
      >
        <Text style={[styles.sender, isMyMessage && { color: "#e3f2fd" }]}>{item.user}</Text>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : null}
        {item.text ? (
          <Text style={[styles.msgText, isMyMessage && { color: "#fff" }]}>{item.text}</Text>
        ) : null}
        {item.createdAt && (
          <Text style={[styles.timestamp, isMyMessage && { color: "#e3f2fd" }]}>
            {new Date(item.createdAt.seconds * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
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
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={pickAndUploadImage} disabled={uploading}>
              <Text style={styles.imageButton}>{uploading ? "⏳" : "+"}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Ketik pesan..."
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={sendMessage}
              disabled={!message.trim()}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.uploadingText}>Uploading image...</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  msgBox: {
    padding: 10,
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 16,
    maxWidth: "75%",
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMsg: {
    backgroundColor: "#0095f6",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  otherMsg: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  sender: {
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 11,
    color: "#8e8e8e",
  },
  msgText: {
    fontSize: 15,
    color: "#262626",
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    color: "#8e8e8e",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginTop: 6,
  },
  imageButton: {
    fontSize: 28,
    marginHorizontal: 10,
    color: "#0095f6",
    fontWeight: "bold",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0095f6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginRight: 4,
  },
  sendIcon: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  uploadingText: {
    marginLeft: 10,
    color: "#555",
  },
  inputRow: {
    padding: 12,
    backgroundColor: "#fafafa",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
});