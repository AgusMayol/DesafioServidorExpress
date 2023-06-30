const socket = io();

let actualData;

const table = document.getElementById("table")
const boton = document.getElementById("submitButton")
const prevButton = document.getElementById("prevButton")
const nextButton = document.getElementById("nextButton")

//Obtenemos los inputs del formulario
const title = document.getElementById("title")
const description = document.getElementById("description")
const price = document.getElementById("price")
const category = document.getElementById("category")
const code = document.getElementById("code")
const stock = document.getElementById("stock")

//URL Params
let urlParams = new URLSearchParams(window.location.search);
let limit = urlParams.get("limit") || 10;
let page = urlParams.get("page") || 1;
let sort = urlParams.get("sort") || 1;

function convertirAHTML(productos) {
    let html = '';

    productos.docs.forEach((producto) => {
        html += '<tr>';
        html += '<td class="px-4 py-2 border-b">' + producto.title + '</td>';
        html += '<td class="px-4 py-2 border-b">' + producto.description + '</td>';
        html += '<td class="px-4 py-2 border-b">$' + producto.price + '</td>';
        html += '<td class="px-4 py-2 border-b">' + producto.category + '</td>';
        html += '<td class="px-4 py-2 border-b">' + producto.code + '</td>';
        html += '<td class="px-4 py-2 border-b">' + producto.stock + '  unidades</td>';
        html += `<td class="px-4 py-2 border-b flex items-center gap-2"> 
        
        <a href="/product/${producto._id}"
                        class="flex w-full justify-center rounded-md bg-indigo-600 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>

                    </a>

        <button type="button" class="flex w-full justify-center rounded-md bg-red-700 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" onclick='deleteProduct("${producto._id}")'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
      </button> </td>`;
        html += '</tr>';
    });

    return html;
}
socket.on('fetch', async () => {
    try {
        let cart = await fetch(`/api/products/?limit=${limit}&page=${page}&sort=${sort}`);
        const data = await cart.json();
        table.innerHTML = convertirAHTML(data);
        console.log("Se hizo un fetch")
        console.log(data)
        actualData = data

        //Botones de paginacion
        if (data.hasPrevPage) {
            prevButton.style.backgroundColor = "#818cf8"
        }

        if (data.hasNextPage) {
            nextButton.style.backgroundColor = "#818cf8"
        }


    } catch (error) {
        console.log(error)
    }
})

function prevPage() {
    if (!actualData.hasPrevPage) return;
    urlParams.set('page', actualData.prevPage);
    window.location.search = urlParams.toString();
}

function nextPage() {
    if (!actualData.hasNextPage) return;
    urlParams.set('page', actualData.nextPage);
    window.location.search = urlParams.toString();
}

// Añadir nuevos productos
boton.addEventListener("click", () => {
    console.log("Añadiendo producto...")
    const data = {}

    //Obtenemos los valores de los inputs
    data.title = title.value
    data.description = description.value
    data.price = parseInt(price.value)
    data.category = category.value
    data.code = code.value
    data.stock = parseInt(stock.value)

    socket.emit('addProduct', data);

});

// Eliminar un producto

function deleteProduct(productId) {
    socket.emit('deleteProduct', productId);
}