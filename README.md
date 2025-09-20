
# Visor Energético de Colombia

Este repositorio contiene un visor web desarrollado con [Leaflet](https://leafletjs.com/) para explorar capas geoespaciales relacionadas con la infraestructura energética y condicionantes socioambientales de Colombia.

## Características principales

- **Subestaciones** y **red eléctrica** consultadas en tiempo real desde OpenStreetMap mediante la API de Overpass.
- Capas locales configurables para representar:
  - Máscara de pendiente de suelo.
  - Áreas protegidas ambientales.
  - Áreas sensibles por conflictos sociales.
- Compatibilidad con servicios WMS adicionales.
- Control de capas y ventana de estado para conocer el resultado de cada carga.
- Diseño adaptable que funciona tanto en escritorio como en dispositivos móviles.



## Estructura del proyecto

```
.
├── assets
│   ├── css
│   │   └── style.css
│   └── js
│       └── app.js
├── data
│   ├── areas_protegidas.geojson
│   ├── conflictos_sociales.geojson
│   └── pendiente_suelo.geojson
└── index.html
```



## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` si decides añadir uno al repositorio. Los datos de OpenStreetMap se encuentran bajo la licencia [ODbL](https://opendatacommons.org/licenses/odbl/).
=======
