// assets/js/app.js
(function () {
  // --------- CONFIG ---------
  const mapCenter = [4.6, -74.1]; // Colombia (Bogotá)
  const mapZoom = 6;
  const DATA_BASE = "./data/";

  // --------- ICONOS PERSONALIZADOS ---------
  const solarIcon = L.icon({
    iconUrl: 'assets/css/images/panel-solar.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });

  const eolicaIcon = L.icon({
    iconUrl: 'assets/css/images/energia-eolica.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });

  const hidroIcon = L.icon({
    iconUrl: 'assets/css/images/represa.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });

  const subestIcon = L.icon({
    iconUrl: 'assets/css/images/subestacion.png',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9]
  });

  // --------- CAPAS (GeoJSON locales) ---------
  const layersConfig = {
    // Generadores actuales
    "Plantas solares": "plantas_solares.geojson",
    "Plantas eólicas": "plantas_eolicas.geojson",
    "Hidroeléctricas": "hidroelectricas.geojson",

    // Red y subestaciones
    "Líneas de transmisión": "OSM_lineas.geojson",
    "Subestaciones": "subestaciones.geojson",

    // Restricciones ambientales WMS

    // Consideraciones sociales
    "Zonas de Reserva Campesina": "Zona_Reservas_Campesinas.geojson",
    "Comunidad Negra Titulada": "comunidad_negra_titulada.geojson",
    "Resguardos Indigena Formalizados": "Resguardo_indigena.geojson",
    "Solicitudes Restitucion de tierra": "Solicitudes_Restitucion.geojson"
  };

  // --------- WMS ---------
// --------- WMS Restricciones ambientales ---------

// RUNAP (PNN vía Colombia en Mapas)
  const runapFeatureUrl = "https://services3.arcgis.com/dlXCaGL4ItoCQfIF/ArcGIS/rest/services/%C3%81reas_Protegidas_Colombia___RUNAP/FeatureServer/59/query?where=1=1&outFields=*&f=geojson";

  let runapLayer = L.layerGroup();

  fetch(runapFeatureUrl)
    .then(r => r.json())
    .then(geojson => {
      const g = L.geoJSON(geojson, {
        style: feature => {
          // Si FeatureService tiene campo "Tipo", puedes usarlo para colorear distinto
          // Ejemplo:
          const tipo = feature.properties.Tipo;
          let fillColor = "#66BB6A";
          if (tipo === "Marina") fillColor = "#003F5C";
          else if (tipo === "Marina y Terrestre") fillColor = "#2F4B7C";
          else if (tipo === "Terrestre") fillColor = "#665191";
          return { color: "#1B5E20", fillColor: fillColor, weight: 1, fillOpacity: 0.5 };
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            layer.bindPopup(`<strong>${feature.properties.Nombre}</strong><br>Tipo: ${feature.properties.Tipo}`);
          }
        }
      });
      runapLayer.addLayer(g);
    })
    .catch(err => console.error("Error cargando RUNAP desde FeatureService:", err));


  /* const runapWMS = L.tileLayer.wms(RUNAP_WMS_URL, {
    layers: "RUNAP:areas_protegidas", // ajusta el nombre real de la capa
    format: "image/png",
    transparent: true,
    version: "1.1.1",
    crs: L.CRS.EPSG4326
  });
 */
// Zonas Inundables (ejemplo, ajusta al servicio correcto)
  /* const INUNDABLES_WMS_URL =
    "https://servicios.colombiaenmapas.gov.co/geoserver/INUNDABLES/wms";

  const inundablesWMS = L.tileLayer.wms(INUNDABLES_WMS_URL, {
    layers: "INUNDABLES:zonas_inundables", // ajusta al nombre correcto
    format: "image/png",
    transparent: true,
    version: "1.1.1",
    crs: L.CRS.EPSG4326
  }); */



  const PENDIENTES_WMS_URL =
    "https://mapas.igac.gov.co/server/services/ordenamientoterritorial/pendientescolombia/MapServer/WMSServer";

  const pendientesWMS = L.tileLayer.wms(PENDIENTES_WMS_URL, {
    layers: "0",
    format: "image/png",
    transparent: true,
    version: "1.3.0",
    crs: L.CRS.EPSG4326
  });

  // --------- Radiación Solar (ArcGIS FeatureServer -> GeoJSON) ---------
  function getColorFromRange(rango) {
    switch (rango) {
      case "3.0 -3.5 kWh/m²": return "#0000FF"; // azul
      case "3.5 - 4.0 kWh/m²": return "#2E7D32"; // verde oscuro
      case "4.0 - 4.5 kWh/m²": return "#66BB6A"; // verde claro
      case "4.5 - 5.0 kWh/m²": return "#FFD54F"; // amarillo
      case "5.0 - 5.5 kWh/m²": return "#FB8C00"; // naranja
      case "5.5 - 6.0 kWh/m²": return "#E57373"; // rojo claro
      case "6.0 - 6.5 kWh/m²": return "#D32F2F"; // rojo fuerte
      default: return "#9E9E9E"; // gris
    }
  }

  const radiacionSolarLayer = L.layerGroup();
  fetch("https://services.arcgis.com/mBg08vgayOnqC7Si/arcgis/rest/services/Radiaci%C3%B3n_Solar__Multianual_Colombia/FeatureServer/0/query?where=1=1&outFields=*&f=geojson")
    .then(r => r.json())
    .then(geojson => {
      const g = L.geoJSON(geojson, {
        style: feature => ({
          color: "#555",
          weight: 0.5,
          fillColor: getColorFromRange(feature.properties.RANGO),
          fillOpacity: 0.7
        }),
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            layer.bindPopup(`Rango: ${feature.properties.RANGO}`);
          }
        }
      });
      radiacionSolarLayer.addLayer(g);
    })
    .catch(err => console.error("Error cargando radiación solar:", err));

  // --------- ESTILOS ---------
  const defaultStyles = {
    polygon: { weight: 1, opacity: 1, color: "#555", fillOpacity: 0.3, fillColor: "#4DAF50" },
    line: { weight: 2, opacity: 0.9, color: "#1E88E5" },
    point: { radius: 5, stroke: true, weight: 1, opacity: 1, color: "#333", fillOpacity: 0.85, fillColor: "#FF6F00" }
  };

  const perLayerStyle = {
    "Plantas solares": { fillColor: "#F9A825" },
    "Plantas eólicas": { fillColor: "#1976D2" },
    "Hidroeléctricas": { fillColor: "#26A69A" },
    "Líneas de transmisión": { color: "#8E24AA", weight: 2.5 },
    "Subestaciones": { fillColor: "#D81B60" },
  
    // Restricciones ambientales
    "Registro Único de Áreas Protegidas (RUNAP)": {
      color: "#1B5E20", fillColor: "#66BB6A", weight: 1, fillOpacity: 0.4
    },
    "Zonas Inundable": {
      color: "#0D47A1", fillColor: "#42A5F5", weight: 1, fillOpacity: 0.3
    },

    // Consideraciones sociales
    "Zonas de Reserva Campesina": {
      color: "#4E342E", fillColor: "#A1887F", weight: 1, fillOpacity: 0.4
    },
    "Comunidad Negra Titulada": {
      color: "#760e92ff", fillColor: "#a020aeff", weight: 1, fillOpacity: 0.4
    },
    "Resguardos Indigena Formalizados": {
      color: "#66c345ff", fillColor: "#b5c868ff", weight: 1, fillOpacity: 0.4
    },
    "Solicitudes Restitucion de tierra": {
      color: "#BF360C", fillColor: "#FF8A65", weight: 1, fillOpacity: 0.4
    }
  };
  // --------- BASEMAPS ---------
  const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  });
  const CartoDB = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; CartoDB"
  });

  const baseMaps = [
    { groupName: "Base Maps", layers: { OpenStreetMap: osm, "CartoDB Positron": CartoDB } }
  ];

  // --------- PLACEHOLDERS DE CAPAS ---------
  const layerGroups = {};
  Object.keys(layersConfig).forEach(name => {
    layerGroups[name] = L.layerGroup();
  });

  // --------- GRUPOS DEL PANEL ---------
  const overlays = [
    {
      groupName: "Generadores actuales",
      expanded: true,
      layers: {
        "Plantas solares": layerGroups["Plantas solares"],
        "Plantas eólicas": layerGroups["Plantas eólicas"],
        "Hidroeléctricas": layerGroups["Hidroeléctricas"]
      }
    },
    {
      groupName: "Red y subestaciones",
      expanded: true,
      layers: {
        "Líneas de transmisión": layerGroups["Líneas de transmisión"],
        "Subestaciones": layerGroups["Subestaciones"]
      }
    },
    {
      groupName: "Restricciones ambientales",
      expanded: true,
     layers: {
    "Registro Único de Áreas Protegidas (RUNAP)": runapLayer,
    // "Zonas Inundable": inundablesWMS
      }
    },
    {
      groupName: "Consideraciones sociales",
      expanded: true,
      layers: {
        "Zonas de Reserva Campesina": layerGroups["Zonas de Reserva Campesina"],
        "Comunidad Negra Titulada": layerGroups["Comunidad Negra Titulada"],
        "Resguardos Indigena Formalizados": layerGroups["Resguardos Indigena Formalizados"],
        "Solicitudes Restitucion de tierra": layerGroups["Solicitudes Restitucion de tierra"]
      }
    },
    {
      groupName: "Condiciones de terreno",
      expanded: true,
      layers: {
        "Pendientes (IGAC - WMS)": pendientesWMS,
        "Radiación Solar Multianual (ArcGIS)": radiacionSolarLayer
      }
    }
  ];

  const layerControlOptions = {
    container_width: "300px",
    group_maxHeight: "85px",
    exclusive: false,
    collapsed: false,
    position: "topright"
  };

  // ====== SIDEBAR: UNA TARJETA POR CAPA ACTIVA (Nombre • Fuente • Leyenda) ======
  const LEGEND_BASE = "assets/css/images/legend/"; // PNG con el MISMO nombre de la capa

  const layerMeta = {
    "Pendientes (IGAC - WMS)": {
      fuente: "IGAC –  STRM de 30 2019 Pendientes de Colombia (calculos propios)",
      url: "https://mapas.igac.gov.co/server/services/ordenamientoterritorial/pendientepromediomunicipio/MapServer/WFSServer?request=getcapabilities&service=wfs"
    },
    "Radiación Solar Multianual (ArcGIS)": {
      fuente: "ArcGIS Online – Radiación Solar Multianual",
      url: "https://services.arcgis.com/mBg08vgayOnqC7Si/arcgis/rest/services/Radiaci%C3%B3n_Solar__Multianual_Colombia/FeatureServer/0"
    },
    "Plantas solares":       { fuente: "OMS – GeoJSON local", url: "#" },
    "Plantas eólicas":       { fuente: "OMS  – GeoJSON local", url: "#" },
    "Hidroeléctricas":       { fuente: "OMS  – GeoJSON local", url: "#" },
    "Subestaciones":         { fuente: "OMS  – GeoJSON local", url: "#" },
    "Líneas de transmisión": { fuente: "OSM  – GeoJSON local", url: "#" },
    "Registro Único de Áreas Protegidas (RUNAP)": {
      fuente: "PNN – RUNAP (vía Colombia en Mapas)",
      url: "https://www.colombiaenmapas.gov.co/?u=0&t=2&servicio=179"
    },
    "Zonas Inundable": { fuente: "Fuente local", url: "#" },
    "Zonas de Reserva Campesina": { fuente: "Agencia Nacional de Tierras", url: "https://data-agenciadetierras.opendata.arcgis.com/datasets/agenciadetierras::zonas-de-reserva-campesina-2/explore" },
    "Comunidad Negra Titulada":   { fuente: "MinInterior", url: "https://www.colombiaenmapas.gov.co/?u=0&t=1&servicio=160" },
    "Resguardos Indigena Formalizados": { fuente: "MinInterior", url: "https://www.datos.gov.co/dataset/Resguardo-Indigena-Formalizado/f6du-dwd8/about_data" },
    "Solicitudes Restitucion de tierra": { fuente: "Unidad de Restitución de Tierras URT", url: "https://urtdatosabiertos-uaegrtd.opendata.arcgis.com/search" }
  };

  const activeLayerNames = new Set();

  function cardForLayer(name) {
    const meta = layerMeta[name] || {};
    const fuenteHTML = meta.url && meta.url !== "#"
      ? `<a href="${meta.url}" target="_blank" rel="noopener">${meta.fuente || "Fuente"}</a>`
      : (meta.fuente ? meta.fuente : "Fuente no especificada");

    const legendSrc = `${LEGEND_BASE}${encodeURIComponent(name)}.png`;

    return `
      <div style="margin:8px 0 12px 0;">
        <div style="font-size:14px;">• <strong>${name}</strong></div>
        <div style="font-size:12px; color:#1b5e20; margin:2px 0 6px 16px;">${fuenteHTML}</div>
        <div style="margin-left:16px;">
          <img src="${legendSrc}" alt="Leyenda ${name}"
               onerror="this.style.display='none'"
               style="max-width:220px; height:auto; border:1px solid #ccc; background:#fff;">
        </div>
      </div>`;
  }

  function updateSidebar() {
    const wrap = document.getElementById("sidebar-info");
    if (!wrap) return;
    const names = [...activeLayerNames];
    wrap.innerHTML = names.length ? names.map(cardForLayer).join("") : "<em>Sin capas activas</em>";
  }

  // --------- MAPA ---------
  const initialOverlaysOn = [
    radiacionSolarLayer,
    layerGroups["Plantas solares"],
    layerGroups["Plantas eólicas"],
    layerGroups["Hidroeléctricas"]
  ];

  const map = L.map("map", {
    center: mapCenter,
    zoom: mapZoom,
    zoomSnap: 0.1,
    zoomDelta: 0.1,
    scrollWheelZoom: true,
    trackResize: true,
    layers: [osm] // base
  });
  // Enciende overlays iniciales
  initialOverlaysOn.forEach(l => l.addTo(map));

  // Control de capas (styled)
  const control = L.Control.styledLayerControl(baseMaps, overlays, layerControlOptions);
  map.addControl(control);

  // Escala
  L.control.scale().addTo(map);

  // Eventos de overlay para la sidebar
  map.on("overlayadd",   e => { activeLayerNames.add(e.name); updateSidebar(); });
  map.on("overlayremove", e => { activeLayerNames.delete(e.name); updateSidebar(); });

  // Arranque: marca las capas que enciendes al inicio
  ["Radiación Solar Multianual (ArcGIS)", "Plantas solares", "Plantas eólicas", "Hidroeléctricas"]
    .forEach(n => activeLayerNames.add(n));
  updateSidebar();

  // Norte (abajo-izquierda, encima de escala con CSS)
  const north = L.control({ position: "bottomleft" });
  north.onAdd = function () {
    const div = L.DomUtil.create("div", "leaflet-control-north");
    div.innerHTML = '<img src="assets/css/images/north-arrow.png" alt="Norte">';
    return div;
  };
  north.addTo(map);

  // --------- LEAFLET.DRAW ---------
  const drawnItems = new L.FeatureGroup().addTo(map);
  const drawControl = new L.Control.Draw({
    draw: { polygon: true, polyline: true, circle: false, rectangle: false, marker: false },
    edit: { featureGroup: drawnItems, edit: true, remove: true }
  });
  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, function (event) {
    const layer = event.layer;
    drawnItems.addLayer(layer);
    if (layer instanceof L.Polygon) {
      const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      alert('Área del polígono: ' + area.toFixed(2) + ' m²');
    } else if (layer instanceof L.Polyline) {
      const latlngs = layer.getLatLngs();
      let length = 0;
      for (let i = 1; i < latlngs.length; i++) {
        length += latlngs[i - 1].distanceTo(latlngs[i]);
      }
      alert('Longitud de la línea: ' + length.toFixed(2) + ' m');
    }
  });

  // --------- UTILIDADES ---------
  function geomType(geom) {
    const t = geom && (geom.type || (geom.geometry && geom.geometry.type));
    if (!t) return "polygon";
    if (t.includes("Point")) return "point";
    if (t.includes("Line")) return "line";
    return "polygon";
  }

  function styleFor(name, type) {
    const base =
      type === "point" ? defaultStyles.point :
      type === "line"  ? defaultStyles.line  :
                         defaultStyles.polygon;
    return { ...base, ...(perLayerStyle[name] || {}) };
  }

  function bindPopupFromProps(layer, props) {
    if (!props) return;
    const rows = Object.entries(props)
      .map(([k, v]) => `<tr><th style="text-align:left;padding-right:8px;">${k}</th><td>${v}</td></tr>`)
      .join("");
    layer.bindPopup(`<table>${rows}</table>`);
  }

  function loadGeoJSON(name, file) {
    fetch(DATA_BASE + file)
      .then(r => r.json())
      .then(geo => {
        const layer = L.geoJSON(geo, {
          pointToLayer: (f, latlng) => {
            if (name === "Plantas solares")   return L.marker(latlng, { icon: solarIcon });
            if (name === "Plantas eólicas")   return L.marker(latlng, { icon: eolicaIcon });
            if (name === "Hidroeléctricas")   return L.marker(latlng, { icon: hidroIcon });
            if (name === "Subestaciones")     return L.marker(latlng, { icon: subestIcon });
            return L.circleMarker(latlng, styleFor(name, "point"));
          },
          style: f => styleFor(name, geomType(f.geometry || f))
        });

        layer.eachLayer(l => {
          if (l.feature && l.feature.properties) {
            bindPopupFromProps(l, l.feature.properties);
          }
        });

        layer.addTo(layerGroups[name]);
      })
      .catch(err => console.warn(`No se pudo cargar "${name}" (${file}):`, err));
  }

  // Cargar todas las capas GeoJSON (el mapa igual se muestra con el base OSM si faltan archivos)
  Object.entries(layersConfig).forEach(([name, file]) => loadGeoJSON(name, file));
})();
