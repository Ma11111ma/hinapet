//APIクライアント
import { LoginResponse } from "../types/api";

export async function postSession(idToken: string): Promise<LoginResponse> {
    const firebaseConfig = {
        apiKey: "AIzaSyAAhyYu7l_vdi6LubklwaprMTi8Fietfio",
        authDomain: "pet-evacuation-app.firebaseapp.com",
        projectId: "pet-evacuation-app",
        storageBucket: "pet-evacuation-app.appspot.com",
        messagingSenderId: "414891504745",
        appId: "1:414891504745:web:19a74b8a01598708409ef8",
      };
      

  return res.json() as Promise<LoginResponse>;
}
