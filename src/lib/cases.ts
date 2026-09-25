import {
 collection,
 addDoc,
 getDocs,
 serverTimestamp
} from "firebase/firestore";

import {getFirebaseDb} from "./firebase";


export async function createCase(data:any){

const db=getFirebaseDb();

return await addDoc(
 collection(db,"cases"),
 {
  ...data,
  createdAt:serverTimestamp()
 }
);

}