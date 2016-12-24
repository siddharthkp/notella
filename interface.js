const textarea = document.getElementById('textarea')
const sidebar = document.getElementsByTagName('sidebar')[0]
const toggle = document.getElementsByTagName('toggle')[0]

const emptyNotes = {
    '_new note': ''
}

const activeNote = {
    title: Object.keys(emptyNotes)[0]
}

const renderSidebar = (notes) => {
    let titles = Object.keys(notes).sort()
    let html = ''
    for (let title of titles) html += `<div onclick="changeNote(event)">${title}</div>`
    sidebar.innerHTML = html
}

const changeNote = (event) => {
    let title = event.target.innerHTML
    renderNote(title)
}

const boldFirstLine = (content) => {
    let firstLine = content.split('\n')[0]
    content = content.replace(firstLine, '')
    return `<b>${firstLine}</b>${content}`
}

const renderNote = (title) => {
    activeNote.title = title
    textarea.innerHTML = boldFirstLine(notes[title])
    if (!textareaVisible) toggleSidebar()
    textarea.focus()
}

const saveNote = () => {
    let content = textarea.innerHTML
    if (!content) return

    let title = getTitle(content)

    if (activeNote.title !== '_new note') delete notes[activeNote.title]
    activeNote.title = title

    notes[title] = content

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

const getTitle = (note) => {
    return note.split('\n')[0].replace('#', '')
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

/*
    Get local copy first
    Get's overwrite with remote copy (store.js)= source of truth
*/
let notes = Object.assign({}, emptyNotes, JSON.parse(localStorage.getItem('notes')))
renderSidebar(notes)
textarea.focus();

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
        toggle.style.top = -20;
        textarea.focus()
    } else {
        toggle.innerHTML = '✕'
        toggle.style.top = -7;
        toggle.style.float = 'right'
    }
}

textarea.addEventListener('keyup paste', debounce(saveNote))
toggle.addEventListener('click', toggleSidebar)

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
}
