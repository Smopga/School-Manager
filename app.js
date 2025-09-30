// Firebase Setup (DEIN Firebase Projekt eintragen!)
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJEKT.firebaseapp.com",
  databaseURL: "https://DEIN_PROJEKT.firebaseio.com",
  projectId: "DEIN_PROJEKT",
  storageBucket: "DEIN_PROJEKT.appspot.com",
  messagingSenderId: "DEINE_ID",
  appId: "DEINE_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let role = null;
let userId = "student_" + Math.floor(Math.random() * 100000);

function showTeacherLogin() {
  document.getElementById("teacher-login").style.display = "block";
}

function login(type) {
  if (type === "teacher") {
    let pw = document.getElementById("teacher-password").value;
    if (pw !== "1234") {
      alert("Falsches Passwort!");
      return;
    }
    role = "teacher";
  } else {
    role = "student";
  }

  document.getElementById("login-screen").style.display = "none";
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("role-display").innerText = "Eingeloggt als: " + role;

  if (role === "student") {
    document.getElementById("student-panel").style.display = "block";
    listenForTeacherMsg();
  } else {
    document.getElementById("teacher-panel").style.display = "block";
    listenForHands();
  }
}

function logout() {
  location.reload();
}

// Schüler hebt Hand
function raiseHand() {
  db.ref("hands/" + userId).set(true);
}

// Schüler empfängt Nachrichten
function listenForTeacherMsg() {
  db.ref("messages/" + userId).on("child_added", snap => {
    let msg = snap.val();
    let div = document.getElementById("student-chat");
    div.innerHTML += `<p><b>Lehrer:</b> ${msg.text}</p>`;
    // Popup!
    alert("Neue Nachricht: " + msg.text);
  });
}

function sendStudentMsg() {
  let text = document.getElementById("student-msg").value;
  if (!text) return;
  db.ref("studentReplies/" + userId).push({ text });
  document.getElementById("student-chat").innerHTML += `<p><b>Du:</b> ${text}</p>`;
  document.getElementById("student-msg").value = "";
}

// Lehrer sendet Nachricht
function sendTeacherMsg() {
  let studentId = document.getElementById("student-id").value;
  let text = document.getElementById("teacher-msg").value;
  if (!studentId || !text) return;
  db.ref("messages/" + studentId).push({ text });
  document.getElementById("teacher-chat").innerHTML += `<p>➡️ An ${studentId}: ${text}</p>`;
  document.getElementById("teacher-msg").value = "";

  // Antworten des Schülers hören
  db.ref("studentReplies/" + studentId).on("child_added", snap => {
    let msg = snap.val();
    document.getElementById("teacher-chat").innerHTML += `<p><b>${studentId}:</b> ${msg.text}</p>`;
  });
}

// Lehrer sieht gehobene Hände
function listenForHands() {
  db.ref("hands").on("value", snap => {
    let list = document.getElementById("raised-hands");
    list.innerHTML = "";
    snap.forEach(child => {
      list.innerHTML += `<li>${child.key} ✋</li>`;
    });
  });
}
