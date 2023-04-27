let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
};

const btnGuararCliente = document.querySelector('#guardar-cliente');
btnGuararCliente.addEventListener('click', guardarCliente);

function guardarCliente()  {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    // Revisar si hay campos vacios
    const camposVacios = [ mesa, hora ].some(campo => campo === '');

    if(camposVacios) {
        // Verificar si ya hay una alerta
        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta) {
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);
            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }
        return;
    }
    // Asignar datos del formulario al cliente
    cliente = { ...cliente, mesa, hora };

    // Ocultar el modal...
    var modalFormulario = document.querySelector('#formulario');
    var modal = bootstrap.Modal.getInstance(modalFormulario);
    modal.hide();

    // Mostrar las secciones 
    mostrarSecciones();
    // Obtener Platillo de la API de  JSON-Server
    obtenerPlatillos();
}

function mostrarSecciones() {
    const seleccionesOcultas = document.querySelectorAll('.d-none');
    seleccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
}

function obtenerPlatillos() {
    const url = 'http://localhost:4000/platillos';
    
    fetch(url)
        .then( respuesta => respuesta.json())
        .then( resultado => mostrarPlatillos(resultado))// Mostrar platillo en el DOM
        .catch(error => console.log(error))
}

function mostrarPlatillos(platillos) {
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach(  platillo => {
        const row = document.createElement('DIV');
        row.classList.add('row', 'border-top' );

    
        const nombre = document.createElement('DIV');
        nombre.classList.add('col-md-4', 'py-3', 'fw-bolder');
        nombre.textContent = platillo.nombre;   

        const precio = document.createElement('DIV');
        precio.classList.add('col-md-3', 'py-3', 'fw-bold');
        precio.textContent = `$${platillo.precio}`;

        const categoria = document.createElement('DIV');
        categoria.classList.add('col-md-3', 'py-3');
        categoria.textContent = categorias[platillo.categoria];

        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');

        // Función que detecta la cantidad y el platillo que se esta agregando
        inputCantidad.onchange = function() {
            const cantidad = parseInt( inputCantidad.value );
           agregarPlatillo({...platillo, cantidad});
        }

        const agregarCantidad = document.createElement('DIV');
        agregarCantidad.classList.add('col-md-2', 'py-3');
        agregarCantidad.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregarCantidad);

        contenido.appendChild(row);
    })
}

function agregarPlatillo(producto) {
    let { pedido } = cliente;

    if (producto.cantidad > 0 ) {
    // Comprobar si el platillo ya esta en el carrito...
        if(pedido.some( articulo =>  articulo.id === producto.id )) {
            // Si el articulo ya existe, actualizar la cantidad
            const pedidoActualizado = pedido.map( articulo => {
                if( articulo.id === producto.id ) {
                    articulo.cantidad = producto.cantidad;
                } 
                // Retornar todo el articulo para no perder referencia del resto de objs
                return articulo;
            });

            // Se asigna e nuevo array a cliente.pedido
            cliente.pedido  = [...pedidoActualizado];
        } else {
            // En caso de que el articulo no exista, es nuevo y se agrega al array de pedido
            cliente.pedido = [...pedido, producto];
        }
    } else {
        // Elimina elementos cuando la cantidad es 0
        const resultado = pedido.filter(articulo => articulo.id !== producto.id);
        cliente.pedido = [...resultado];       
    }

    // Limpiar el html previo
    limpiarHTML();

    if(cliente.pedido.length) {
        // Mostrar resumen del pedido
        actualizarResumen();
    }  else {
        // Voler a mostrar el mensaje del pedido vacio
        mensajePedidoVacio();
    }
}   

function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    // Mostrar info de la Mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');
    mesa.appendChild(mesaSpan);

    // Hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');
    hora.appendChild(horaSpan);

    // Mostrar los platillos Consumidos!
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos Pedidos';
    heading.classList.add('my-4', 'text-center');

    // Iterar sobre el array de pedidos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    // Producto pedido
    const { pedido } = cliente;
    pedido.forEach( articulo => {

        const { nombre, cantidad, precio, id } = articulo;

        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('h4');
        nombreEl.classList.add('text-center', 'my-4');
        nombreEl.textContent = nombre;

        // Cantidad del artículo
        const cantidadEl = document.createElement('P');        
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        // Precio del artículo
        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        // Subtotal del articulo
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);

        // Botón para Eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar Pedido';

        // Función para eliminar ese contenido
        btnEliminar.onclick = function() {
            eliminarProducto( id );
        }
        
        // Agregar los valores a sus contenedores
        cantidadEl.appendChild(cantidadValor)
        precioEl.appendChild(precioValor)
        subtotalEl.appendChild(subtotalValor);

        // Agrega elementos al LI
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        // Agregar lista al grupo 
        grupo.appendChild(lista);
         
    })

    // Agregar al resumen
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);
    
    // Agregar el html al .contenido
    contenido.appendChild(resumen)

    // Mostrar Calculadora de Propinas
    formularioPropinas();   
}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');
    while(contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad) {
    return `$${precio * cantidad}`;
}

function eliminarProducto(id) {
    const { pedido } = cliente;
    cliente.pedido = pedido.filter( articulo => articulo.id !== id); 

    limpiarHTML();

    if(cliente.pedido.length) {
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    // El producto se elimino; regresar la cantidad en el formulario a 0
    const productoEliminado = `#producto-${id}`; 
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;
}

function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade Productos al Pedido';

    contenido.appendChild(texto);
}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('DIV');
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

     // Propina 10%
    const checkBox10 = document.createElement('INPUT');
    checkBox10.type = "radio";
    checkBox10.name = 'propina';
    checkBox10.value = "10";
    checkBox10.classList.add('form-check-input');
    checkBox10.onclick = calcularPropina;

    const checkLabel10 = document.createElement('LABEL');
    checkLabel10.textContent = '10%';
    checkLabel10.classList.add('form-check-label');

    const checkDiv10 = document.createElement('DIV');
    checkDiv10.classList.add('form-check');

    checkDiv10.appendChild(checkBox10);
    checkDiv10.appendChild(checkLabel10);

    // Propina 25%
    const checkBox25 = document.createElement('INPUT');
    checkBox25.type = "radio";
    checkBox25.name = 'propina';
    checkBox25.value = "25";
    checkBox25.classList.add('form-check-input');
    checkBox25.onclick = calcularPropina;

    const checkLabel25 = document.createElement('LABEL');
    checkLabel25.textContent = '25%';
    checkLabel25.classList.add('form-check-label');

    const checkDiv25 = document.createElement('DIV');
    checkDiv25.classList.add('form-check');

    checkDiv25.appendChild(checkBox25);
    checkDiv25.appendChild(checkLabel25);

    // Propina 50%
    const checkBox50 = document.createElement('INPUT');
    checkBox50.type = "radio";
    checkBox50.name = 'propina';
    checkBox50.value = "50";
    checkBox50.classList.add('form-check-input');
    checkBox50.onclick = calcularPropina;

    const checkLabel50 = document.createElement('LABEL');
    checkLabel50.textContent = '50%';
    checkLabel50.classList.add('form-check-label');

    const checkDiv50 = document.createElement('DIV');
    checkDiv50.classList.add('form-check');

    checkDiv50.appendChild(checkBox50);
    checkDiv50.appendChild(checkLabel50);

    // Agregar al div pincipal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(checkDiv10);
    divFormulario.appendChild(checkDiv25);
    divFormulario.appendChild(checkDiv50);

    // Agregar al formulario
    formulario.appendChild(divFormulario);

    contenido.appendChild(formulario);
}

function calcularPropina() {
    const { pedido } = cliente;
    let subtotal = 0;

    // Calcular el Subtotal a pagar
    pedido.forEach(articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });

    // Seleccionar el Radio Button con la propina del cliente
    const radioSeleccionado = document.querySelector('[name="propina"]:checked').value;

    // Calcular la Propina
    const propina = ((subtotal * parseInt(radioSeleccionado)) / 100) ;
    // Calcular el Total
    const total = propina + subtotal;

    mostrarTotalHtmll(subtotal, total, propina);
}

function mostrarTotalHtmll(subtotal, total, propina) {

    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar');

     // Subtotal
     const subtotalParrafo = document.createElement('P');
     subtotalParrafo.classList.add('fs-3', 'fw-bold', 'mt-2');
     subtotalParrafo.textContent = 'Subtotal Consumo: ';
 
     const subtotalSpan = document.createElement('SPAN');
     subtotalSpan.classList.add('fw-normal', 'text-danger');
     subtotalSpan.textContent = `$${subtotal}`;
     subtotalParrafo.appendChild(subtotalSpan);
 
     // Propina
     const propinaParrafo = document.createElement('P');
     propinaParrafo.classList.add('fs-3', 'fw-bold', 'mt-2');
     propinaParrafo.textContent = 'Propina: ';
 
     const propinaSpan = document.createElement('SPAN');
     propinaSpan.classList.add('fw-normal', 'text-danger');
     propinaSpan.textContent = `$${propina}`;
     propinaParrafo.appendChild(propinaSpan);
 
     // Total
     const totalParrafo = document.createElement('P');
     totalParrafo.classList.add('fs-3', 'fw-bold', 'mt-2');
     totalParrafo.textContent = 'Total a Pagar: ';
 
     const totalSpan = document.createElement('SPAN');
     totalSpan.classList.add('fw-normal', 'text-danger');
     totalSpan.textContent = `$${total}`;
     totalParrafo.appendChild(totalSpan);

    // Eliminar el ultimo resultado
     const totalPagarDiv = document.querySelector('.total-pagar');
     if(totalPagarDiv) {
         totalPagarDiv.remove();
     }
    
     divTotales.appendChild(subtotalParrafo);
     divTotales.appendChild(propinaParrafo);
     divTotales.appendChild(totalParrafo);
     
     // Traer el div del formulario de propina
     const formulario = document.querySelector('.formulario > div');// ir al div del formulario
     formulario.appendChild(divTotales);
}