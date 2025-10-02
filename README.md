# PokemonApp
Pokédex Web

Este proyecto es una Pokédex interactiva construida con HTML, CSS y JavaScript, consumiendo la PokéAPI

Cómo ejecutar el proyecto
1. Clonar o descargar este repositorio.
2. Abrir el archivo index.html en un navegador.
3. Asegurarse de tener conexión a Internet (la app consume la API en línea de PokéAPI).

Funcionalidades principales
-Buscador: buscar Pokémon por nombre o ID.

-Ficha de Pokémon: muestra nombre, número, tipos, altura, peso, habilidades e imagen oficial.

-Últimas búsquedas: guarda hasta 10, clicables para volver a abrir la ficha.

-Favoritos: se pueden guardar hasta 50 Pokémon, también clicables.

-Listado con paginación: muestra todos los Pokémon (24 por página) con controles de navegación.

-Tema claro/oscuro: botón para cambiar el tema visual de la aplicación.

-Manejo de errores: mensajes claros cuando la búsqueda falla o el input está vacío.

-Responsive: diseño adaptado para móviles.

Decisiones tomadas

1. Vanilla JS: se decidió no usar frameworks (React, Vue, etc.) para cumplir con el requisito de trabajar solo con index.html, styles.css y app.js.
2. LocalStorage: para guardar búsquedas recientes y favoritos, garantizando persistencia aunque se recargue la página.
3. PokéAPI: se eligió por ser una API pública, simple y muy usada en proyectos de prueba.
4. Diseño responsive con CSS Grid/Flexbox: las tarjetas se adaptan al ancho de pantalla y el sidebar pasa abajo en móviles.
5. Modo oscuro: implementado con un data-theme en el <body> y variables CSS, para mantener la hoja de estilos más limpia.
6. Errores: si no se ingresa nada en el buscador o el Pokémon no existe, se muestra un mensaje en lugar de romper la app.
