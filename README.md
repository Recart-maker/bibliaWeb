Aplicación Interactiva de la Biblia (Visor Local)
Esta es una aplicación web de una sola página (SPA) diseñada para explorar versículos de la Biblia utilizando datos almacenados localmente en un archivo JSON. Cuenta con un diseño de estilo "neón" para una experiencia de usuario moderna y atractiva.

Características
Búsqueda de Versículos: Permite buscar versículos específicos por libro, capítulo y número de versículo.

Búsqueda por Rango: Soporta la búsqueda de rangos de versículos (ej., "1-4").

Datos Locales: La aplicación carga los datos de la Biblia desde un archivo JSON local, eliminando la necesidad de una conexión a internet o claves API para la lectura.

Diseño Neón: Interfaz de usuario con un tema oscuro y colores vibrantes de neón para una estética distintiva.

Totalmente Responsivo: Adaptado para funcionar en diferentes tamaños de pantalla, desde dispositivos móviles hasta computadoras de escritorio.

Archivos del Proyecto
index.html: El archivo principal de la aplicación que define la estructura HTML y enlaza los estilos y el script JavaScript.

style.css: Contiene todas las reglas de estilo CSS personalizadas para el tema "neón" de la aplicación.

app.js: Contiene toda la lógica JavaScript que maneja la carga de datos, la interacción del usuario y la visualización de los versículos.

libros_biblia.json: (Requerido) Este archivo debe contener todos los datos de la Biblia (libros, capítulos y versículos) en un formato JSON específico.

Estructura de libros_biblia.json
Para que la aplicación funcione correctamente, el archivo libros_biblia.json debe tener la siguiente estructura:

{
    "libros_biblia_espanol": [
        "Génesis",
        "Éxodo",
        // ... (otros nombres de libros en español que quieras en el selector)
    ],
    "biblia_data": {
        "Génesis": {
            "1": {
                "1": "En el principio creó Dios los cielos y la tierra.",
                "2": "Y la tierra estaba desordenada y vacía...",
                "3": "Y dijo Dios: Sea la luz; y fue la luz."
            },
            "2": {
                "1": "Fueron, pues, acabados los cielos y la tierra...",
                // ... (más versículos para el capítulo 2 de Génesis)
            }
        },
        "Éxodo": {
            "1": {
                "1": "Estos son los nombres de los hijos de Israel...",
                // ... (versículos de Éxodo)
            }
        }
        // ... (más libros, capítulos y versículos para toda la Biblia que desees incluir)
    }
}

Es fundamental que la estructura biblia_data contenga los versículos que deseas que la aplicación muestre. Si un pasaje no se encuentra en este archivo JSON, la aplicación lo indicará como "no encontrado".

Puedes generar este archivo libros_biblia.json a partir de tus archivos JavaScript existentes utilizando el script convertidor_biblia.py que se proporcionó anteriormente.

Cómo Ejecutar la Aplicación
Descarga/Guarda los Archivos: Asegúrate de que los siguientes archivos estén en la misma carpeta en tu sistema:

index.html

style.css

app.js

libros_biblia.json (con tus datos de la Biblia)

Abre index.html: Simplemente haz doble clic en el archivo index.html o arrástralo y suéltalo en la ventana de cualquier navegador web moderno (Chrome, Firefox, Edge, Safari, etc.).

La aplicación se cargará en tu navegador, y podrás comenzar a explorar los versículos de la Biblia utilizando los controles proporcionados.

Personalización
Datos de la Biblia: Edita el archivo libros_biblia.json para añadir o modificar el contenido de la Biblia.

Estilo Visual: Modifica el archivo style.css para ajustar los colores, fuentes o el diseño general de la aplicación.

Funcionalidad: El archivo app.js contiene toda la lógica. Puedes modificarlo para añadir nuevas características o cambiar el comportamiento de la aplicación.