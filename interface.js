const textarea = document.getElementsByTagName('textarea')[0]
const sidebar = document.getElementsByTagName('sidebar')[0]
const list = document.getElementsByTagName('list')[0]
const toggle = document.getElementsByTagName('toggle')[0]
const night = document.getElementsByTagName('night')[0]

const emptyNotes = {
    '_new note': {
        content: ''
    }
}

const activeNote = {
    title: Object.keys(emptyNotes)[0]
}

const renderSidebar = (notes) => {
    let titles = Object.keys(notes).sort()
    let html = ''
    for (let title of titles) html += `<div onclick="changeNote(event)">${title}</div>`
    list.innerHTML = html
}

const changeNote = (event) => {
    let title = event.target.innerHTML
    renderNote(title)
}

const renderNote = (title) => {
    activeNote.title = title
    textarea.value = notes[title].content
    if (!textareaVisible) toggleSidebar()
    textarea.focus()
}

const saveNote = () => {
    let content = textarea.value
    let title = getTitle(content)

    if (activeNote.title !== '_new note') delete notes[activeNote.title]

    /* If the note is empty, delete it */
    if (content) {
        activeNote.title = title
        let modified = new Date().getTime()
        notes[title] = {content, modified}
    }

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
