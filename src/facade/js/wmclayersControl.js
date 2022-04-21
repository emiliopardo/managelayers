/**
 * @module M/control/WMCLayersControl
 */
import ManageLayersControl from './managelayerscontrol.js';
import ManageLayersImplControl from 'impl/managelayerscontrol';
import template from 'templates/wmclayers';

export default class WMCLayersControl extends ManageLayersControl {


    /**
     * Name to identify this control
     * @const
     * @type {string}
     * @public
     * @api stable
     */
    static get NAME() {
        return 'WMCLayers';
    }

    /**
     * Name to identify url template
     * @const
     * @type {string}
     * @public
     * @api stable
     */
    static get TEMPLATE() {
        return template;
    }

    /**
     * @classdesc
     * Main constructor of the class. Creates a WMCLayersControl
     * control
     *
     * @constructor
     * @extends {M.Control}
     * @api stable
     */
    constructor(params, options) {

        // 2. implementation of this control
        let impl = new ManageLayersImplControl(params);

        let opt_ = {
            controlName: WMCLayersControl.NAME,
            iconClass: 'g-cartografia-capas',
            tooltip: 'Capas WMC'
        };
        // Se annaden los parametros de control a las opciones
        options = M.utils.extend(opt_, options, true);

        super(impl, params, options);

        /**
         * Params of the control
         * @private
         * @type {params}
         */
        this.params_ = params || {};

    }

    addTo(map) {
        super.addTo(map);
        //Proceso inicial si existe WMC cargado: mostrar capas
        this.wmc_ = this.getWMCSelected();
        this.render();
        //Evento recarga cuando se cambia WMC seleccionado
        this.map_.on(M.evt.CHANGE_WMC, (wmc) => {
            this.wmc_ = this.getWMCSelected();
            this.render();
        }, this);
    }

    getWMCSelected() {
        let lstWMC = this.map_.getWMC().filter((wmcLayer) => {
            return (wmcLayer.selected == true);
        });
        let wmc = ((lstWMC) ? lstWMC[0] : null);
        if (wmc) {
            //Establecemos id para cada capa
            wmc.layers.forEach((layer, index) => {
                if (M.utils.isNullOrEmpty(layer.id))
                    layer.id = 'WMC_' + index;
            });
        }
        return wmc;
    }

    render() {
        this.renderPanel();
    }

    renderPanel() {
        let html = M.template.compileSync(WMCLayersControl.TEMPLATE, {
            //'jsonp' : true,
            'vars': this.getTemplateVariables_()
        });
            this.getControlContainer_().innerHTML = html.innerHTML;

    }

    addEvents(html) {
        let content = html.querySelector(this.getSelectorContainer_());
        content.addEventListener("click", (evt) => this.clickWmcLayer(evt));
    }

    /**
     * Gets the variables of the template to compile
     */
    getTemplateVariables_() {
        if (!M.utils.isNullOrEmpty(this.wmc_)) {
            //Generar lista de capas del WMC
            let wmcLayers = this.wmc_.layers.filter((layer) => {
                //TODO: Mostrar todas las capas cargadas ...
                let isTransparent = true;
                let displayInLayerSwitcher = true;
                //let isTransparent = (layer.transparent === true);
                //let displayInLayerSwitcher = (layer.displayInLayerSwitcher === true);
                let isNotWMC = (layer.type !== M.layer.type.WMC);
                let isNotWMSFull = !((layer.type === M.layer.type.WMS) && M.utils.isNullOrEmpty(layer.name));
                return (isTransparent && isNotWMC && isNotWMSFull && displayInLayerSwitcher);
            }); //.reverse();

            return {
                'name': this.wmc_.name,
                'wmcLayers': wmcLayers.map(this.parseLayerForTemplate_, this)
            };
        } else {
            return {
                'name': '',
                'wmcLayers': []
            };
        }
    }


    /**
     * This function checks if an object is equals
     * to this control
     *
     * @private
     * @function
     */
    parseLayerForTemplate_(layer) {
        //Titulo capa
        let layerTitle = layer.legend;
        if (M.utils.isNullOrEmpty(layerTitle)) {
            layerTitle = layer.name;
        }
        if (M.utils.isNullOrEmpty(layerTitle)) {
            layerTitle = 'Servicio WMS';
        }
        //Establecer origen si no tiene
        if (M.utils.isNullOrEmpty(layer.options))
            layer.options = {};
        if (M.utils.isNullOrEmpty(layer.options.origen)) {
            layer.options.isWMC = true;
            layer.options.origen = 'WMC';
        }
        return {
            'id': layer.id,
            'name': layer.name,
            'title': layerTitle,
            'load': (this.isLoadLayer(layer) === true)
            //'base': (layer.transparent === false),
            //'visible' : (layer.isVisible() === true),
            //'legend' : layer.getLegendURL(),
            //'outOfRange' : !layer.inRange(),
            //'opacity' : layer.getOpacity()
        };
    }

    clickWmcLayer(evt) {
        evt = (evt || window.event);
        let itemTarget = evt.target;
        if (!M.utils.isNullOrEmpty(itemTarget)) {
            //Annadir/Eliminar todas los elementos del WMC
            if (itemTarget.classList.contains('m-accion-wmclayers-load-group')) {
                evt.stopPropagation();
                //Determinar accion y obtener elementos a procesar
                let selectorItems = ((itemTarget.classList.contains('g-cartografia-mas2')) ? 'input[type=checkbox]:not(:checked)' : 'input[type=checkbox]:checked');
                let itemsSelect = this.getControlContainer_().querySelectorAll(selectorItems);
                //Realizar operacion para los elementos seleccionados
                itemsSelect.forEach((item, index) => {
                    item.click();
                });
                //Actualizar estado accion de grupo
                itemTarget.classList.toggle('g-cartografia-mas2');
                itemTarget.classList.toggle('g-cartografia-cancelar2');
                itemTarget.title = ((itemTarget.classList.contains('g-cartografia-mas2')) ? 'Añadir todas las capas' : 'Eliminar todas las capas');
            } else {
                let id = itemTarget.getAttribute('data-id');
                if (!M.utils.isNullOrEmpty(id)) {
                    evt.stopPropagation();
                    //Obtenemos del WMC cargado los datos de la capa
                    let layer = this.findItemByProperty(this.wmc_.layers, 'id', id);
                    //Annadir/Eliminar capa
                    if (itemTarget.classList.contains('m-accion-wmclayers-load')) {
                        let isLoad = this.isLoadLayer(layer);
                        if (isLoad === true) {
                            this.removeLayers(layer);
                            this.resetOptionsManageLayers(layer);
                        } else
                            this.addLayers(layer);
                    }
                }
            }
        }
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
        if (obj instanceof WMCLayersControl) {
            equals = (this.name === obj.name);
        }
        return equals;
    }

}