// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA0CBFxf3pu6x70LjIT-bZhCOga6dIk4D0",
  authDomain: "suipay-bd32a.firebaseapp.com",
  projectId: "suipay-bd32a",
  storageBucket: "suipay-bd32a.firebasestorage.app",
  messagingSenderId: "416837910030",
  appId: "1:416837910030:web:1328a9ed5e1604227d865f",
  measurementId: "G-PB4K4MD8B3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyA0CBFxf3pu6x70LjIT-bZhCOga6dIk4D0",
//   authDomain: "suipay-bd32a.firebaseapp.com",
//   projectId: "suipay-bd32a",
//   storageBucket: "suipay-bd32a.firebasestorage.app",
//   messagingSenderId: "416837910030",
//   appId: "1:416837910030:web:1328a9ed5e1604227d865f",
//   measurementId: "G-PB4K4MD8B3"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
