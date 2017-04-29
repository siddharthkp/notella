/* unique identifier */
let database

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
const provider = new firebase.auth.TwitterAuthProvider()
firebase.auth().onAuthStateChanged(user => {
  if (user) initDatabase(user.uid)
  else firebase.auth().signInWithRedirect(provider)
})

const initDatabase = (uid) => {
    database = firebase.database().ref(`/${uid}`)
    initNotes()
}


// the key could be title or uid, if former then we replace it with uid and add title to the object.
const migrateAndMergeNotes = (notes, data) => {
  let newNotes = Object.assign({}, emptyNotes)
  let keys = Object.keys(data)
  for (let i = 0; i < keys.length; i++) {
      let uid = keys[i] // the key could be title or uid

      // First merge them.
      if (!notes[uid]) newNotes[uid] = data[uid]
      else if (notes[uid].modified > data[uid].modified) newNotes[uid] = notes[uid]
      else newNotes[uid] = data[uid]

      // Now if it is based on Old Title key model we replace it to new UID one.
      let note = newNotes[uid]
      // since old object didn't have a title it will return undefined
      if (typeof note.title === undefined){
        newNotes[uuid.v1()] = {title: uid, content: note.content, modified: note.modified}
        delete newNotes[uid]
      }
  }
  return newNotes
}

const mergeNotes = (notes, data) => {
    let newNotes = Object.assign({}, emptyNotes)
    let keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
        let title = keys[i]
        if (!notes[title]) newNotes[title] = data[title]
        else if (notes[title].modified > data[title].modified) newNotes[title] = notes[title]
        else newNotes[title] = data[title]
    }
    return newNotes
}

const initNotes = () => {
    getNotes().then(data => {
        notes = migrateAndMergeNotes(notes, data)
        // notes = mergeNotes(notes, data)
        renderSidebar(notes)
        saveLocally(notes)

        /* Start sync */
        sync(data => {
            notes = migrateAndMergeNotes(notes, data)
            // notes = mergeNotes(notes, data)
            renderSidebar(notes)
            saveLocally(notes)
            persist(notes)
            /* Syncs notes between devices as long as the title doesn't change */
            if (notes[activeNote.uid]) renderNote(activeNote.uid)
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
