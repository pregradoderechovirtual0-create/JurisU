import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
 serverTimestamp
} from "firebase/firestore";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { getFirebaseDb, getFirebaseAuth } from "../firebase";


// Verifica si el correo fue autorizado por el administrador

export async function verificarCorreoAutorizado(email:string){

  email = email.toLowerCase().trim();

  console.log("BUSCANDO:", email);

  const db = getFirebaseDb();

  const ref = doc(
    db,
    "authorized_users",
    email
  );

  const snap = await getDoc(ref);

  console.log("EXISTE:", snap.exists());

  if(!snap.exists()){
    return null;
  }

  return {
    id:snap.id,
    ...snap.data()
  };
}

export async function activarCuenta(
 email:string,
 password:string
){

 email = email.toLowerCase().trim();

 const autorizado =
 await verificarCorreoAutorizado(email);


 if(!autorizado){
   throw new Error(
    "Este correo no está autorizado"
   );
 }

 if(autorizado.activated){
 throw new Error(
  "Esta cuenta ya fue activada"
 );
}



 const auth = getFirebaseAuth();


 // Crear usuario Firebase

 const cred =
 await createUserWithEmailAndPassword(
    auth,
    email,
    password
 );


 const uid = cred.user.uid;



 const db = getFirebaseDb();


 // Crear perfil

 await setDoc(
   doc(db,"users",uid),
   {
     name: autorizado.name,
     email,
     role: autorizado.role,
     category: autorizado.category ?? null,
createdAt:serverTimestamp()   }
 );



 // marcar como activado

 await updateDoc(
   doc(db,"authorized_users",email),
   {
     activated:true,
     uid
   }
 );


 return uid;

}