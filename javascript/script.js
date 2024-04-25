document.addEventListener('DOMContentLoaded', function () {
    const botonesAgregar = document.querySelectorAll('.boton');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarAlCarrito);
    });

    // Utilizamos event delegation para manejar los clics en el botón "Simular Pedido"
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'simularPedido') {
            event.preventDefault();
            simularPedido();
        }
    });

    // Manejamos el clic en el botón "Confirmar Pedido"
    const confirmarPedidoBtn = document.getElementById('confirmarPedido');
    if (confirmarPedidoBtn) {
        confirmarPedidoBtn.addEventListener('click', function(event) {
            event.preventDefault();
            confirmarPedido();
        });
    }

    // Cargar productos del localStorage al cargar la página
    cargarProductosDelLocalStorage();

    function agregarAlCarrito(evento) {
        evento.preventDefault(); // Evitar comportamiento predeterminado
        const boton = evento.target;
        const item = boton.closest('.card');
        const titulo = item.querySelector('.titulocard').textContent;
        const precioTexto = item.querySelector('.preciocard').textContent;
        const precio = parseFloat(precioTexto.replace('Valor: $', '')); // Convertir precio a número
        const id = boton.getAttribute('data-id');
        const imagenSrc = item.querySelector('.imagencard').src;
        const descripcion = item.querySelector('.textocard').textContent;

        const producto = {
            id: id,
            titulo: titulo,
            precio: precio,
            imagenSrc: imagenSrc,
            descripcion: descripcion
        };

        // Verificar si el producto ya está en el carrito
        const productosEnCarrito = document.querySelectorAll('#lista-carrito li');
        let productoExistente = null;
        productosEnCarrito.forEach(item => {
            const tituloEnCarrito = item.querySelector('.titulo').textContent;
            if (tituloEnCarrito === producto.titulo) {
                productoExistente = item;
            }
        });

        if (productoExistente) {
            // Si el producto ya está en el carrito, aumentar la cantidad y actualizar el total
            const cantidadExistente = parseInt(productoExistente.querySelector('.cantidad').textContent);
            const nuevaCantidad = cantidadExistente + 1;
            const nuevoTotal = producto.precio * nuevaCantidad;
            productoExistente.querySelector('.cantidad').textContent = nuevaCantidad;
            productoExistente.querySelector('.total').textContent = `$${nuevoTotal.toFixed(2)}`; // Corregir el formato del total
        } else {
            // Si el producto no está en el carrito, agregarlo
            agregarProductoAlCarrito(producto);
        }
        
        mostrarPopUp(producto);
        calcularTotal();
    }

    function agregarProductoAlCarrito(producto) {
        const elementoLista = document.createElement('li');
        elementoLista.innerHTML = `
            <span class="eliminar-producto">&times;</span>
            <span class="titulo">${producto.titulo}</span> - 
            <span class="cantidad">1</span> x 
            $<span class="precio">${producto.precio.toFixed(2)}</span> = 
            <span class="total">$${producto.precio.toFixed(2)}</span>
        `;
        document.getElementById('lista-carrito').appendChild(elementoLista);
        // Mostrar el botón de simular pedido después de agregar un producto al carrito
        document.getElementById('simularPedido').style.display = 'inline-block';
        // Guardar en el localStorage
        guardarProductosEnLocalStorage();
    }

    function calcularTotal() {
        let total = 0;
        const totales = document.querySelectorAll('#lista-carrito .total');
        totales.forEach(totalElemento => {
            total += parseFloat(totalElemento.textContent.replace('$', ''));
        });
        document.getElementById('total-carrito').textContent = `$${total.toFixed(2)}`;
    }

    function mostrarPopUp(producto) {
        const popUp = document.createElement('div');
        popUp.classList.add('pop-up');
        popUp.innerHTML = `
            <div class="pop-up-content">
                <span class="close-button">&times;</span>
                <img src="${producto.imagenSrc}" alt="${producto.titulo}">
                <h2>${producto.titulo}</h2>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.precio.toFixed(2)}</p>
            </div>
        `;
        document.body.appendChild(popUp);

        // Cerrar el pop-up automáticamente después de 1 segundo
        setTimeout(() => {
            document.body.removeChild(popUp);
        }, 1000);
        
        // Cerrar el pop-up al hacer clic en el botón de cerrar
        const closeButton = popUp.querySelector('.close-button');
        closeButton.addEventListener('click', function() {
            document.body.removeChild(popUp);
        });
    }

    function simularPedido() {
        const productosEnCarrito = document.querySelectorAll('#lista-carrito li');
        if (productosEnCarrito.length > 0) {
            // Mostrar el formulario para simular el pedido
            document.getElementById('formularioPedido').style.display = 'block';
        } else {
            alert('El carrito está vacío. Agregue productos antes de simular un pedido.');
        }
    }

    function confirmarPedido() {
        // Aquí podrías agregar la lógica para enviar el pedido al servidor
        // Por ahora, solo ocultaremos el formulario después de confirmar
        document.getElementById('formularioPedido').style.display = 'none';
        // Vaciar el carrito de compras
        document.getElementById('lista-carrito').innerHTML = '';
        // Actualizar el total a $0.00
        document.getElementById('total-carrito').textContent = '$0.00';
        // Mostrar mensaje de confirmación
        mostrarMensajeConfirmacion();
        // Limpiar el localStorage
        localStorage.removeItem('productosCarrito');
        // Ocultar el botón de simular pedido después de confirmar el pedido
        document.getElementById('simularPedido').style.display = 'none';
    }

    function mostrarMensajeConfirmacion() {
        console.log("Mostrando mensaje de confirmación");
        const popUpConfirmacion = document.createElement('div');
        popUpConfirmacion.classList.add('pop-up');
        popUpConfirmacion.innerHTML = `
            <div class="pop-up-content">
                <span class="close-button">&times;</span>
                <h2>Pedido registrado</h2>
                <p>Llegará en 2 días hábiles.</p>
            </div>
        `;
        document.body.appendChild(popUpConfirmacion);

        // Cerrar el pop-up al hacer clic en el botón de cerrar
        const closeButton = popUpConfirmacion.querySelector('.close-button');
        closeButton.addEventListener('click', function() {
            document.body.removeChild(popUpConfirmacion);
        });
    }

    // Función para guardar los productos en el localStorage
    function guardarProductosEnLocalStorage() {
        const productosEnCarrito = [];
        const productos = document.querySelectorAll('#lista-carrito li');
        productos.forEach(producto => {
            const titulo = producto.querySelector('.titulo').textContent;
            const cantidad = parseInt(producto.querySelector('.cantidad').textContent);
            const precio = parseFloat(producto.querySelector('.precio').textContent);
            productosEnCarrito.push({ titulo, cantidad, precio });
        });
        localStorage.setItem('productosCarrito', JSON.stringify(productosEnCarrito));
    }

    // Función para cargar productos del localStorage al cargar la página
    function cargarProductosDelLocalStorage() {
        const productosEnCarrito = JSON.parse(localStorage.getItem('productosCarrito'));
        if (productosEnCarrito) {
            productosEnCarrito.forEach(producto => {
                const productoHTML = `
                    <li>
                        <span class="eliminar-producto">&times;</span>
                        <span class="titulo">${producto.titulo}</span> - 
                        <span class="cantidad">${producto.cantidad}</span> x 
                        $<span class="precio">${producto.precio.toFixed(2)}</span> = 
                        <span class="total">$${producto.cantidad * producto.precio}</span>
                    </li>
                `;
                document.getElementById('lista-carrito').insertAdjacentHTML('beforeend', productoHTML);
            });
            calcularTotal();
            // Mostrar el botón de simular pedido
            document.getElementById('simularPedido').style.display = 'inline-block';
        }
    }

    // Event listener para eliminar producto del carrito
    document.getElementById('lista-carrito').addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('eliminar-producto')) {
            const productoAEliminar = event.target.parentElement;
            productoAEliminar.remove();
            calcularTotal();
            guardarProductosEnLocalStorage(); // Actualizar el localStorage después de eliminar un producto
        }
    });
});
