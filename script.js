/* =========================================
   URL GOOGLE SHEETS
========================================= */

const URL_DATOS =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSWGq_3yEQmkpF53sOfh48quizhdKQkVHHAGmWkTvRfxoSrdZusV0pVAMtpLRmsim6xlnSWoavQwI4t/pub?gid=315494993&single=true&output=csv";


/* =========================================
   VARIABLES
========================================= */

let equipos = [];

let equiposSeleccionados = [];


/* =========================================
   ELEMENTOS PRINCIPALES
========================================= */

const listaEquipos =
    document.getElementById("listaEquipos");

const contadorResultados =
    document.getElementById("contadorResultados");

const contadorComparacion =
    document.getElementById("contadorComparacion");

const btnComparar =
    document.getElementById("btnComparar");

const busqueda =
    document.getElementById("busqueda");

const btnLimpiarFiltros =
    document.getElementById("btnLimpiarFiltros");

const vistaEquipos =
    document.getElementById("vistaEquipos");

const vistaComparacion =
    document.getElementById("vistaComparacion");


/* =========================================
   FILTRO MARCA
========================================= */

const contenedorFiltroMarca =
    document.getElementById(
        "contenedorFiltroMarca"
    );

const btnFiltroMarca =
    document.getElementById(
        "btnFiltroMarca"
    );

const menuFiltroMarca =
    document.getElementById(
        "menuFiltroMarca"
    );

const textoFiltroMarca =
    document.getElementById(
        "textoFiltroMarca"
    );

const opcionesMarca =
    document.getElementById(
        "opcionesMarca"
    );


/* =========================================
   FILTRO RAM
========================================= */

const contenedorFiltroRam =
    document.getElementById(
        "contenedorFiltroRam"
    );

const btnFiltroRam =
    document.getElementById(
        "btnFiltroRam"
    );

const menuFiltroRam =
    document.getElementById(
        "menuFiltroRam"
    );

const textoFiltroRam =
    document.getElementById(
        "textoFiltroRam"
    );

const opcionesRam =
    document.getElementById(
        "opcionesRam"
    );


/* =========================================
   FILTRO MEMORIA
========================================= */

const contenedorFiltroMemoria =
    document.getElementById(
        "contenedorFiltroMemoria"
    );

const btnFiltroMemoria =
    document.getElementById(
        "btnFiltroMemoria"
    );

const menuFiltroMemoria =
    document.getElementById(
        "menuFiltroMemoria"
    );

const textoFiltroMemoria =
    document.getElementById(
        "textoFiltroMemoria"
    );

const opcionesMemoria =
    document.getElementById(
        "opcionesMemoria"
    );


/* =========================================
   MODAL
========================================= */

const modalEquipo =
    document.getElementById("modalEquipo");

const modalTitulo =
    document.getElementById("modalTitulo");

const modalDetalles =
    document.getElementById("modalDetalles");

const modalInformate =
    document.getElementById("modalInformate");

const btnCerrarModal =
    document.getElementById("btnCerrarModal");

const btnCerrarModalInferior =
    document.getElementById(
        "btnCerrarModalInferior"
    );


/* =========================================
   CONVERTIR URL DE GOOGLE DRIVE
========================================= */

function convertirUrlImagen(url) {

    if (!url) {

        return "";

    }


    const valor =
        url.trim();


    /*
       FORMATO:

       https://drive.google.com/uc?id=ID
    */

    const coincidenciaId =
        valor.match(
            /[?&]id=([^&]+)/
        );


    if (coincidenciaId) {

        return `https://drive.google.com/thumbnail?id=${coincidenciaId[1]}&sz=w1000`;

    }


    /*
       FORMATO:

       https://drive.google.com/file/d/ID/view
    */

    const coincidenciaArchivo =
        valor.match(
            /\/file\/d\/([^/]+)/
        );


    if (coincidenciaArchivo) {

        return `https://drive.google.com/thumbnail?id=${coincidenciaArchivo[1]}&sz=w1000`;

    }


    /*
       SI NO ES GOOGLE DRIVE
    */

    return valor;

}


/* =========================================
   GENERAR IMAGEN
========================================= */

function generarImagenEquipo(
    equipo,
    clase = ""
) {

    const urlImagen =
        convertirUrlImagen(
            equipo["URL IMAGEN"]
        );


    if (!urlImagen) {

        return `

            <div class="imagen-placeholder">

                IMAGEN DEL EQUIPO

            </div>

        `;

    }


    return `

        <img
            src="${urlImagen}"
            alt="${
                equipo["MARCA Y MODELO"] ||
                "Equipo"
            }"
            class="imagen-real ${clase}"
            onerror="
                this.style.display='none';
                this.nextElementSibling.style.display='flex';
            "
        >

        <div
            class="imagen-placeholder"
            style="display:none;"
        >

            IMAGEN DEL EQUIPO

        </div>

    `;

}


/* =========================================
   PARSEAR CSV
========================================= */

function parseCSV(texto) {

    const filas = [];

    let fila = [];

    let campo = "";

    let dentroComillas = false;


    for (
        let i = 0;
        i < texto.length;
        i++
    ) {

        const caracter =
            texto[i];

        const siguiente =
            texto[i + 1];


        if (
            caracter === '"' &&
            dentroComillas &&
            siguiente === '"'
        ) {

            campo += '"';

            i++;

        }

        else if (
            caracter === '"'
        ) {

            dentroComillas =
                !dentroComillas;

        }

        else if (
            caracter === "," &&
            !dentroComillas
        ) {

            fila.push(
                campo.trim()
            );

            campo = "";

        }

        else if (
            (
                caracter === "\n" ||
                caracter === "\r"
            ) &&
            !dentroComillas
        ) {

            if (
                caracter === "\r" &&
                siguiente === "\n"
            ) {

                i++;

            }


            fila.push(
                campo.trim()
            );


            if (
                fila.some(
                    valor =>
                        valor !== ""
                )
            ) {

                filas.push(fila);

            }


            fila = [];

            campo = "";

        }

        else {

            campo += caracter;

        }

    }


    if (
        campo !== "" ||
        fila.length > 0
    ) {

        fila.push(
            campo.trim()
        );


        if (
            fila.some(
                valor =>
                    valor !== ""
            )
        ) {

            filas.push(fila);

        }

    }


    return filas;

}


/* =========================================
   CARGAR GOOGLE SHEETS
========================================= */

fetch(URL_DATOS)

    .then(respuesta => {

        if (!respuesta.ok) {

            throw new Error(
                "No se pudo acceder a Google Sheets"
            );

        }

        return respuesta.text();

    })

    .then(datos => {

        console.log(
            "DATOS RECIBIDOS"
        );


        const filas =
            parseCSV(datos);


        console.log(
            "TOTAL DE FILAS:",
            filas.length
        );


        const encabezados =
            filas[0];


        equipos =
            filas
                .slice(1)
                .map(fila => {

                    const equipo = {};


                    encabezados.forEach(
                        (
                            encabezado,
                            indice
                        ) => {

                            equipo[
                                encabezado
                            ] =
                                fila[indice] ||
                                "";

                        }
                    );


                    return equipo;

                });


        console.log(
            "TOTAL DE EQUIPOS:",
            equipos.length
        );


        crearFiltros();

        mostrarEquipos(equipos);

    })

    .catch(error => {

        console.error(
            "ERROR:",
            error
        );


        contadorResultados.textContent =
            "No se pudieron cargar los equipos.";


        listaEquipos.innerHTML = `

            <div class="mensaje-sin-resultados">

                No se pudieron cargar
                los equipos.

            </div>

        `;

    });


/* =========================================
   MOSTRAR EQUIPOS
========================================= */

function mostrarEquipos(lista) {

    listaEquipos.innerHTML = "";


    const equiposActivos =
        lista.filter(
            equipo =>
                (
                    equipo.ESTADO ||
                    ""
                )
                .trim()
                .toUpperCase() ===
                "ACTIVO"
        );


    contadorResultados.textContent =

        `${equiposActivos.length} ${
            equiposActivos.length === 1
                ? "equipo encontrado"
                : "equipos encontrados"
        }`;


    if (
        equiposActivos.length === 0
    ) {

        listaEquipos.innerHTML = `

            <div class="mensaje-sin-resultados">

                No se encontraron equipos
                con los filtros seleccionados.

            </div>

        `;

        return;

    }


    equiposActivos.forEach(
        equipo => {

            const tarjeta =
                document.createElement("div");


            tarjeta.classList.add(
                "tarjeta-equipo"
            );


            tarjeta.innerHTML = `

                <div class="imagen-equipo">

                    ${generarImagenEquipo(
                        equipo
                    )}

                </div>


                <div class="informacion-equipo">

                    <span class="marca-equipo">

                        ${equipo.MARCA}

                    </span>


                    <h2>

                        ${equipo["MARCA Y MODELO"]}

                    </h2>


                    <div class="caracteristicas-destacadas">


                        <div class="caracteristica">

                            <span class="icono-caracteristica">

                                RAM

                            </span>

                            <strong>

                                ${equipo.RAM || "—"}

                            </strong>

                        </div>


                        <div class="caracteristica">

                            <span class="icono-caracteristica">

                                MEM

                            </span>

                            <strong>

                                ${
                                    equipo[
                                        "MEMORIA INTERNA"
                                    ] || "—"
                                }

                            </strong>

                        </div>


                        <div class="caracteristica">

                            <span class="icono-caracteristica">

                                BAT

                            </span>

                            <strong>

                                ${equipo.BATERIA || "—"}

                            </strong>

                        </div>


                        <div class="caracteristica">

                            <span class="icono-caracteristica">

                                PANT

                            </span>

                            <strong>

                                ${
                                    equipo[
                                        "TAMAÑO DE PANTALLA"
                                    ] || "—"
                                }

                            </strong>

                        </div>


                    </div>


                    <div class="procesador-equipo">

                        <span>

                            Procesador

                        </span>

                        <strong>

                            ${
                                equipo.PROCESADOR ||
                                "—"
                            }

                        </strong>

                    </div>


                    <div class="acciones-equipo">


                        <button
                            class="btn-ficha"
                            data-id="${equipo.ID_EQUIPO}"
                        >

                            📋 Ver ficha

                        </button>


                        <a
                            href="${
                                equipo["URL INFORMATE"]
                            }"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn-informacion"
                        >

                            🔎 INFORMATE

                        </a>


                        <label class="selector-comparar">


                            <input
                                type="checkbox"
                                class="check-comparar"
                                data-id="${equipo.ID_EQUIPO}"
                                ${
                                    equiposSeleccionados
                                        .includes(
                                            equipo.ID_EQUIPO
                                        )
                                        ? "checked"
                                        : ""
                                }
                            >


                            Comparar


                        </label>


                    </div>

                </div>

            `;


            listaEquipos.appendChild(
                tarjeta
            );

        }
    );


    document
        .querySelectorAll(
            ".check-comparar"
        )
        .forEach(
            checkbox => {

                checkbox.addEventListener(
                    "change",
                    manejarSeleccion
                );

            }
        );


    document
        .querySelectorAll(
            ".btn-ficha"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        abrirFicha(
                            boton.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================
   SELECCIÓN PARA COMPARAR
========================================= */

function manejarSeleccion(evento) {

    const checkbox =
        evento.target;


    const idEquipo =
        checkbox.dataset.id;


    if (
        checkbox.checked
    ) {

        if (
            equiposSeleccionados.length >= 3
        ) {

            checkbox.checked = false;


            alert(
                "Puedes seleccionar un máximo de 3 equipos para comparar."
            );


            return;

        }


        equiposSeleccionados.push(
            idEquipo
        );

    }

    else {

        equiposSeleccionados =
            equiposSeleccionados.filter(
                id =>
                    id !== idEquipo
            );

    }


    actualizarComparacion();

}


/* =========================================
   ACTUALIZAR COMPARACIÓN
========================================= */

function actualizarComparacion() {

    contadorComparacion.textContent =
        `${equiposSeleccionados.length}/3`;


    btnComparar.disabled =
        equiposSeleccionados.length < 2;

}


/* =========================================
   BOTÓN COMPARAR
========================================= */

btnComparar.addEventListener(
    "click",
    mostrarComparacion
);


/* =========================================
   MOSTRAR COMPARACIÓN
========================================= */

function mostrarComparacion() {

    const equiposParaComparar =
        equipos.filter(
            equipo =>
                equiposSeleccionados.includes(
                    equipo.ID_EQUIPO
                )
        );


    if (
        equiposParaComparar.length < 2
    ) {

        alert(
            "Selecciona al menos 2 equipos para comparar."
        );

        return;

    }


    vistaEquipos.style.display =
        "none";


    vistaComparacion.style.display =
        "block";


    let columnasEquipos = "";


    equiposParaComparar.forEach(
        equipo => {

            columnasEquipos += `

                <th>

                    <div class="imagen-comparacion">

                        ${generarImagenEquipo(
                            equipo,
                            "imagen-comparacion-real"
                        )}

                    </div>


                    <div
                        class="nombre-equipo-comparacion"
                    >

                        ${
                            equipo[
                                "MARCA Y MODELO"
                            ]
                        }

                    </div>


                    <a
                        href="${
                            equipo[
                                "URL INFORMATE"
                            ]
                        }"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn-informacion-comparacion"
                    >

                        Ver INFORMATE

                    </a>

                </th>

            `;

        }
    );


    function crearFila(
        nombre,
        campo
    ) {

        let valores = "";


        equiposParaComparar.forEach(
            equipo => {

                valores += `

                    <td>

                        ${
                            equipo[campo] ||
                            "—"
                        }

                    </td>

                `;

            }
        );


        return `

            <tr>

                <td>
                    ${nombre}
                </td>

                ${valores}

            </tr>

        `;

    }


    vistaComparacion.innerHTML = `

        <div class="encabezado-comparacion">

            <div>

                <h2>
                    Comparación de equipos
                </h2>

                <p>
                    ${
                        equiposParaComparar.length
                    }
                    equipos seleccionados
                </p>

            </div>


            <button
                class="btn-volver"
                id="btnVolver"
            >

                ← Volver a equipos

            </button>

        </div>


        <div class="tabla-comparacion-contenedor">

            <table class="tabla-comparacion">

                <thead>

                    <tr>

                        <th>
                            Equipos
                        </th>

                        ${columnasEquipos}

                    </tr>

                </thead>


                <tbody>

                    ${crearFila(
                        "Marca",
                        "MARCA"
                    )}

                    ${crearFila(
                        "Modelo",
                        "MARCA Y MODELO"
                    )}

                    ${crearFila(
                        "SKU",
                        "SKU"
                    )}

                    ${crearFila(
                        "Pantalla",
                        "TAMAÑO DE PANTALLA"
                    )}

                    ${crearFila(
                        "Cámara principal",
                        "CAMARA PRINCIPAL"
                    )}

                    ${crearFila(
                        "Cámara frontal",
                        "CAMARA FRONTAL"
                    )}

                    ${crearFila(
                        "RAM",
                        "RAM"
                    )}

                    ${crearFila(
                        "Batería",
                        "BATERIA"
                    )}

                    ${crearFila(
                        "Carga",
                        "CARGA"
                    )}

                    ${crearFila(
                        "Procesador",
                        "PROCESADOR"
                    )}

                    ${crearFila(
                        "Sistema operativo",
                        "SISTEMA OPERATIVO"
                    )}

                    ${crearFila(
                        "Memoria interna",
                        "MEMORIA INTERNA"
                    )}

                    ${crearFila(
                        "Memoria expandible",
                        "MEMORIA EXPANDIBLE"
                    )}

                    ${crearFila(
                        "Lector de huella",
                        "LECTOR HUELLA"
                    )}

                    ${crearFila(
                        "Doble chip",
                        "DOBLE CHIP"
                    )}

                    ${crearFila(
                        "Configuración Kit",
                        "CONFIGURACIÓN KIT"
                    )}

                </tbody>

            </table>

        </div>

    `;


    document
        .getElementById("btnVolver")
        .addEventListener(
            "click",
            volverEquipos
        );

}


/* =========================================
   VOLVER A EQUIPOS
========================================= */

function volverEquipos() {

    vistaComparacion.style.display =
        "none";


    vistaEquipos.style.display =
        "block";

}


/* =========================================
   OBTENER VALORES ÚNICOS
========================================= */

function obtenerValoresUnicos(
    lista,
    campo
) {

    return [
        ...new Set(

            lista
                .map(
                    equipo =>
                        (
                            equipo[campo] ||
                            ""
                        ).trim()
                )
                .filter(
                    valor =>
                        valor !== ""
                )

        )

    ].sort();

}


/* =========================================
   CREAR OPCIONES DE FILTROS
========================================= */

function crearFiltros() {


    /* MARCA */

    const marcas =
        obtenerValoresUnicos(
            equipos,
            "MARCA"
        );


    crearOpcionesCheckbox(
        opcionesMarca,
        marcas,
        "marca"
    );


    /* RAM */

    const ram =
        obtenerValoresUnicos(
            equipos,
            "RAM"
        );


    crearOpcionesCheckbox(
        opcionesRam,
        ram,
        "ram"
    );


    /* MEMORIA */

    const memorias =
        obtenerValoresUnicos(
            equipos,
            "MEMORIA INTERNA"
        );


    crearOpcionesCheckbox(
        opcionesMemoria,
        memorias,
        "memoria"
    );

}


/* =========================================
   CREAR CHECKBOXES
========================================= */

function crearOpcionesCheckbox(
    contenedor,
    valores,
    tipo
) {

    contenedor.innerHTML = "";


    valores.forEach(
        valor => {

            const etiqueta =
                document.createElement(
                    "label"
                );


            etiqueta.className =
                "opcion-filtro";


            etiqueta.innerHTML = `

                <input
                    type="checkbox"
                    class="checkbox-filtro"
                    data-tipo="${tipo}"
                    value="${valor}"
                >

                <span>
                    ${valor}
                </span>

            `;


            contenedor.appendChild(
                etiqueta
            );

        }
    );

}


/* =========================================
   OBTENER SELECCIONES
========================================= */

function obtenerSeleccionados(
    tipo
) {

    return Array.from(

        document.querySelectorAll(
            `.checkbox-filtro[data-tipo="${tipo}"]:checked`
        )

    ).map(
        checkbox =>
            checkbox.value
    );

}


/* =========================================
   ACTUALIZAR TEXTO DE FILTROS
========================================= */

function actualizarTextoFiltros() {

    const marcasSeleccionadas =
        obtenerSeleccionados("marca");


    const ramSeleccionada =
        obtenerSeleccionados("ram");


    const memoriasSeleccionadas =
        obtenerSeleccionados("memoria");


    if (
        marcasSeleccionadas.length === 0
    ) {

        textoFiltroMarca.textContent =
            "Todas las marcas";

    }

    else {

        textoFiltroMarca.textContent =
            `Marca (${marcasSeleccionadas.length})`;

    }


    if (
        ramSeleccionada.length === 0
    ) {

        textoFiltroRam.textContent =
            "Toda la RAM";

    }

    else {

        textoFiltroRam.textContent =
            `RAM (${ramSeleccionada.length})`;

    }


    if (
        memoriasSeleccionadas.length === 0
    ) {

        textoFiltroMemoria.textContent =
            "Toda la memoria";

    }

    else {

        textoFiltroMemoria.textContent =
            `Memoria (${memoriasSeleccionadas.length})`;

    }


    actualizarEstadoFiltro(
        contenedorFiltroMarca,
        marcasSeleccionadas.length
    );


    actualizarEstadoFiltro(
        contenedorFiltroRam,
        ramSeleccionada.length
    );


    actualizarEstadoFiltro(
        contenedorFiltroMemoria,
        memoriasSeleccionadas.length
    );

}


/* =========================================
   ESTADO VISUAL FILTRO
========================================= */

function actualizarEstadoFiltro(
    contenedor,
    cantidad
) {

    if (
        cantidad > 0
    ) {

        contenedor.classList.add(
            "activo"
        );

    }

    else {

        contenedor.classList.remove(
            "activo"
        );

    }

}


/* =========================================
   APLICAR FILTROS
========================================= */

function aplicarFiltros() {

    const texto =
        busqueda.value
            .trim()
            .toLowerCase();


    const marcasSeleccionadas =
        obtenerSeleccionados("marca");


    const ramSeleccionada =
        obtenerSeleccionados("ram");


    const memoriasSeleccionadas =
        obtenerSeleccionados("memoria");


    const resultados =
        equipos.filter(
            equipo => {


                const marca =
                    (
                        equipo.MARCA ||
                        ""
                    ).toLowerCase();


                const modelo =
                    (
                        equipo[
                            "MARCA Y MODELO"
                        ] ||
                        ""
                    ).toLowerCase();


                const coincideBusqueda =

                    texto === "" ||

                    marca.includes(
                        texto
                    ) ||

                    modelo.includes(
                        texto
                    );


                const coincideMarca =

                    marcasSeleccionadas.length === 0 ||

                    marcasSeleccionadas.includes(
                        equipo.MARCA
                    );


                const coincideRam =

                    ramSeleccionada.length === 0 ||

                    ramSeleccionada.includes(
                        equipo.RAM
                    );


                const coincideMemoria =

                    memoriasSeleccionadas.length === 0 ||

                    memoriasSeleccionadas.includes(
                        equipo[
                            "MEMORIA INTERNA"
                        ]
                    );


                return (

                    coincideBusqueda &&

                    coincideMarca &&

                    coincideRam &&

                    coincideMemoria

                );

            }
        );


    mostrarEquipos(
        resultados
    );


    actualizarTextoFiltros();

}


/* =========================================
   EVENTO BUSCADOR
========================================= */

busqueda.addEventListener(
    "input",
    aplicarFiltros
);


/* =========================================
   ABRIR / CERRAR FILTROS
========================================= */

function configurarDropdown(
    boton,
    menu,
    contenedor
) {

    boton.addEventListener(
        "click",
        evento => {

            evento.stopPropagation();


            const menus = [

                {
                    menu:
                        menuFiltroMarca,

                    contenedor:
                        contenedorFiltroMarca

                },

                {
                    menu:
                        menuFiltroRam,

                    contenedor:
                        contenedorFiltroRam

                },

                {
                    menu:
                        menuFiltroMemoria,

                    contenedor:
                        contenedorFiltroMemoria

                }

            ];


            menus.forEach(
                elemento => {

                    if (
                        elemento.menu !== menu
                    ) {

                        elemento.menu.classList.remove(
                            "mostrar"
                        );

                    }

                }
            );


            menu.classList.toggle(
                "mostrar"
            );

        }
    );

}


configurarDropdown(
    btnFiltroMarca,
    menuFiltroMarca,
    contenedorFiltroMarca
);


configurarDropdown(
    btnFiltroRam,
    menuFiltroRam,
    contenedorFiltroRam
);


configurarDropdown(
    btnFiltroMemoria,
    menuFiltroMemoria,
    contenedorFiltroMemoria
);


/* =========================================
   CERRAR MENÚ AL HACER CLIC AFUERA
========================================= */

document.addEventListener(
    "click",
    evento => {

        const filtrosMultiples =
            document.querySelectorAll(
                ".filtro-multiple"
            );


        filtrosMultiples.forEach(
            filtro => {

                if (
                    !filtro.contains(
                        evento.target
                    )
                ) {

                    filtro
                        .querySelector(
                            ".menu-filtro-multiple"
                        )
                        .classList.remove(
                            "mostrar"
                        );

                }

            }
        );

    }
);


/* =========================================
   CAMBIO EN CHECKBOXES
========================================= */

document.addEventListener(
    "change",
    evento => {

        if (
            evento.target.classList.contains(
                "checkbox-filtro"
            )
        ) {

            aplicarFiltros();

        }

    }
);


/* =========================================
   BOTONES TODO / NADA
========================================= */

document
    .querySelectorAll(
        ".btn-seleccionar-todo"
    )
    .forEach(
        boton => {

            boton.addEventListener(
                "click",
                evento => {

                    evento.stopPropagation();


                    const tipo =
                        boton.dataset.filtro;


                    document
                        .querySelectorAll(
                            `.checkbox-filtro[data-tipo="${tipo}"]`
                        )
                        .forEach(
                            checkbox => {

                                checkbox.checked =
                                    true;

                            }
                        );


                    aplicarFiltros();

                }
            );

        }
    );


document
    .querySelectorAll(
        ".btn-limpiar-seleccion"
    )
    .forEach(
        boton => {

            boton.addEventListener(
                "click",
                evento => {

                    evento.stopPropagation();


                    const tipo =
                        boton.dataset.filtro;


                    document
                        .querySelectorAll(
                            `.checkbox-filtro[data-tipo="${tipo}"]`
                        )
                        .forEach(
                            checkbox => {

                                checkbox.checked =
                                    false;

                            }
                        );


                    aplicarFiltros();

                }
            );

        }
    );


/* =========================================
   LIMPIAR TODOS LOS FILTROS
========================================= */

btnLimpiarFiltros.addEventListener(
    "click",
    () => {

        busqueda.value = "";


        document
            .querySelectorAll(
                ".checkbox-filtro"
            )
            .forEach(
                checkbox => {

                    checkbox.checked =
                        false;

                }
            );


        textoFiltroMarca.textContent =
            "Todas las marcas";


        textoFiltroRam.textContent =
            "Toda la RAM";


        textoFiltroMemoria.textContent =
            "Toda la memoria";


        contenedorFiltroMarca
            .classList.remove(
                "activo"
            );


        contenedorFiltroRam
            .classList.remove(
                "activo"
            );


        contenedorFiltroMemoria
            .classList.remove(
                "activo"
            );


        mostrarEquipos(
            equipos
        );

    }
);


/* =========================================
   ABRIR FICHA
========================================= */

function abrirFicha(
    idEquipo
) {

    const equipo =
        equipos.find(
            item =>
                item.ID_EQUIPO ===
                idEquipo
        );


    if (!equipo) return;


    modalTitulo.textContent =
        equipo[
            "MARCA Y MODELO"
        ];


    modalInformate.href =
        equipo[
            "URL INFORMATE"
        ];


    /* =====================================
       INSERTAR IMAGEN EN LA FICHA
    ===================================== */

    let contenedorImagen =
        document.getElementById(
            "imagenFicha"
        );


    if (!contenedorImagen) {

        contenedorImagen =
            document.createElement(
                "div"
            );


        contenedorImagen.id =
            "imagenFicha";


        contenedorImagen.className =
            "imagen-ficha";


        const modalContenido =
            modalEquipo.querySelector(
                ".modal-contenido"
            );


        const modalHeader =
            modalContenido.querySelector(
                ".modal-header"
            );


        modalContenido.insertBefore(
            contenedorImagen,
            modalHeader
        );

    }


    contenedorImagen.innerHTML =
        generarImagenEquipo(
            equipo,
            "imagen-ficha-real"
        );


    const campos = [

        [
            "Marca",
            "MARCA"
        ],

        [
            "Modelo",
            "MARCA Y MODELO"
        ],

        [
            "SKU",
            "SKU"
        ],

        [
            "Pantalla",
            "TAMAÑO DE PANTALLA"
        ],

        [
            "Cámara principal",
            "CAMARA PRINCIPAL"
        ],

        [
            "Cámara frontal",
            "CAMARA FRONTAL"
        ],

        [
            "RAM",
            "RAM"
        ],

        [
            "Batería",
            "BATERIA"
        ],

        [
            "Carga",
            "CARGA"
        ],

        [
            "Procesador",
            "PROCESADOR"
        ],

        [
            "Sistema operativo",
            "SISTEMA OPERATIVO"
        ],

        [
            "Memoria interna",
            "MEMORIA INTERNA"
        ],

        [
            "Memoria expandible",
            "MEMORIA EXPANDIBLE"
        ],

        [
            "Lector de huella",
            "LECTOR HUELLA"
        ],

        [
            "Doble chip",
            "DOBLE CHIP"
        ],

        [
            "Configuración Kit",
            "CONFIGURACIÓN KIT"
        ]

    ];


    modalDetalles.innerHTML = "";


    campos.forEach(
        campo => {

            const nombre =
                campo[0];


            const clave =
                campo[1];


            const valor =
                equipo[clave] ||
                "No especificado";


            const detalle =
                document.createElement(
                    "div"
                );


            detalle.classList.add(
                "detalle-item"
            );


            detalle.innerHTML = `

                <span
                    class="detalle-nombre"
                >

                    ${nombre}

                </span>


                <span
                    class="detalle-valor"
                >

                    ${valor}

                </span>

            `;


            modalDetalles.appendChild(
                detalle
            );

        }
    );


    modalEquipo.classList.add(
        "activo"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   CERRAR MODAL
========================================= */

function cerrarModal() {

    modalEquipo.classList.remove(
        "activo"
    );


    document.body.style.overflow =
        "";

}


btnCerrarModal.addEventListener(
    "click",
    cerrarModal
);


btnCerrarModalInferior.addEventListener(
    "click",
    cerrarModal
);


modalEquipo.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            modalEquipo
        ) {

            cerrarModal();

        }

    }
);


/* =========================================
   ESCAPE PARA CERRAR MODAL
========================================= */

document.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key === "Escape"
        ) {

            cerrarModal();

        }

    }
);
