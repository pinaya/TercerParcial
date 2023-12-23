// Función para inicializar IndexedDB
function initDB() {
    const dbName = 'comentariosDB';
    const dbVersion = 2; // Cambia la versión de la base de datos para activar la actualización

    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = function (event) {
        console.error('Error al abrir la base de datos:', event.target.error);
    };

    request.onupgradeneeded = function (event) {
        const db = event.target.result;

        // Verifica si existe un almacén de comentarios
        if (!db.objectStoreNames.contains('comments')) {
            // Crea un almacén de objetos para los comentarios con un campo id autoincrementado
            const commentStore = db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });

            // Puedes agregar más configuraciones según tus necesidades
            // commentStore.createIndex('userIndex', 'user', { unique: false });
        }
    };
}


// Función para enviar un comentario
function submitComment() {
    const userName = document.getElementById('userName').value;
    const commentText = document.getElementById('commentText').value;

    const comment = {
        user: userName,
        text: commentText,
        date: new Date().toLocaleString(),
    };

    const request = indexedDB.open('comentariosDB');
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['comments'], 'readwrite');

        // Obtiene una referencia al almacén de objetos
        const commentStore = transaction.objectStore('comments');

        const addRequest = commentStore.add(comment);
        addRequest.onsuccess = function () {
            console.log('Comentario agregado exitosamente:', comment);
            document.getElementById('userName').value = '';
            document.getElementById('commentText').value = '';
            // Después de agregar el comentario, actualiza la lista
            fetchComments();
        };

        addRequest.onerror = function (event) {
            console.error('Error al agregar el comentario:', event.target.error);
        };
    };

    request.onerror = function (event) {
        console.error('Error al abrir la base de datos:', event.target.error);
    };
}



// Función para recuperar y mostrar los comentarios
function fetchComments() {
    const request = indexedDB.open('comentariosDB');
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['comments'], 'readonly');
        const commentStore = transaction.objectStore('comments');

        const comments = [];

        const cursorRequest = commentStore.openCursor();
        cursorRequest.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                comments.push(cursor.value);
                cursor.continue();
            } else {
                // Después de recorrer todos los comentarios, actualiza la lista
                displayComments(comments);
            }
        };

        cursorRequest.onerror = function (event) {
            console.error('Error al abrir el cursor:', event.target.error);
        };
    };

    request.onerror = function (event) {
        console.error('Error al abrir la base de datos:', event.target.error);
    };
}

// Nueva función para mostrar los comentarios
function displayComments(comments) {
    const commentList = document.getElementById('commentList');
    commentList.innerHTML = ''; // Limpiar la lista antes de agregar comentarios

    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('card', 'mb-3');

        commentElement.innerHTML = `
    <div class="card-body">
        <h6 class="card-title">${comment.user}</h6>
        <h7 class="card-text">${comment.text}</h7>
        <h8 class="card-text"><small class="text-muted">${comment.date}</small></h8>
        </p>
        <button class="btn btn-danger" onclick="deleteComment(${comment.id})">Eliminar</button>
    </div>
`;
        commentList.appendChild(commentElement);
    });
}

// Función para eliminar comentarios
function deleteComment(commentId) {
    if (commentId === undefined || isNaN(commentId)) {
        console.error('Error: commentId no es válido. No se puede eliminar el comentario.');
        return;
    }

    const request = indexedDB.open('comentariosDB');
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['comments'], 'readwrite');
        const commentStore = transaction.objectStore('comments');

        try {
            // Utiliza el método delete con el commentId directamente
            const deleteRequest = commentStore.delete(commentId);
            deleteRequest.onsuccess = function () {
                console.log('Comentario eliminado exitosamente:', commentId);
                // Después de eliminar el comentario, actualiza la lista
                fetchComments();
            };

            deleteRequest.onerror = function (event) {
                console.error('Error al eliminar el comentario:', event.target.error);
            };
        } catch (error) {
            console.error('Error inesperado al intentar eliminar el comentario:', error);
        }
    };

    request.onerror = function (event) {
        console.error('Error al abrir la base de datos:', event.target.error);
    };
}

// Función para agregar un comentario a la lista en la página
function addCommentToList(comment) {
    const commentList = document.getElementById('commentList');

    const commentElement = document.createElement('div');
    commentElement.classList.add('card', 'mb-3');

    commentElement.innerHTML = `
    <div class="card-body">
        <h5 class="card-title">${comment.user}</h5>
        <p class="card-text">${comment.text}</p>
        <p class="card-text"><small class="text-muted">${comment.date}</small></p>
        <button class="btn btn-danger" onclick="deleteComment(${comment.id})">Eliminar</button>
    </div>
`;

    commentList.appendChild(commentElement);
}

// Llama a la función de inicialización de la base de datos al cargar la página
window.onload = function () {
    initDB();
    fetchComments();
};


