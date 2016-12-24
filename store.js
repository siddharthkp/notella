const config = {
    apiKey: "AIzaSyC3yBT7RUgr7rqpcKaIIoKQxIdbVy5_c1Q",
    authDomain: "notes-65612.firebaseapp.com",
    databaseURL: "https://notes-65612.firebaseio.com",
    storageBucket: "notes-65612.appspot.com",
    messagingSenderId: "241953144431"
}
firebase.initializeApp(config)
const database = firebase.database().ref('/siddharthkp')

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
