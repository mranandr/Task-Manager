import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyCBKabsXjMHLXHLj7em6beqNcodeM7MwYI",
  authDomain: "task-tracker-49808.firebaseapp.com",
  projectId: "task-tracker-49808",
  storageBucket: "task-tracker-49808.firebasestorage.app",
  messagingSenderId: "534570853617",
  appId: "1:534570853617:web:abaaea5dcc0576098db550",
  measurementId: "G-F8SLM35B87"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);