const socket = io();
const table = document.getElementById("table")
const boton = document.getElementById("submitButton")

const messageContent = document.getElementById("mensaje")
let username = "";

//Identificar usuario
window.addEventListener("load", async function (event) {
    let usersession = await fetch(`/api/sessions/current`, {
        method: 'GET',
    })
    const data = await usersession.json();
    username = data.name
});

function convertirAHTML(mensajes) {
    let html = '';

    mensajes.forEach((mensaje) => {
        html += '<tr>';
        html += '<td class="px-4 py-2 border-b">' + mensaje.username + '</td>';
        html += '<td class="px-4 py-2 border-b">' + mensaje.messageContent + '</td>';
        html += `<td class="px-4 py-2 border-b"> <button type="button" class="flex w-full justify-center rounded-md bg-red-700 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" onclick='deleteMessage("${mensaje._id}")'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
      </button> </td>`;
        html += '</tr>';
    });

    return html;
}

socket.on('mensajes', (mensajes) => {
    table.innerHTML = convertirAHTML(mensajes);
})


// Enviar nuevo mensaje
boton.addEventListener("click", () => {
    console.log("Enviando mensaje...")
    const data = {}

    //Obtenemos los valores de los inputs
    data.username = username
    data.messageContent = messageContent.value

    socket.emit('addMessage', data);

});

// Eliminar un producto

function deleteMessage(messageId) {
    socket.emit('deleteMessage', messageId);
}