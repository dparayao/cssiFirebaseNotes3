let googleUserId;
window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('Logged in as: ' + user.displayName);
        googleUserId = user.uid;
      getNotes(googleUserId);
    } else {
      // If not logged in, navigate back to login page.
      window.location = 'index.html'; 
    };
  });
};

const getNotes = (userId) => {
  const notesRef = firebase.database().ref(`users/${userId}`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    renderDataAsHtml(data);
  });
};

const renderDataAsHtml = (data) => {
  let cards = ``;
  for(const noteId in data) {
    const note = data[noteId];
    // For each note create an HTML card
    cards += createCard(note, noteId)
  };
  // Inject our string of HTML into our viewNotes.html page
  document.querySelector('#app').innerHTML = cards;
};

const createCard = (note, noteId) => {
   return `
     <div class="column is-one-quarter">
       <div style = "border-radius: 5%; "class="card">
         <header class="card-header">
           <p class="card-header-title">${note.title}</p>
         </header>
         <div style = "padding: 5%;" class="card-content">
                <div id = "noteTags" class = "tags">
                <span class = "tag is-rounded is-normal is-light">${ note.tag }</span>
                <div id = "archivetags">
                    <span id = "archive" style = "visibility:hidden;"class = "tag is-rounded is-normal is-light">Archived</span>
                </div>
                </div>
           <div class="content">${note.text}</div>
         </div>
         <footer class="card-footer">
            <a id="${noteId}"
            href = "#"
            class="card-footer-item"
            onclick="deleteNote('${noteId}')">
            Delete
            </a>
            <a
            href = "#"
            class="card-footer-item"
            onclick="editNote('${noteId}')">
            Edit
            </a>
    
         </footer>
       </div>
     </div>
   `;
};

function editNote(noteId) {    
    const editNoteModal = document.querySelector('#editNoteModal');

    const notesRef = firebase.database().ref(`users/${googleUserId}/${noteId}`);
    notesRef.on('value', (snapshot) => {
        const note = snapshot.val();
        document.querySelector('#editTitleInput').value = note.title;
        document.querySelector('#editTextInput').value = note.text;
        document.querySelector('#noteId').value = noteId;
    });
    editNoteModal.classList.toggle('is-active');
    // console.log('edit', noteId);
}

function deleteNote(noteId) {
    firebase.database().ref(`users/${googleUserId}/${noteId}`).remove();
    // console.log('delete', noteId);
}

function saveEditedNote(){
    const noteTitle = document.querySelector('#editTitleInput').value;
    const noteText = document.querySelector('#editTextInput').value;
    const noteTag = document.querySelector('#editTagInput').value;
    const editedNote = {
        title: noteTitle,
        text: noteText,
        tag: noteTag, // if they share the same name, you only need to write it once
    }
    const noteId = document.querySelector('#noteId').value;
    checkBox(noteId);
    firebase.database().ref(`users/${googleUserId}/${noteId}`).update(editedNote);
    closeEditModal();
}

function closeEditModal() {
    const editNoteModal = document.querySelector('#editNoteModal'); 
    editNoteModal.classList.toggle('is-active');
}

function checkBox(noteId) {
    const box = document.querySelector('#yesArchive');
    
    if(box.checked == true)
    {
        console.log("is checked");
        archiveNote(noteId);
    }
    else
    {
        console.log("not checked");
    }
}

function archiveNote(noteId) {
    //document.querySelector('#archivetags').innerHTML += `<span id = "archive" style = "visibility:visible;"class = "tag is-rounded is-normal is-light">Archived</span>`
    document.querySelector('#archive').style.visibility = "visible";
    console.log(noteId);
}