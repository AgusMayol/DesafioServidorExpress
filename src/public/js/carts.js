let urlParams = new URLSearchParams(window.location.search);
let id = urlParams.get("id");
const table = document.getElementById("table")
const title = document.getElementById("title")
const backButton = document.getElementById("backButton")
const quantityTh = document.getElementById("quantityTh")
const botones = document.getElementById("botones")

if (id) {

    function convertirAHTML(carrito) {
        let html = '';
        (carrito.products).forEach(product => {
            html += '<tr>'
            html += '    <td class="px-4 py-2 border-b">' + product._id + '</td>'
            html += '    <td class="px-4 py-2 border-b">' + product.product.title + ' | [' + product.product._id + ']</td>'
            html += '    <td class="px-4 py-2 border-b">' + product.quantity + '</td>'
            html += '    <td class="px-4 py-2 border-b">'
            html += `        <button type="button" class="flex w-full justify-center rounded-md bg-red-700 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" onclick="deleteProductFromCart('${product._id}')"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"> <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /> </svg> </button> `
            html += '    </td>'
            html += '</tr>'
        });



        return html;
    }

    async function getCart() {
        try {
            let cart = await fetch(`/api/carts/${id}`);
            const data = await cart.json();
            title.innerText = `Cart: ${id}`
            table.innerHTML = convertirAHTML(data);
            backButton.style.display = "block"
            quantityTh.style.display = "block"
            botones.style.display = "flex"
        } catch (error) {
            window.location = "/carts"
        }
    }

    getCart();

}

async function deleteCart() {
    await fetch(`/api/carts/deleteCart/${id}`, {
        method: 'DELETE',
    })
    window.location = "/carts"
}

async function deleteProductFromCart(productId) {
    await fetch(`/api/carts/${id}/product/${productId}`, {
        method: 'DELETE',
    })
    window.location.reload();
}

async function deleteAllProductsFromCart() {
    await fetch(`/api/carts/${id}`, {
        method: 'DELETE',
    })
    window.location.reload();
}

async function checkout() {
    try {
        const result = await fetch(`/api/carts/${id}/purchase`, {
            method: 'POST',
        });

        if (result.status === 200) {
            const response = await result.json();
            window.location = `/ticket/${response._id}`
        } else {
            console.error("Ocurrió un error en el proceso de compra");
        }
    } catch (error) {
        console.error("Ocurrió un error:", error);
    }
}