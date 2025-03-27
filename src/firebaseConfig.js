// Importar Firebase
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyClSywNi-GjN7dw6mGBiFn_d-LHaaNELAM",
  authDomain: "encuesta-99866.firebaseapp.com",
  projectId: "encuesta-99866",
  databaseURL: "https://encuesta-99866-default-rtdb.firebaseio.com/",
  storageBucket: "encuesta-99866.firebasestorage.app",
  messagingSenderId: "461373255231",
  appId: "1:461373255231:web:e0e2566af19d8e30a6528a"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };
