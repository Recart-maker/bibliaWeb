const JSON_FILE_NAME = 'libros_biblia.json';
const INFO_FILE_NAME = 'resumen_libros.json'; // Nombre del archivo para la información de los libros
let LIBROS_BIBLIA = [];
let BIBLIA_DATA = {};
let INFO_LIBROS = {}; // Objeto para la información detallada de los libros

// Referencias a los elementos del DOM
const libroCombo = document.getElementById('libro-combo');
const capituloEntry = document.getElementById('capitulo-entry');
const versiculoEntry = document.getElementById('versiculo-entry');
const buscarBtn = document.getElementById('buscar-btn');
const resultadoArea = document.getElementById('resultado-area');
const statusBar = document.getElementById('status-bar');

// Elementos para mostrar la información de capítulos y versículos
const capitulosInfo = document.getElementById('capitulos-info');
const versiculosInfo = document.getElementById('versiculos-info');

// Elementos para la navegación de capítulos
const prevCapituloBtn = document.getElementById('prev-capitulo-btn');
const nextCapituloBtn = document.getElementById('next-capitulo-btn');

// Elementos para la información del libro
const infoLibroArea = document.getElementById('info-libro-area');
const infoLibroTitulo = document.getElementById('info-libro-titulo');
const infoLibroAutor = document.getElementById('info-libro-autor');
const infoLibroTema = document.getElementById('info-libro-tema');
const infoLibroContexto = document.getElementById('info-libro-contexto');

// Elementos para la búsqueda de texto
const searchTextEntry = document.getElementById('search-text-entry');
const searchTextBtn = document.getElementById('search-text-btn');

// Elemento para el botón de compartir
const shareBtn = document.getElementById('share-btn');


// --- Funciones de Utilidad ---

// Muestra contenido en el área de resultados, reemplazando o añadiendo.
function displayResult(htmlContent, append = false) {
    if (!append) {
        resultadoArea.innerHTML = '';
    }
    resultadoArea.innerHTML += htmlContent;
}

// Actualiza el mensaje en la barra de estado.
function setStatus(message) {
    statusBar.textContent = message;
}

// --- Funciones de Información de Capítulos/Versículos ---

// Actualiza y muestra el número total de capítulos para el libro seleccionado.
function updateCapitulosInfo() {
    const libroNombreEspanol = libroCombo.value;
    if (libroNombreEspanol && BIBLIA_DATA[libroNombreEspanol]) {
        const numCapitulos = Object.keys(BIBLIA_DATA[libroNombreEspanol]).length;
        capitulosInfo.textContent = `Total de capítulos: ${numCapitulos}`;
    } else {
        capitulosInfo.textContent = ''; // Limpiar si no hay libro seleccionado o datos
    }
    // También actualiza la info de versículos y la info general del libro al cambiar el libro.
    updateVersiculosInfo(); 
    displayBookInfo(); 
}

// Actualiza y muestra el número total de versículos para el capítulo actual.
function updateVersiculosInfo() {
    const libroNombreEspanol = libroCombo.value;
    const capituloStr = capituloEntry.value;

    if (libroNombreEspanol && capituloStr && BIBLIA_DATA[libroNombreEspanol]) {
        const capitulo = String(parseInt(capituloStr)); // Asegura que sea un número y luego un string
        if (!isNaN(capitulo) && BIBLIA_DATA[libroNombreEspanol][capitulo]) {
            const numVersiculos = Object.keys(BIBLIA_DATA[libroNombreEspanol][capitulo]).length;
            versiculosInfo.textContent = `Total de versículos en el capítulo ${capitulo}: ${numVersiculos}`;
        } else {
            versiculosInfo.textContent = 'Capítulo no válido o no encontrado.';
        }
    } else {
        versiculosInfo.textContent = ''; // Limpiar si no hay libro/capítulo seleccionado
    }
}

// --- Funciones de Navegación de Capítulos ---

// Navega al capítulo anterior o siguiente, o cambia de libro si es necesario.
function navigateCapitulo(direction) {
    let currentLibroIndex = LIBROS_BIBLIA.indexOf(libroCombo.value);
    let currentCapitulo = parseInt(capituloEntry.value);

    // Si el capítulo no es un número válido, intenta usar el primer capítulo del libro actual.
    if (isNaN(currentCapitulo)) {
        const libroData = BIBLIA_DATA[libroCombo.value];
        if (libroData) {
            const capitulosDelLibro = Object.keys(libroData).map(Number).sort((a,b)=>a-b);
            currentCapitulo = capitulosDelLibro[0];
            capituloEntry.value = currentCapitulo; // Actualiza el campo de entrada
        } else {
            setStatus('Seleccione un libro válido.');
            return;
        }
    }

    let nextCapitulo = currentCapitulo + direction;
    let libroData = BIBLIA_DATA[libroCombo.value];

    if (libroData) {
        let capitulosDelLibro = Object.keys(libroData).map(Number).sort((a,b)=>a-b);
        let minCapitulo = capitulosDelLibro[0];
        let maxCapitulo = capitulosDelLibro[capitulosDelLibro.length - 1];

        if (nextCapitulo >= minCapitulo && nextCapitulo <= maxCapitulo) {
            // Si el siguiente capítulo está dentro del libro actual
            capituloEntry.value = nextCapitulo;
            versiculoEntry.value = '1'; // Reinicia el versículo a 1 al cambiar de capítulo
            buscarVersiculo();
        } else {
            // Si el capítulo se sale de rango, intentar cambiar de libro
            let nextLibroIndex = currentLibroIndex;
            if (direction === 1 && currentLibroIndex < LIBROS_BIBLIA.length - 1) {
                nextLibroIndex++;
            } else if (direction === -1 && currentLibroIndex > 0) {
                nextLibroIndex--;
            }

            if (nextLibroIndex !== currentLibroIndex) {
                // Si se cambió de libro con éxito
                libroCombo.value = LIBROS_BIBLIA[nextLibroIndex];
                libroData = BIBLIA_DATA[LIBROS_BIBLIA[nextLibroIndex]];
                capitulosDelLibro = Object.keys(libroData).map(Number).sort((a,b)=>a-b);

                if (direction === 1) { // Si avanzamos de libro, ir al primer capítulo del siguiente libro
                    capituloEntry.value = capitulosDelLibro[0];
                } else { // Si retrocedemos de libro, ir al último capítulo del anterior libro
                    capituloEntry.value = capitulosDelLibro[capitulosDelLibro.length - 1];
                }
                versiculoEntry.value = '1'; // Reinicia el versículo a 1
                buscarVersiculo();
            } else {
                // Si no hay más libros para avanzar/retroceder
                setStatus('Ya estás en el primer/último capítulo del primer/último libro.');
            }
        }
    }
}

// --- Función para mostrar la información del libro ---

// Muestra la información detallada del libro seleccionado.
function displayBookInfo() {
    const libroNombreEspanol = libroCombo.value;
    const info = INFO_LIBROS[libroNombreEspanol];

    if (info) {
        infoLibroTitulo.textContent = libroNombreEspanol;
        infoLibroAutor.textContent = info.autor || 'N/A';
        infoLibroTema.textContent = info.tema_principal || 'N/A';
        infoLibroContexto.textContent = info.contexto || 'N/A';
        infoLibroArea.style.display = 'block'; // Hace visible el área de información
    } else {
        infoLibroArea.style.display = 'none'; // Oculta el área si no hay información disponible
    }
}

// --- Función de Búsqueda de Texto (AVANZADA) ---

// Realiza una búsqueda de texto en todos los versículos de la Biblia.
function buscarTexto() {
    let searchText = searchTextEntry.value.trim();
    if (searchText.length < 3 && !searchText.includes('"')) { // Requiere un mínimo de 3 caracteres, a menos que sea una frase exacta
        displayResult('<span class="error-text">Error: Ingrese al menos 3 caracteres para la búsqueda de texto, o use comillas para buscar una frase exacta.</span>', false);
        setStatus('Error: Búsqueda de texto muy corta.');
        return;
    }

    setStatus(`Buscando "${searchText}" en toda la Biblia...`);
    displayResult('<h2>Resultados de Búsqueda de Texto:</h2>', false); // Limpia y añade un título a los resultados

    let coincidencias = 0;
    let includeTerms = [];
    let excludeTerms = [];
    let exactPhrase = null;

    // 1. Extraer frase exacta (entre comillas)
    const exactMatch = searchText.match(/"([^"]*)"/);
    if (exactMatch) {
        exactPhrase = exactMatch[1];
        searchText = searchText.replace(exactMatch[0], '').trim(); // Eliminar la frase exacta de la búsqueda
    }

    // 2. Separar términos a incluir y excluir
    const terms = searchText.split(/\s+/); // Divide por espacios en blanco
    terms.forEach(term => {
        if (term.startsWith('-')) {
            excludeTerms.push(term.substring(1).toLowerCase()); // Eliminar el '-' y convertir a minúsculas
        } else if (term.length > 0) {
            includeTerms.push(term.toLowerCase()); // Convertir a minúsculas
        }
    });

    // Construir la expresión regular para los términos a incluir
    let includeRegex = null;
    if (includeTerms.length > 0) {
        // Usa \b para coincidencia de palabra completa si no es una frase exacta
        const pattern = includeTerms.map(term => exactPhrase ? term : `\\b${term}\\b`).join('|');
        includeRegex = new RegExp(pattern, 'gi');
    }

    // Construir la expresión regular para la frase exacta
    let exactPhraseRegex = null;
    if (exactPhrase) {
        exactPhraseRegex = new RegExp(exactPhrase, 'gi');
    }

    // Construir la expresión regular para los términos a excluir
    let excludeRegex = null;
    if (excludeTerms.length > 0) {
        const pattern = excludeTerms.map(term => `\\b${term}\\b`).join('|');
        excludeRegex = new RegExp(pattern, 'gi');
    }

    // Itera sobre todos los libros y capítulos para encontrar coincidencias
    for (const libroNombre of LIBROS_BIBLIA) { 
        const libroData = BIBLIA_DATA[libroNombre];
        if (libroData) {
            const capitulosOrdenados = Object.keys(libroData).map(Number).sort((a,b)=>a-b);
            for (const capituloNum of capitulosOrdenados) {
                const capituloData = libroData[String(capituloNum)]; 
                if (capituloData) {
                    const versiculosOrdenados = Object.keys(capituloData).map(Number).sort((a,b)=>a-b);
                    for (const versiculoNum of versiculosOrdenados) {
                        const textoVersiculo = capituloData[String(versiculoNum)]; 
                        const lowerCaseVerse = textoVersiculo.toLowerCase();

                        let matches = true;

                        // Verificar frase exacta
                        if (exactPhraseRegex && !exactPhraseRegex.test(textoVersiculo)) {
                            matches = false;
                        }

                        // Verificar términos a incluir
                        if (matches && includeRegex) {
                            // Para cada término a incluir, debe estar presente
                            for (const term of includeTerms) {
                                if (!lowerCaseVerse.includes(term)) { // Simple includes para palabras
                                    matches = false;
                                    break;
                                }
                            }
                        }

                        // Verificar términos a excluir
                        if (matches && excludeRegex && excludeRegex.test(lowerCaseVerse)) {
                            matches = false;
                        }

                        if (matches) {
                            coincidencias++;
                            // Resalta el texto encontrado en los resultados
                            let highlightedText = textoVersiculo;
                            if (exactPhraseRegex) {
                                highlightedText = highlightedText.replace(exactPhraseRegex, (match) => `<span class="highlight">${match}</span>`);
                            }
                            // Resaltar términos individuales si no son parte de la frase exacta y están incluidos
                            if (includeRegex) {
                                highlightedText = highlightedText.replace(includeRegex, (match) => {
                                    // Evitar doble resaltado si ya fue resaltado por la frase exacta
                                    if (match.includes('<span class="highlight">')) {
                                        return match;
                                    }
                                    return `<span class="highlight">${match}</span>`;
                                });
                            }
                            
                            displayResult(
                                `<span class="verse-reference">${libroNombre} ${capituloNum}:${versiculoNum}</span><br>` +
                                `<span class="verse-text">${highlightedText}</span><br><br>`,
                                true // Añade el resultado al contenido existente
                            );
                        }
                    }
                }
            }
        }
    }

    if (coincidencias === 0) {
        displayResult('<span class="error-text">No se encontraron coincidencias para su búsqueda.</span>', true);
        setStatus(`Búsqueda terminada: No se encontraron resultados para "${searchText}".`);
    } else {
        setStatus(`Búsqueda terminada: Se encontraron ${coincidencias} coincidencias para "${searchText}".`);
        resultadoArea.scrollTop = 0; // Desplaza el scroll al inicio para ver el título
    }
}


// --- Cargar datos desde los archivos JSON ---

// Carga los datos de la Biblia y la información de los libros al inicio.
async function loadBibleData() {
    try {
        // Cargar datos de la Biblia principal (versículos)
        const responseBiblia = await fetch(JSON_FILE_NAME);
        if (!responseBiblia.ok) {
            throw new Error(`No se encontró el archivo '${JSON_FILE_NAME}'. Asegúrate de que esté en el mismo directorio.`);
        }
        const dataBiblia = await responseBiblia.json();
        LIBROS_BIBLIA = dataBiblia.libros_biblia_espanol || [];
        BIBLIA_DATA = dataBiblia.biblia_data || {};

        // Cargar el archivo de resumen de libros por separado (información del libro)
        const responseInfo = await fetch(INFO_FILE_NAME);
        if (!responseInfo.ok) {
            // Si el archivo de información no se encuentra, se advierte pero no se detiene la aplicación.
            console.warn(`Advertencia: No se encontró el archivo '${INFO_FILE_NAME}'. La información del libro no estará disponible.`);
            INFO_LIBROS = {}; // Asegura que INFO_LIBROS esté vacío si el archivo no se encuentra
        } else {
            INFO_LIBROS = await responseInfo.json(); // Cargar la información de los libros
        }
        
        // Rellenar el combobox de libros
        libroCombo.innerHTML = ''; 
        LIBROS_BIBLIA.forEach(libro => {
            const option = document.createElement('option');
            option.value = libro;
            option.textContent = libro;
            libroCombo.appendChild(option);
        });

        if (LIBROS_BIBLIA.length > 0) {
            libroCombo.value = LIBROS_BIBLIA[0]; // Selecciona el primer libro por defecto
            updateCapitulosInfo(); // Muestra la info de capítulos y versículos al inicio
            displayBookInfo(); // Muestra la info del primer libro
        }
        setStatus('Datos de la Biblia cargados exitosamente. Seleccione un pasaje y presione Buscar.');

    } catch (error) {
        displayResult(`<span class="error-text">Error de Carga: ${error.message}</span>`, false);
        setStatus(`Error al cargar datos: ${error.message}`);
        console.error("Error al cargar datos JSON:", error);
    }
}

// --- Función principal para buscar versículos (pasaje específico) ---

// Busca y muestra uno o varios versículos específicos.
function buscarVersiculo() {
    const libroNombreEspanol = libroCombo.value;
    const capituloStr = capituloEntry.value;
    const versiculoInput = versiculoEntry.value;

    if (!libroNombreEspanol || !capituloStr || !versiculoInput) {
        displayResult('<span class="error-text">Error: Todos los campos (Libro, Capítulo, Versículo/Rango) son obligatorios.</span>', false);
        setStatus('Error: Campos obligatorios.');
        return;
    }

    const capitulo = String(parseInt(capituloStr)); // Convierte el capítulo a número y luego a string
    if (isNaN(capitulo)) {
        displayResult('<span class="error-text">Error: El capítulo debe ser un número válido.</span>', false);
        setStatus('Error: Capítulo inválido.');
        return;
    }

    let versiculosABuscar = [];
    if (versiculoInput.includes('-')) { // Maneja rangos de versículos (ej. 1-5)
        const partes = versiculoInput.split('-');
        if (partes.length === 2) {
            try {
                const inicio = parseInt(partes[0].trim());
                const fin = parseInt(partes[1].trim());
                if (isNaN(inicio) || isNaN(fin) || inicio > fin) {
                    throw new Error("Rango de versículos inválido.");
                }
                for (let i = inicio; i <= fin; i++) {
                    versiculosABuscar.push(String(i));
                }
            } catch (e) {
                displayResult(`<span class="error-text">Error: El rango de versículos debe contener números válidos (ej. '1-4').</span>`, false);
                setStatus('Error: Rango de versículos inválido.');
                return;
            }
        } else {
            displayResult('<span class="error-text">Error: Formato de rango de versículos inválido (ej. \'1-4\').</span>', false);
            setStatus('Error: Formato de rango inválido.');
            return;
        }
    } else { // Maneja un solo versículo
        try {
            const singleVerse = String(parseInt(versiculoInput.trim()));
            if (isNaN(singleVerse)) {
                throw new Error("Versículo inválido.");
            }
            versiculosABuscar.push(singleVerse);
        } catch (e) {
            displayResult('<span class="error-text">Error: El versículo debe ser un número válido.</span>', false);
            setStatus('Error: Versículo inválido.');
            return;
        }
    }

    const referenciaUsuarioBase = `${libroNombreEspanol} ${capitulo}`;
    setStatus(`Buscando ${referenciaUsuarioBase}:${versiculoInput} en datos locales...`);
    
    let htmlResultado = `<span class="verse-reference">Referencia: ${referenciaUsuarioBase}:${versiculoInput}</span><br><br>`;
    let versiculosEncontradosCount = 0;

    const libroData = BIBLIA_DATA[libroNombreEspanol];
    if (!libroData) {
        displayResult(`<span class="error-text">Libro '${libroNombreEspanol}' no encontrado en los datos locales.</span>`, false);
        setStatus('Error: Libro no encontrado localmente.');
        return;
    }

    const capituloData = libroData[capitulo];
    if (!capituloData) {
        displayResult(`<span class="error-text">Capítulo '${capitulo}' no encontrado en ${libroNombreEspanol} en los datos locales.</span>`, false);
        setStatus('Error: Capítulo no encontrado localmente.');
        return;
    }

    for (const vNumStr of versiculosABuscar) {
        const textoVersiculo = capituloData[vNumStr];
        if (textoVersiculo) {
            htmlResultado += `<span class="verse-number">${vNumStr}. </span><span class="verse-text">${textoVersiculo}</span><br><br>`;
            versiculosEncontradosCount++;
        } else {
            htmlResultado += `<span class="error-text">Versículo '${vNumStr}' no encontrado en los datos locales.</span><br><br>`;
        }
    }

    displayResult(htmlResultado, false);

    if (versiculosEncontradosCount > 0) {
        setStatus(`Mostrando: ${referenciaUsuarioBase}:${versiculoInput}`);
    } else {
        setStatus('Error: No se encontraron versículos en el rango especificado.');
    }
}

// --- Función para Compartir Pasaje ---

async function sharePassage() {
    const currentContent = resultadoArea.innerText.trim(); // Obtiene el texto plano del área de resultados

    if (!currentContent || currentContent === 'Cargando datos...') {
        setStatus('No hay contenido para compartir. Realice una búsqueda primero.');
        return;
    }

    // Intenta limpiar el contenido para el portapapeles, eliminando mensajes de error, etc.
    let textToShare = currentContent;
    textToShare = textToShare.replace(/Referencia: /g, ''); // Elimina la etiqueta "Referencia: "
    textToShare = textToShare.replace(/Total de capítulos: \d+/g, ''); // Elimina info de capítulos
    textToShare = textToShare.replace(/Total de versículos en el capítulo \d+: \d+/g, ''); // Elimina info de versículos
    textToShare = textToShare.replace(/Error: .*?\./g, '').trim(); // Elimina mensajes de error
    textToShare = textToShare.replace(/No se encontraron coincidencias para su búsqueda./g, '').trim(); // Elimina mensaje de no coincidencias

    // Formatea el texto para que se vea "neón" en un entorno de texto plano
    // Esto es un intento de simular el estilo con caracteres, pero no es CSS real.
    const formattedText = `
✨📖 ${textToShare} 📖✨

---
Buscado con el Buscador Bíblico Neón
`;

    try {
        await navigator.clipboard.writeText(formattedText);
        setStatus('Versículo copiado al portapapeles con formato neón (texto plano).');
    } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
        setStatus('Error al copiar el versículo. Por favor, copie manualmente.');
    }
}


// --- Event Listeners (Activadores de las funciones) ---

buscarBtn.addEventListener('click', buscarVersiculo);
libroCombo.addEventListener('change', updateCapitulosInfo); // Al cambiar el libro, actualiza info de capítulos y versículos
capituloEntry.addEventListener('input', updateVersiculosInfo); // Al escribir en el capítulo, actualiza info de versículos

// Event Listeners para navegación de capítulos
prevCapituloBtn.addEventListener('click', () => navigateCapitulo(-1)); // Retroceder capítulo
nextCapituloBtn.addEventListener('click', () => navigateCapitulo(1)); // Avanzar capítulo

// Event Listeners para búsqueda de texto
searchTextBtn.addEventListener('click', buscarTexto);
// Permite buscar presionando Enter en el campo de texto
searchTextEntry.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        buscarTexto();
    }
});

// Event Listener para el botón de compartir
shareBtn.addEventListener('click', sharePassage);

// Cargar datos al iniciar la página
loadBibleData();