const textarea = document.getElementsByTagName('textarea')[0]
const sidebar = document.getElementsByTagName('sidebar')[0]
const list = document.getElementsByTagName('list')[0]
const toggle = document.getElementsByTagName('toggle')[0]
const night = document.getElementsByTagName('night')[0]

const emptyNotes = {
    '_new note': {
        title: '_new note',
        content: ''
    }
}

const activeNote = {
    uid: Object.keys(emptyNotes)[0]
}

const renderSidebar = (notes) => {
    let uids = Object.keys(notes).sort()
    let html = ''
    for (let uid of uids) html += `<div onclick="changeNote(event)" data-id="${uid}">${notes[uid].title}</div>`
    list.innerHTML = html
}

const changeNote = (event) => {
    let uid = event.target.dataset.id
    renderNote(uid)
}

const renderNote = (uid) => {
    activeNote.uid = uid
    textarea.value = notes[uid].content
    if (!textareaVisible) toggleSidebar()
    textarea.setAttribute('data-id', uid)
    textarea.focus()
}

const saveNote = () => {
    let content = textarea.value
    let title = getTitle(content)
    let uid;
    // if uid is blank generate new one, else delete old entry with same uid
    if (activeNote.uid === '_new note') {
      uid = uuid.v1()
      activeNote.uid = uid // set active note to newly saved note
    } else {
      delete notes[activeNote.uid]
      uid = activeNote.uid
    }
    /* If the note is empty, delete it */
    if (content) {
        let modified = new Date().getTime()
        notes[uid] = {title, content, modified}
    }
    console.log(uid)
    console.log(activeNote)
    console.log(notes)

    saveNotes()
}

const saveNotes = () => {
    saveLocally(notes)
    persist(notes)
    renderSidebar(notes)
}

const saveLocally = (notes) => {
    localStorage.setItem('notes', JSON.stringify(notes))
}

const getTitle = (content) => {
    return content.split('\n')[0].replace('#', '')
}

const debounce = (func) => {
	let timeout
	return () => {
		let context = this
		let later = () => {
			timeout = null
			func.apply(context)
		}
		clearTimeout(timeout)
		timeout = setTimeout(later, 500)
	}
}

const reset = () => {
    notes = emptyNotes
    saveNotes()
    location.reload(true)
}

let textareaVisible = true
const toggleSidebar = () => {
    sidebar.style.display = sidebar.style.display === 'block' ? 'none': 'block'
    textarea.style.display = textarea.style.display === 'none' ? 'block': 'none'
    textareaVisible = !textareaVisible
    if (textareaVisible) {
        toggle.innerHTML = '☰☰'
        toggle.style.float = 'left'
        toggle.style.top = -20
        toggle.style.left = -7
        textarea.focus()
    } else {
        toggle.innerHTML = '✕'
        toggle.style.top = -7
        toggle.style.left = -20
        toggle.style.float = 'right'
    }
}

const setTheme = () => {
    let theme, icon
    if (localStorage.night) {
        theme = {
            backgroundColor: '#20222B',
            color: '#EFEFEF'
        }
        icon = '☀️'
    } else {
        theme = {
            backgroundColor: '#EFEFEF',
            color: '#333'
        }
        icon = '🌚'
    }

    Object.assign(document.body.style, theme)
    Object.assign(textarea.style, theme)
    night.innerHTML = icon
}

const toggleTheme = () => {
    if (localStorage.night) delete localStorage.night
    else localStorage.night = true
    setTheme()
}

textarea.addEventListener('keyup', debounce(saveNote))
toggle.addEventListener('click', toggleSidebar)
night.addEventListener('click', toggleTheme)

/*
    Get local copy first
    Get's overwrite with remote copy (store.js)= source of truth
*/
let notes = Object.assign({}, emptyNotes, JSON.parse(localStorage.getItem('notes')))
renderSidebar(notes)
setTheme()

/* Register service worker */

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
}
