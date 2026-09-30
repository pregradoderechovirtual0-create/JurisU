import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs
} from "firebase/firestore";

import { getFirebaseDb } from "../firebase";


export async function obtenerRolAutorizado(email: string) {

  const db = getFirebaseDb();

  const ref = doc(
    db,
    "authorized_users",
    email.toLowerCase().trim()
  );


  const snap = await getDoc(ref);


  if (!snap.exists()) {
    return null;
  }


  return snap.data();

}


export async function crearUsuarioAutorizado(
 email:string,
 data:any
){

 const db=getFirebaseDb();

 await setDoc(
  doc(
   db,
   "authorized_users",
   email.toLowerCase().trim()
  ),
  data
 );

}



export async function listarUsuariosAutorizados(){

 const db=getFirebaseDb();

 const snap=await getDocs(
  collection(db,"authorized_users")
 );

 return snap.docs.map(
  d=>({
    id:d.id,
    ...d.data()
  })
 );

}



export async function eliminarUsuarioAutorizado(
 email:string
){

 const db=getFirebaseDb();

 await deleteDoc(
  doc(
   db,
   "authorized_users",
   email.toLowerCase().trim()
  )
 );

}