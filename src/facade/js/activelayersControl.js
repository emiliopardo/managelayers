/**
 * @module M/control/ActiveLayersControl
 */
import ManageLayersControl from './managelayerscontrol.js';
import ActiveLayersImplControl from 'impl/activelayersControl';
import Sortable from './_externs_html.sortable.min.js';
import template from 'templates/activelayers';

export default class ActiveLayersControl extends ManageLayersControl {


    /**
     * Name to identify this control
     * @const
     * @type {string}
     * @public
     * @api stable
     */
    static get NAME() {
        return 'ActiveLayers';
    }

    /**
     * Name to identify url template
     * @const
     * @public
     * @type {string}
     * @api stable
     */
    static get TEMPLATE() {
        return template;
    }

    /**
     * @classdesc
     * Main constructor of the class. Creates a ActiveLayersControl
     * control
     *
     * @constructor
     * @extends {M.Control}
     * @api stable
     */
    constructor(params, options) {
        // 1. checks if the implementation can create ActiveLayersControl
        if (M.utils.isUndefined(ActiveLayersImplControl)) {
            M.exception('La implementación usada no puede crear controles ActiveLayersControl');
        }
        // Parametros del control
        let opt_ = {
            controlName: ActiveLayersControl.NAME,
            iconClass: 'g-cartografia-capas2',
            tooltip: 'Capas activas'
        };
        // Se annaden los parametros de control a las opciones
        options = M.utils.extend(opt_, options, true);
        // 2. implementation of this control
        let impl = new ActiveLayersImplControl(params);

        super(impl, params, options);

        /**
         * Params of the control
         * @private
         * @type {params}
         */
        this.params_ = params || {};

        //Almacenamos en impl referencia a facade para poder actualizar panel al procesar eventos
        impl.facadeCtrol_ = this;

        //Contador auxiliar para establecer ids genericos para capas que no tenan
        this.countID_ = 0;

        //Id y titulo por defecto del grupo Otras Capas
        this.defaultIdGroup = 'others'
        this.defaultTitleGroup = 'Otras Capas'

        // FUNCIONES a eventos para poder eliminarlos después
        this.boundClickLayer_ = evt => this.clickLayer(evt);
    }
    addEvents(html) {
        let content = html.querySelector(this.getSelectorContainer_());
        // change slider event
        content.addEventListener('input', (evt) => this.clickLayerSlider(evt));
    }

    clickButtonGroup(evt) {
        let groupId = evt.target.parentNode.getAttribute("data-group")
        let show = true
        //logica para cuando se pincha en el boton de ocultar mostrar capas de grupo
        if (evt.target.classList.contains("m-accion-activegroups-show-hide-layers")) {
            if (evt.target.classList.contains("show")) {
                evt.target.classList.remove("show")
                evt.target.classList.add("hide")
                show = false
            } else {
                evt.target.classList.add("show")
                evt.target.classList.remove("hide")
            }
            this.showLayersInGroup(groupId, show)
        }
        //lógica para cuando se pincha en el boton mostrar ocultar capas del grupo
        else if (evt.target.classList.contains("m-accion-activegroups-collapse")) {
            evt.target.classList.toggle("g-cartografia-flecha-arriba2")
            evt.target.classList.toggle("g-cartografia-flecha-abajo2")
            let selectedGroup = this.mapeaLayerGroup.find(x => x.id === groupId)
            let layersInGroup = selectedGroup.overlayLayers
            for (let index = 0; index < layersInGroup.length; index++) {
                const element = layersInGroup[index];
                document.getElementById("tocLayer_" + element.id).classList.toggle("dNone");
                document.getElementById("tocLayer_" + element.id).classList.toggle("visible");
            }
            this.groupsVisibleStatus(groupId)
        }
    }

    checkGroupLayerVisibility(groupId) {
        let result = true;
        //console.log(groupId)
        let layers = this.filterGroups(groupId)
        //console.log(layers)
        let uniqueValues = this.checkUniqueValuesGroupLayerVisibility(layers)
        //console.log(uniqueValues)
        if (uniqueValues.length > 1) {
            //si es mayor que 1 es que hay true o false, por defecto será true
            result = true
        } else {
            // si solo hay un valor unico lo cogemos
            result = uniqueValues[0]
        }
        return result
    }

    //selecciono solo las capas que pertencen a un grupo concreto
    filterGroups(groupId) {
        return this.templateVariables.filter(obj => {
            return obj.groupId === groupId
        })
    }

    //obtengo los valores distintos de la propiedad visible de un array de capas
    checkUniqueValuesGroupLayerVisibility(layers) {
        return [...new Set(layers.map(item => item.visible))];
    }

    //oculto o muestro las capas de un grupo de this.templateVariables
    showLayersInGroup(groupId, show) {
        for (let index = 0; index < this.templateVariables.length; index++) {
            const element = this.templateVariables[index];
            if (element.groupId === groupId) {
                element.visible = show
                this.updateTemplateLayerChecked(element.id)
            }
        }
    }

    //cambio el estado del checkbox Ver/Ocultar capa
    updateTemplateLayerChecked(layerId){
        let layerCheckBox = document.getElementById("titleTocLayer_"+layerId).getElementsByTagName( 'input' )[0]
        if (layerCheckBox.checked == true){
            layerCheckBox.checked = false;
        } else{
            layerCheckBox.checked = true;
        }
        //se actualizan las capas visibles en el mapa
        this.map_.getLayers()[this.map_.getLayers().findIndex(x => x.id === layerId)].setVisible(this.templateVariables[this.templateVariables.findIndex(x => x.id === layerId)].visible)
    }

    groupsVisibleStatus(groupId) {
        if (this.mapeaLayerGroup[this.mapeaLayerGroup.findIndex(x => x.id === groupId)].collapsed == false) {
            this.mapeaLayerGroup[this.mapeaLayerGroup.findIndex(x => x.id === groupId)].collapsed = true;
        } else {
            this.mapeaLayerGroup[this.mapeaLayerGroup.findIndex(x => x.id === groupId)].collapsed = false;
        }
        this.templateVar.vars.layersGroups = this.mapeaLayerGroup
        for (let index = 0; index < this.templateVariables.length; index++) {
            const element = this.templateVariables[index];
            if (element.groupId == groupId) {
                if (element.hide == false) {
                    element.hide = true
                } else {
                    element.hide = false;
                }
            }
        }
    }

    clickLayerSlider(evt) {
        evt = (evt || window.event);
        if (!M.utils.isNullOrEmpty(evt.target)) {
            let itemTarget = evt.target;
            let id = itemTarget.getAttribute('data-id');
            //Si tenemos datos de la capa
            if (!M.utils.isNullOrEmpty(id)) {
                let layer = this.findLayerById(id);
                if (itemTarget.classList.contains('m-accion-activelayers-transparency')) {
                    layer.setOpacity(parseFloat(itemTarget.value));
                    itemTarget.nextElementSibling.innerHTML = itemTarget.value * 100 + '%';
                }
            }
        }
    }

    clickLayer(evt) {
        evt = (evt || window.event);
        if (!M.utils.isNullOrEmpty(evt.target)) {
            let itemTarget = evt.target;
            let id = itemTarget.getAttribute('data-id');
            //Si tenemos datos de la capa
            if (!M.utils.isNullOrEmpty(id)) {
                //Obtener datos de la capa seleccionada
                let layer = this.findLayerById(id);
                //Obtener control y opciones del toc del elemento seleccionado
                let ctolContainer = this.getControlContainer_();
                let itemTocOptions = this.getQuerySelectorScapeCSS(ctolContainer, '#optionsTocLayer_', id);
                //Mostrar/Ocultar opciones de capa
                if (itemTarget.classList.contains('m-accion-activelayers-collapse')) {
                    //Actualizar configuracion estado del toc
                    let configToc = this.getOptionsControlManageLayers(layer);
                    configToc.collapsed = !(itemTocOptions.classList.contains('dNone'));
                    //Mostrar/Ocultar opciones
                    itemTocOptions.classList.toggle('dNone');
                    itemTarget.classList.toggle('g-cartografia-flecha-abajo2');
                    itemTarget.classList.toggle('g-cartografia-flecha-arriba2');
                }
                //Cambiar nombre
                else if (itemTarget.classList.contains('m-accion-activelayers-rename')) {
                    //Establecer titulo como editable
                    let titleText = this.getQuerySelectorScapeCSS(ctolContainer, '#textTitleLayer_', id);
                    let input = document.createElement("input");
                    input.type = "text";
                    input.value = titleText.innerText;
                    titleText.innerText = "";
                    titleText.appendChild(input);
                    input.addEventListener('focus', function () { this.select(); });
                    input.focus();
                    let _event_blur = (evt) => {
                        //Desactivar edicion y almacenar cambios
                        titleText.innerHTML = input.value;
                        layer.legend = input.value;
                        input.removeEventListener('blur', (evt) => _event_blur(evt));
                        input = null;
                    };
                    //Procesar cambios
                    input.addEventListener('blur', (evt) => _event_blur(evt));
                }
                // Activar/Desactivar
                else if (itemTarget.classList.contains('m-accion-activelayers-activate')) {
                    if ((layer.transparent === true) || !layer.isVisible()) {
                        let opacity = itemTarget.parentElement.parentElement.querySelector('div.tools > input');
                        if (!M.utils.isNullOrEmpty(opacity)) {
                            layer.setOpacity(opacity.value);
                        }
                        layer.setVisible(!layer.isVisible());
                    }
                    this.updateLayerVisible(id)
                }
                //Metadatos
                else if (itemTarget.classList.contains('m-accion-activelayers-metadata')) {
                    //TODO: PTE IMPLEMENTACION
                    if ((layer.type === M.layer.type.WMS) || (layer.type === M.layer.type.WFS)) {
                        this.getImpl().getMetadataLink(layer).then((metadataLink) => {
                            window.open(metadataLink, '_blank');
                        });
                    }
                }
                //Informacion de la capa
                else if (itemTarget.classList.contains('m-accion-activelayers-info')) {
                    //Obtenemos abstract de la capa y mostrar en popup
                    layer.getImpl().getAbstractLayer().then((descripcion) => {
                        let titulo = 'Información: ' + layer.legend;
                        if (M.utils.isNullOrEmpty(descripcion))
                            descripcion = 'No hay descripción asociada a la capa';
                        //Mostrar informacion
                        M.dialog.info(descripcion, titulo);
                    });
                }
                //Mostrar/ocultar estilos de la capa
                else if (itemTarget.classList.contains('m-accion-activelayers-showstyles')) {
                    let stylesContainer = this.getQuerySelectorScapeCSS(ctolContainer, '#stylesTocLayer_', id);
                    //Actualizar configuracion estado del toc
                    let configToc = this.getOptionsControlManageLayers(layer);
                    configToc.showStyles = (stylesContainer.classList.contains('dNone'));
                    //Mostrar/Ocultar opciones
                    stylesContainer.classList.toggle('dNone');
                }
                //Activar estilo
                else if (itemTarget.classList.contains('m-accion-activelayers-activestyle')) {
                    let position = itemTarget.value;
                    let previousPosition = this.getImpl().getLayerStylePosition(layer);
                    if (position != previousPosition) {
                        this.getImpl().setLayerStyle(layer, position);
                        this.renderPanel();
                    }
                }
                //Eliminar
                else if (itemTarget.classList.contains('m-accion-activelayers-remove')) {
                    //Eliminar capa cargada y configuracion del toc
                    this.resetOptionsManageLayers(layer);
                    this.removeLayers(layer);
                }

                for (let index = 0; index < this.mapeaLayerGroup.length; index++) {
                    const element = this.mapeaLayerGroup[index];
                    if (!element.visible) {
                        document.getElementById('tocGroup_' + element.id).classList.toggle('dNobe')
                    }
                }
            } else {
                //logica para evento click en botones de grupos
                this.clickButtonGroup(evt)
            }
        }
    }

    moveLayer(itemTarget, oldIndex, newIndex) {
        //Realizar movimiento de la capa
        let id = ((!M.utils.isNullOrEmpty(itemTarget)) ? itemTarget.getAttribute('data-id') : '');
        if (!M.utils.isNullOrEmpty(id)) {
            this.getImpl().moveLayer(id, oldIndex, newIndex);
        }
    }

    updateLayerVisible(id) {
        for (let index = 0; index < this.templateVariables.length; index++) {
            const element = this.templateVariables[index];
            if (element.id == id) {
                if (element.visible == true) {
                    element.visible = false
                } else { element.visible = true }
            }
        }
    }

    /**
     * This function registers events on map and layers to render
     * the activelayers
     *
     * @function
     * @api stable
     */
    render() {
        this.renderPanel();
    }

    /**
     * Re-draw the layer panel to represent the current state of the layers.
     *
     * @public
     * @function
     * @api stable
     */
    renderPanel() {
        this.activateLoading();
        this.getTemplateVariables_().then((templateVariables) => {
            if (!this.templateVariables) {
                this.templateVariables = templateVariables
            }
            //se generan leyendas capas vectoriales
            this.checkTemplateVaribles(templateVariables)
            this.setVectorLegend(this.templateVariables)
            this.templateVar = this.buildTemplateVar(this.templateVariables)
            let html = M.template.compileSync(ActiveLayersControl.TEMPLATE, this.templateVar)
            //Antes de eliminar lista anterior sortable de capas activas
            if (this.sortableList) {
                this.sortableList.destroy();
                this.sortableList = null;
            }
            // Eliminar eventos de accion anteriores
            let actions = this.getControlContainer_().querySelectorAll('[class^=m-accion-]');
            Array.from(actions).forEach(action => {
                action.removeEventListener('click', this.boundClickLayer_);
            });
            //Actualizar contenido
            this.registerImgErrorEvents_(html);
            this.getControlContainer_().innerHTML = html.innerHTML;
            //Crear nuevo sortable para lista de capas activas
            if (!this.sortableList) {
                let itemSortable = this.getControlContainer_().querySelector('.sortable-activelayers');
                this.sortableList = Sortable.create(itemSortable, {
                    animation: 150,
                    handle: '.m-accion-activelayers-order',
                    onEnd: (evt) => {
                        //Realizar movimiento de la capa
                        this.moveLayer(evt.item, evt.oldIndex, evt.newIndex);
                    }
                });
            }
            // Annadimos los eventos al las acciones
            actions = this.getControlContainer_().querySelectorAll('[class^=m-accion-]');
            Array.from(actions).forEach(action => {
                action.addEventListener('click', this.boundClickLayer_);
            });
            this.deactivateLoading();
        });

    }

    /**
     * Gets the variables of the template to compile
     */
    getTemplateVariables_() {
        //Actualizar configuracion de capas para mostrar el toc
        this.setConfigLayers();

        // gets base layers and overlay layers

        let overlayLayers = this.getImpl().getFilterLayerList(false);
        /************* */
        //let promises = overlayLayers.map(this.parseLayerForTemplate_, this);
        let promises = overlayLayers.map((ly) => this.parseLayerForTemplate_(ly));

        return Promise.all(promises).catch(err => console.log('Catch', err));

    }

    /**
     * This function checks if an object is equals
     * to this control
     *
     * @private
     * @function
     */
    parseLayerForTemplate_(layer, index) {
        return new Promise((success, fail) => {
            //Sobre la layer establecemos parametros inciales de visualizacion en el toc de capas activas
            let configToc = this.getOptionsControlManageLayers(layer);
            if (M.utils.isNullOrEmpty(configToc)) {
                configToc = {
                    index: index,
                    collapsed: true,
                    showStyles: false
                };
                this.setOptionsControlManageLayers(layer, configToc);
            }

            //Titulo de la capa
            let layerTitle = layer.legend;
            if (M.utils.isNullOrEmpty(layerTitle))
                layerTitle = layer.name;
            if (M.utils.isNullOrEmpty(layerTitle))
                layerTitle = 'Servicio - ' + layer.type;

            //Acceso metadatos
            let metadata = layer.options.metadata;

            //Tendran informacion de capa solo los servicios OGC (WMTS, WMS y WFS)
            let infoLayer = ((layer.type === M.layer.type.WMS) || (layer.type === M.layer.type.WMTS) || (layer.type === M.layer.type.WFS));

            let groupId = null;
            let groupTitle = null;
            let group = layer.layerGroup_;
            if (group != null) {
                groupId = group.id;
                groupTitle = group.title
            }
            else {
                groupId = this.defaultIdGroup;
                groupTitle = this.defaultTitleGroup;
            }

            let result = {
                'groupId': groupId,
                'groupTitle': groupTitle,
                'metadata': (!M.utils.isNullOrEmpty(metadata)),
                'infoLayer': infoLayer,
                'hide': true,
                'origen': layer.options.origen,
                'collapsed': (configToc.collapsed === true),
                'showStyles': (configToc.showStyles === true),
                'base': (layer.transparent === false),
                'visible': (layer.isVisible() === true),
                'id': layer.id,
                'name': layer.name,
                'title': layerTitle,
                'legend': layer.getLegendURL(),
                'outOfRange': !layer.inRange(),
                'opacity': layer.getOpacity(),
                'opacityPer': layer.getOpacity() * 100,
                'styles': [],
                'canEditName': (layer.options.origen != 'Inicial' && layer.options.origen != 'Tematica'),
                'canRemove': layer.options.origen != 'Inicial'
            };
            // Inicializamos el array de promises para lanzar el sucess desde un promise.all
            let promises = [];
            // Si es de tipo WMS, WMTS o WFS y no se han insertado metadatos por configuración, se consulta por sus metadatos
            if ((layer.type === M.layer.type.WMS) || (layer.type === M.layer.type.WFS) && (M.utils.isNullOrEmpty(metadata))) {
                promises.push(this.getImpl().getMetadataLink(layer).then((metadataLink) => {
                    result.metadata = metadataLink;
                }).catch(err => console.log('Catch', err)));
            }
            // Si se trata de una capa WMS se buscan los estilos asociados a la capa. No se hace para WMTS porque
            // no parece que exista un método para asignar el estilo
            if (((layer.type === M.layer.type.WMS))) {
                promises.push(this.getImpl().getStylesLayer(layer).then((styles) => {
                    let selectedStyle = this.getImpl().getLayerStylePosition(layer);
                    result.styles = styles.map((style, index) => {
                        style.id = layer.id;
                        style.selected = (selectedStyle == index);
                        return style;
                    });
                    result.legend = layer.getLegendURL();
                }).catch(err => console.log('Catch', err)));
            }
            // Una vez que estén resueltas todas las promesas, devuelvo el resultado
            Promise.all(promises).then(() => {
                success(result);
            }).catch(err => console.log('Catch', err));
        });
    }

    /**
     * TODO
     */
    registerImgErrorEvents_(html) {
        let imgElements = html.querySelectorAll('img');
        Array.prototype.forEach.call(imgElements, (imgElem) => {
            imgElem.addEventListener("error", (evt) => {
                let id = evt.target.getAttribute('data-id');
                let layer = this.findLayerById(id);
                let legendErrorUrl = M.utils.concatUrlPaths([M.config.THEME_URL, M.Layer.LEGEND_ERROR]);
                if (!M.utils.isNullOrEmpty(layer)) {
                    layer.setLegendURL(legendErrorUrl);
                    evt.target.src = legendErrorUrl;
                }
            });
        });
    }

    /**
     * This function checks if an object is equals
     * to this control
     *
     * @public
     * @function
     * @param {*} obj - Object to compare
     * @returns {boolean} equals - Returns if they are equal or not
     * @api stable
     */
    equals(obj) {
        let equals = false;
        if (obj instanceof ActiveLayersControl) {
            equals = (this.name === obj.name);
        }
        return equals;
    }

    //Establece la configuracion para las capas al mostrar toc de elementos activos
    setConfigLayers() {

        //Para las capas activas: Establecer configuracion para visualizacion en toc capas activas
        let layers = this.map_.getLayers();
        layers.forEach((layer, index) => {
            if (M.utils.isUndefined(layer.options))
                layer.options = {};

            //ID: Si no tiene establecemos el nombre de la capa
            if (M.utils.isNullOrEmpty(layer.id)) {
                layer.id = (this.countID_++) + '_' + layer.name;
            }
            //Origen de la capa: si no se indica, establecemos por defecto que es desde la creacion inicial del mapa
            if (M.utils.isNullOrEmpty(layer.options.origen))
                layer.options.origen = 'Inicial';

            //Leyenda: Establecer url de leyenda si se indica
            if (!M.utils.isNullOrEmpty(layer.options.urlLegend)) {
                layer.setLegendURL(layer.options.urlLegend);
            }

            /*  //Capas WMS: podemos utilizar parametros y asi poder cargar WMS con mismo name de capa
             if (layer.type === M.layer.type.WMS || layer.type === M.layer.type.WMTS) {
                 //FIXME: Correcion NUCLEO MAPEA: Tener en cuenta parametro styles para la obtencion de la leyenda
                 layer.getImpl().getStylesLayer();
             } */
        });
    }

    /*     setOrderLayers() {
            //Dejamos margen entre posBase y posDisplay para elementos cargados pero no gestionables desde el gestor de capas
            let posicion = 0;
            //Capas activas (Las retorna ordenadas por zindex)
            let layers = this.map_.getLayers();
            console.log("------------- Nueva lista ----------");
            //Para cada capa cargada establecer posicion segun visualizacion en pantalla
            layers.forEach((layer, zIndex) => {
                let isBaseMap = (layer.isBaseMap === true);
                let isDrawLayer = (layer.name === '__draw__');
                let isTransparent = (layer.transparent === true);
                let displayInLayerSwitcher = (layer.displayInLayerSwitcher === true);
                let isNotWMC = (layer.type !== M.layer.type.WMC);
                let isNotWMSFull = !((layer.type === M.layer.type.WMS) && M.utils.isNullOrEmpty(layer.name));

                //Mapa base
                if (isBaseMap) {
                    console.log("Base Index:" + layer.getImpl().getZIndex() + " " + layer.legend);
                    this.getImpl().updateOrderLayer(layer, 0);
                } else if (!isBaseMap && !isDrawLayer && isTransparent && isNotWMC && isNotWMSFull && displayInLayerSwitcher) {
                    posicion++;
                    console.log("Index:" + layer.getImpl().getZIndex() + " " + layer.legend);
                    //Actualizar posicion de la capa
                    this.getImpl().updateOrderLayer(layer, posicion);
                }

            });
        } */

    arraymove(arr, fromIndex, toIndex) {
        let element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    }

    buildTemplateVar(templateVariables) {
        this.mapeaLayerGroup = []
        for (let index = 0; index < templateVariables.length; index++) {
            const element = templateVariables[index];

            if (this.mapeaLayerGroup.findIndex(x => x.id === element.groupId) === -1) {
                this.mapeaLayerGroup.push({
                    id: element.groupId,
                    title: element.groupTitle,
                    collapsed: false,
                    layerVisibility: this.checkGroupLayerVisibility(element.groupId),
                    overlayLayers: [element]
                })
            } else {
                let overlayLayers = this.mapeaLayerGroup[this.mapeaLayerGroup.findIndex(x => x.id === element.groupId)].overlayLayers
                overlayLayers.push(element)
            }
        }
        //Si existe el grupo otras Capas se mueve al último lugar
        if (this.mapeaLayerGroup.findIndex(x => x.id === this.defaultIdGroup) != -1) {
            this.arraymove(this.mapeaLayerGroup, this.mapeaLayerGroup.findIndex(x => x.id === this.defaultIdGroup), this.mapeaLayerGroup.length - 1)
        }

        let result;

        // si existe el grupo de capas por defecto y hay mas de un grupo
        if (this.mapeaLayerGroup.findIndex(x => x.id === this.defaultIdGroup) != -1 && this.mapeaLayerGroup.length > 1) {
            result = {
                vars: {
                    layersGroups: this.mapeaLayerGroup
                }
            }
        }
        // en caso de que solo exista el grupo por defecto
        else if (this.mapeaLayerGroup.findIndex(x => x.id === this.defaultIdGroup) != -1 && this.mapeaLayerGroup.length == 1) {
            result = {
                vars: {
                    overlayLayers: this.mapeaLayerGroup[this.mapeaLayerGroup.findIndex(x => x.id === this.defaultIdGroup)].overlayLayers
                }
            }
        }
        // en caso de que no exista grupo por defecto pero si existan grupos
        else if ((this.mapeaLayerGroup.findIndex(x => x.id === this.defaultIdGroup) == -1 && this.mapeaLayerGroup.length >= 1)) {
            result = {
                vars: {
                    layersGroups: this.mapeaLayerGroup
                }
            }
        }
        // no existen capas de overlay
        else {
            result = {
                vars: null
            }
        }
        return result
    }

    checkTemplateVaribles(templateVariables) {
        if (templateVariables.length - this.templateVariables.length < 0) {
            for (let index = 0; index < this.templateVariables.length; index++) {
                const element = this.templateVariables[index];
                if (templateVariables.findIndex(x => x.id === element.id) == -1) {
                    this.templateVariables.splice(index, 1)
                }
            }
        }
        if (templateVariables.length - this.templateVariables.length > 0) {
            for (let index = 0; index < templateVariables.length; index++) {
                const element = templateVariables[index];
                if (this.templateVariables.findIndex(x => x.id === element.id) == -1) {
                    if (this.templateVariables.findIndex(x => x.groupId === element.groupId) == -1) {
                        element.hide = true
                    } else {
                        element.hide = this.templateVariables[this.templateVariables.findIndex(x => x.groupId === element.groupId)].hide
                    }
                    this.templateVariables.push(element)
                }
            }
        }
    }

    MakeQuerablePromise(promise) {
        // Don't modify any promise that has been already modified.
        if (promise.isFulfilled) return promise;
        // Set initial state
        var isPending = true;
        var isRejected = false;
        var isFulfilled = false;
        // Observe the promise, saving the fulfillment in a closure scope.
        var result = promise.then(
            function (v) {
                isFulfilled = true;
                isPending = false;
                return v;
            },
            function (e) {
                isRejected = true;
                isPending = false;
                throw e;
            }
        );
        result.isFulfilled = () => { return isFulfilled; };
        result.isPending = () => { return isPending; };
        result.isRejected = () => { return isRejected; };
        return result;
    }

    checkLayerTypeVector(layer) {
        let type = false
        if (layer instanceof M.layer.Vector) {
            type = true
        }
        return type
    }

    //generación de leyenda capas vectoriales
    setVectorLegend(templateVariables) {
        let legend
        for (let index = 0; index < templateVariables.length; index++) {
            const element = templateVariables[index];
            let layer = this.findLayerById(element.id);
            layer.on(M.evt.CHANGE_STYLE, () => {
                if (this.checkLayerTypeVector(layer)) {
                    let estilo = layer.getStyle();
                    legend = estilo.toImage();
                    if (legend instanceof Promise) {
                        let myPromise = this.MakeQuerablePromise(legend);
                        myPromise.then((data) => {
                            const optionsTocLayer = document.getElementById('optionsTocLayer_' + layer.id);
                            if (optionsTocLayer != undefined) {
                                let image = optionsTocLayer.getElementsByTagName('img')[0]
                                image.src = data
                            }
                            layer.setLegendURL(data)
                            element.legend=data
                        })
                    } else {
                        element.legend=legend
                        layer.setLegendURL(legend)
                    }
                }
            })
        }
    }
}
