import ManageLayers from 'facade/managelayers';
const map = M.map({
    container: 'mapjs',
    controls: ["overviewmap",
        "scale", "panzoom"
    ],
    layers: [],
    wmcfiles: ["http://factorylab01.ieca.junta-andalucia.es/andalucia/mapa_base_grupos.xml*Contexto*Mapa"]
});

// /** Plugin gestor de capas **/
var configGroups = [];

/** Se añade grupo Datos de referencia **/
configGroups.push({
    title: "Datos de referencia",
    description: "Conjunto de capas que permiten la generación de un mapa de Andalucía básico",
    overlays: [

        new M.layer.WMS({
            url: 'https://www.callejerodeandalucia.es/servicios/cdau/wms?',
            name: 'CDAU_wms',
            legend: 'Vias y Portales CDAU',
            version: '1.1.1',
            transparent: true,
            tiled: true
        }),
        new M.layer.WMS({
            url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?',
            name: 'Catastro',
            legend: 'Catastro publicada por la dirección general de Catastro',
            version: '1.1.1',
            transparent: true,
            tiled: true
        }),
        new M.layer.WMTS({
            url: 'https://www.ign.es/wmts/pnoa-ma',
            name: "OI.OrthoimageCoverage",
            legend: 'PNOA máxima actualidad publicada por el Instituto Geográfico Nacional',
            version: '1.3.0',
            transparent: true,
            tiled: true
        }, {
            params: {
                layers: 'OI.OrthoimageCoverage',
                styles: 'default'
            }
        })
    ]
});

/** Se añade grupo Mapas topográficos **/
configGroups.push({
    title: "Mapas topográficos",
    description: "Mapas topográficos de Andalucía",
    overlays: [
        new M.layer.WMS({
            url: 'https://www.ideandalucia.es/wms/mta10r_2001-2013?',
            name: 'mta10r_2001-2013',
            legend: 'Topográfico 1:10000 (raster)',
            transparent: true,
            tiled: true
        }),
        new M.layer.WMS({
            url: 'https://www.ideandalucia.es/wms/mta10v_2007?',
            name: 'mta10v_2007',
            legend: 'Topográfico 1:10000 (vectorial)',
            transparent: true,
            tiled: true
        })
    ]
});

/** Se añade grupo Mapas temáticos **/
configGroups.push({
    title: "Mapas temáticos",
    description: "Mapas temáticos de Andalucía",
    overlays: [
        new M.layer.WMS({
            url: 'https://www.ideandalucia.es/services/mta400v_2016/wms',
            name: 'mta400v_2016',
            legend: 'Topográfico 400.000 (vectorial)',
            transparent: true,
            tiled: true
        }),
        new M.layer.WMS({
            url: 'https://www.ideandalucia.es/wms/mta100v_2005',
            name: 'Mapa Topográfico de Andalucía 1:100000 Vectorial',
            legend: 'Topográfico 100.000 (vectorial)',
            transparent: true,
            tiled: true
        }),
        new M.layer.WMS({
            url: 'https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_siose_2013_explot?',
            name: 'REDIAM',
            legend: 'Explotación de la información del Proyecto SIOSE-Andalucia 2013',
            transparent: true,
            tiled: true
        }),
        new M.layer.WMS({
            url: 'https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_Biodiversidad_Andalucia?',
            name: 'REDIAM',
            legend: 'Mapa de Biodiversidad de Andalucía',
            transparent: true,
            tiled: true
        })
    ]
});

/** Se añade grupo Mapas estadísticos **/
configGroups.push({
    title: "Mapas estadísticos",
    description: "Mapas con información estadística de Andalucía",
    overlays: [
        new M.layer.WMS({
            url: 'https://www.juntadeandalucia.es/institutodeestadisticaycartografia/geoserver-ieca/gridpob/wms?',
            name: 'gridpob_250',
            legend: 'Población en Andalucía',
            transparent: true,
            tiled: true
        }),
        new M.layer.WMS({
            url: 'https://www.juntadeandalucia.es/institutodeestadisticaycartografia/geoserver-ieca/gridafil/wms?',
            name: 'gridafil_250',
            legend: 'Afiliados a la Seguridad Social en Andalucía',
            transparent: true,
            tiled: true
        }),
        new M.layer.WMS({
            url: 'https://www.juntadeandalucia.es/institutodeestadisticaycartografia/geoserver-ieca/gridpenc/wms?',
            name: 'gridpenc_250',
            legend: 'Pensiones contributivas de la Seguridad Social en Andalucía',
            transparent: true,
            tiled: true
        }),
        new M.layer.WMS({
            url: 'https://www.juntadeandalucia.es/institutodeestadisticaycartografia/geoserver-ieca/degurbagrid/wms?',
            name: 'degurba250',
            legend: 'Grado de Urbanización de Andalucía',
            transparent: true,
            tiled: true
        })
    ]
});

/** Se añade grupo Cartografía histórica **/
configGroups.push({
    title: "Cartografía histórica",
    description: "Cartografía Histórica de Andalucía",
    overlays: [
        new M.layer.WMS({
            url: 'https://www.ign.es/wms/primera-edicion-mtn?',
            name: 'MTN25',
            legend: 'Mapa Topográfico Nacional (Primera Edición)',
            transparent: true,
            tiled: true
        }),
        new M.layer.WMS({
            url: 'https://www.ideandalucia.es/wms/mta50r_aleman_1944?',
            name: 'MTA50a_1940',
            legend: 'Mapa Topográfico de Andalucia.Estado Mayor del Ejercito de Alemania (1944)',
            transparent: true,
            tiled: true
        })
    ]
});

/** Se añade grupo Ortofotografías histórica **/
configGroups.push({
    title: "Ortofotografías histórica",
    description: "Ortofotografías Históricas de Andalucía",
    overlays: [
        new M.layer.WMS({
            url: 'https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_Ortofoto_Andalucia_1956?',
            name: 'ortofoto_1956',
            legend: 'Ortofotografía 1956-57 (Vuelo Americano)',
            transparent: true,
            tiled: true
        })
    ]
});

var configBaseMaps = [{
    img: 'build/managelayers/img/osm.png',
    layer: new M.layer.OSM({
        legend: 'OpenStreet Maps'
    })
},
{
    img: 'build/managelayers/img/pnoa.png',
    layer: new M.layer.WMTS({
        url: 'https://www.ign.es/wmts/pnoa-ma',
        name: "OI.OrthoimageCoverage",
        legend: 'PNOA máxima actualidad publicada por el Instituto Geográfico Nacional',
        version: '1.3.0',
        transparent: false,
        tiled: true
    }, {
        params: {
            layers: 'OI.OrthoimageCoverage',
            styles: 'default'
        }
    })
},
{
    img: 'build/managelayers/img/ign.png',
    layer: new M.layer.WMS({
        url: 'https://www.ign.es/wms-inspire/ign-base',
        name: "IGNBaseTodo",
        legend: 'Mapa base del Instituto Geográfico Nacional',
        version: '1.3.0',
        transparent: false,
        tiled: true
    })
},
{
    img: 'build/managelayers/img/catastro.png',
    layer: new M.layer.WMS({
        url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?',
        name: 'Catastro',
        legend: 'Catastro publicada por la dirección general de Catastro',
        version: '1.1.1',
        transparent: false,
        tiled: true
    })
}
];

/** Plugin managelayers **/
var paramsPlugin = {
    options: {
        panel: {
            collapsedClass: 'g-cartografia-capas2',
            tooltip: 'Gestión de capas',
            position: 'TL'
        }
    },
    config: {
        thematicLayers: {
            params: {
                groups: configGroups
            },
            options: {
                iconClass: 'g-cartografia-mundo2',
                tooltip: 'Favoritas',
            }
        },
        baseLayers: {
            params: {
                baseMaps: [],
                activatedBlankMap: false //desactivación de BaseMaps cargados de inicio
            },
            options: {
                tooltip: 'Capas de fondo',
            }
        }
    }
};

const mp = new ManageLayers(paramsPlugin);
map.addPlugin(mp);
