const form = document.getElementById('restartPasswordForm');
const emailInput = document.getElementById('email');

form.addEventListener('submit', e => {
    e.preventDefault();
    fetch(`/api/sessions/requestRestartPassword/${emailInput.value}`).then(result => {
        if (result.status === 200) {
            alert("Revisa tu casilla de correo electrónico. Se envió satisfactoriamente una solicitud de restauración de contraseña.")
            window.location.href = "/login"

        }
    })
})