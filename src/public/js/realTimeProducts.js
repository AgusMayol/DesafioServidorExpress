const socket = io();
const table = document.getElementById("table")
const boton = document.getElementById("submitButton")

//Obtenemos los inputs del formulario
const title = document.getElementById("title")
const description = document.getElementById("description")
const price = document.getElementById("price")
const category = document.getElementById("category")
const code = document.getElementById("code")
const stock = document.getElementById("stock")

function convertirAHTML(productos) {
    let html = '';

    productos.forEach((producto) => {
        html += '<tr>';
        html += '<td class="px-4 py-2 border-b">' + producto.title + '</td>';
        html += '<td class="px-4 py-2 border-b">' + producto.description + '</td>';
        html += '<td class="px-4 py-2 border-b">$' + producto.price + '</td>';
        html += '<td class="px-4 py-2 border-b">' + producto.category + '</td>';
        html += '<td class="px-4 py-2 border-b">' + producto.code + '</td>';
        html += '<td class="px-4 py-2 border-b">' + producto.stock + '  unidades</td>';
        html += `<td class="px-4 py-2 border-b"> <button type="button" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" onclick='deleteProduct("${producto._id}")'>Eliminar</button> </td>`;
        html += '</tr>';
    });

    return html;
}

socket.on('products', (products) => {
    table.innerHTML = convertirAHTML(products);
})


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

    console.log(data)

    socket.emit('addProduct', data);

});

// Eliminar un producto

function deleteProduct(productId) {
    socket.emit('deleteProduct', productId);
}