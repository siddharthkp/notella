/* unique identifier */
let database;

/* initialize firebase */
const config = {
    apiKey: "AIzaSyC3yBT7RUgr7rqpcKaIIoKQxIdbVy5_c1Q",
    authDomain: "notes-65612.firebaseapp.com",
    databaseURL: "https://notes-65612.firebaseio.com",
    storageBucket: "notes-65612.appspot.com",
    messagingSenderId: "241953144431"
}
firebase.initializeApp(config)

/* Authenticate with twitter */
const provider = new firebase.auth.TwitterAuthProvider();
firebase.auth().onAuthStateChanged(user => {
  if (user) initDatabase(user.uid)
  else firebase.auth().signInWithRedirect(provider);
});

const initDatabase = (uid) => {
    database = firebase.database().ref(`/${uid}`)
    initNotes()
}

const initNotes = () => {
    getNotes().then(data => {
        notes = Object.assign({}, emptyNotes, data)
        renderSidebar(notes)
        saveLocally(notes)

        /* Start sync */
        sync(data => {
            notes = data
            renderSidebar(notes)
            saveLocally(notes)
            /* Syncs notes between devices as long as the title doesn't change */
            if (notes[activeNote.title]) renderNote(activeNote.title)
        })
    })
}

const persist = (notes) => {database.set({notes})}

const getNotes = () => {
    return database.once('value').then(snapshot => {
        if (snapshot.val()) return snapshot.val().notes
        else return {}
    })
}

const sync = (callback) => {
    database.on('value', snapshot => {
        if (snapshot.val()) callback(snapshot.val().notes)
    })
}
