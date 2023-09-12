const form = document.getElementById('restartPasswordForm');

function obtenerSegmentosDeURL() {
    const urlActual = window.location.href;

    const segmentos = urlActual.split('/');

    // Elimina el primer elemento (generalmente el protocolo "http:" o "https:")
    segmentos.shift();

    return segmentos;
}

const segmentosURL = obtenerSegmentosDeURL();
const resetPasswordId = segmentosURL[4]; //Agarramos el 4, el resetPasswordId.

form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => obj[key] = value);
    console.log("Enviando formulario")
    fetch(`/api/sessions/restartPassword/${resetPasswordId}`, {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(result => {
        if (result.status === 200) {
            alert("Contraseña restaurada correctamente")
            window.location.href = "/login"

        }
    })

})