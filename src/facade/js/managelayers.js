/**
 * @module M/plugin/ManageLayers
 */
import 'assets/css/managelayers';
import api from '../../api.json';
import MapeaCoreExtension from './_mapea_core_extension.js';
import ActiveLayersControl from './activelayersControl.js';
import BaseLayersControl from './baselayersControl.js';
import ThematicLayersControl from './thematiclayersControl.js';
import template from 'templates/template_managelayers_toolbar';


export default class ManageLayers extends M.Plugin {


  /**
   * Name to identify this plugin
   * @const
   * @type {string}
   * @public
   * @api stable
   */
  static get NAME() {
    return 'ManageLayers';
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
   * Main facade plugin object. This class creates a plugin
   * object which has an implementation Object
   *
   * @constructor
   * @extends {M.Plugin}
   * @param {Object} impl implementation object
   * @api stable
   */
  constructor(parameters) {

    super();
    this.name = ManageLayers.NAME;
    /**
     * Facade of the map
     * @private
     * @type {M.Map}
     */
    this.map_ = null;

    /**
     * Array of controls
     * @private
     * @type {Array<M.Control>}
     */
    this.controls_ = [];

    //Proceso de parametros enviados
    parameters = parameters || {};

    this.config_ = parameters.config || {};
    /**
     * Params config control
     * Configuracion por defecto:

     * @private
     * @type {object}
     */
    this.params_ = parameters.params || {};

    /**
     * Metadata from api.json
     * @private
     * @type {Object}
     */
    this.metadata_ = api.metadata;

    /**
     * Options of the controls
     * Configuracion por defecto: (panel tools de mapea, si exite NO se crea)
       panel: {
         {String} name: 		'managelayers',
         {String} className: 	'm-managelayers',
         {String} iconClass: 	'g-cartografia-capas2',
         {String} position:  	 M.ui.position.TR,
         {String} tooltip: 		'Gestor de capas'
       }
     * @private
     * @type {object}
     */
    this.options_ = parameters.options || {};


    //FIXME: Correcion de partes del nucleo de mapea para el proceso de capabilities
    MapeaCoreExtension.overrideMapeaCore();
    //FIXME: Correcion nucleo mapea: Establecemos gestion de layers mediante IDs
    MapeaCoreExtension.initMapeaCoreExtension(this);

  }

  /**
   * This function adds this plugin into the map
   *
   * @public
   * @function
   * @param {M.Map} map the map to add the plugin
   * @api stable
   */
  addTo(map) {
    //Asignar el mapa
    this.map_ = map;
    //Creamos toolbar plugin: contiene todos los controles del plugin
    let html = this.createView(map);
      //Configuracion de la toolbar
      this.toolbar_ = {
        target: html,
        selector: '#toolbar-' + (ManageLayers.NAME).toLowerCase(),
        selectorBtn: '.m-toolbar-buttons',
        selectorContainer: '.m-toolbar-containers'
      };
      //Inicializar controles en toolbar cuando este cargado el mapa
      this.map_.once(M.evt.COMPLETED, () => {
        //Cargar si se indica configuracion para metadatos
        //M.remote.get (url, data, options)
        if (!M.utils.isNullOrEmpty(this.params_.metadata)) {
          M.remote.get(this.params_.metadata, null, {
            "jsonp": false
          }).then((response) => {
            if (response.error === false) {
              //let data = response.text;
              //let results = JSON.parse(data);
            } else {
              M.dialog.error("Se ha producido un error al cargar la configuración de metadatos", "Configuración metadatos");
            }

            //Cargamos controles
            this.initControls();
          });
        } else //Cargamos controles
          this.initControls();
      });
  }

  getConfigControl(name) {
    let config = this.config_[name] || {};
    config.params = config.params || {};
    config.options = config.options || {};
    config.options.toolbar = this.toolbar_;
    return config;
  }

  initControls() {
    let ctrol = null;
    let config = null;

    //Capas activas
    config = this.getConfigControl('activeLayers');
    ctrol = new ActiveLayersControl(config.params, config.options);
    this.addControlToPlugin_(ctrol);

    //Mapas base
    config = this.getConfigControl('baseLayers');
    ctrol = new BaseLayersControl(config.params, config.options);
    this.addControlToPlugin_(ctrol);

    //Capas tematicas(favoritas)
    config = this.getConfigControl('thematicLayers');
    ctrol = new ThematicLayersControl(config.params, config.options);
    this.addControlToPlugin_(ctrol);

    /* //Capas WMC
    config = this.getConfigControl('wmcLayers');
    ctrol = WMCLayersControl(config.params, config.options);
    this.addControlToPlugin_(ctrol); */


    //Creamos para el plugin
    this.panel_ = this.getPanel_();
    // Asignar los controles al panel y el panel al mapa
    this.panel_.addControls(this.controls_);
    this.panel_.on(M.evt.ADDED_TO_MAP, () =>
      this.fire(M.evt.ADDED_TO_MAP)
    );
    this.map_.addPanels(this.panel_);
  }

  createView(map) {
    if (!M.template.compileSync) { // JGL: retrocompatibilidad Mapea4
      M.template.compileSync = (string, options) => {
        let templateCompiled;
        let templateVars = {};
        let parseToHtml;
        if (!M.utils.isUndefined(options)) {
          templateVars = M.utils.extends(templateVars, options.vars);
          parseToHtml = options.parseToHtml;
        }
        const templateFn = Handlebars.compile(string);
        const htmlText = templateFn(templateVars);
        if (parseToHtml !== false) {
          templateCompiled = M.utils.stringToHtml(htmlText);
        } else {
          templateCompiled = htmlText;
        }
        return templateCompiled;
      };
    }

    return M.template.compileSync(ManageLayers.TEMPLATE, {
      //'jsonp' : true
    });
  }


  addControlToPlugin_(ctrol) {
    //Al activar el control: refrescar panel
    ctrol.on(M.evt.ACTIVATED, () => {
      ctrol.render();
    });
    //Annadir control
    this.controls_.push(ctrol);
  }

  getPanel_() {
    //Comprobar si el panel existe
    let name = ((!M.utils.isNullOrEmpty(this.options_.panel) && !M.utils.isNullOrEmpty(this.options_.panel.name)) ? this.options_.panel.name : 'managelayers');
    let panel = this.map_.getPanels(name)[0];
    //Si no existe lo creamos
    if (M.utils.isNullOrEmpty(panel)) {
      panel = new M.ui.Panel(name, this.getPanelOptions_());
      panel.on(M.evt.ADDED_TO_MAP, (html) => {
        M.utils.enableTouchScroll(html);
      });
      //Al mostrar el panel siempre activar control de capas activas
      panel.on(M.evt.SHOW, (evt) => {
        // Recorro todos los controles del panel.Si ninguno esta activo se activa el de capas activas
        let ctrlActive = false, ctrls = this.getControls();
        for (let i = 0; i < ctrls.length; i++) {
          if (ctrls[i].activated) {
            ctrlActive = true;
            break;
          }
        }
        if (!ctrlActive) {
          let ctrol = this.map_.getControls(ActiveLayersControl.NAME)[0];
          ctrol.activate();
        }

      });
    }

    return panel;
  }

  /**
   * Control panel configuration options
   *
   * @public
   * @function
   * @api stable
   */
  getPanelOptions_() {
    let opt_ = {};
    if (!M.utils.isNullOrEmpty(this.options_.panel))
      opt_ = this.options_.panel;

    let panelOptions_ = {
      collapsible: true,
      className: 'm-managelayers' + ((!M.utils.isNullOrEmpty(opt_.className)) ? (' ' + opt_.className) : ''),
      collapsedButtonClass: ((!M.utils.isNullOrEmpty(opt_.collapsedClass)) ? opt_.collapsedClass : 'g-cartografia-capas2'),
      position: ((!M.utils.isNullOrEmpty(opt_.position)) ? opt_.position : M.ui.position.TR),
      tooltip: ((!M.utils.isNullOrEmpty(opt_.tooltip)) ? opt_.tooltip : 'Gestor de capas')
    };
    return panelOptions_;
  }


  getControls() {
    return this.controls_;
  }

  /**
   * This function destroys this plugin
   *
   * @public
   * @function
   * @api stable
   */
  destroy() {
    this.map_.removeControls(this.controls_);
    this.map_ = null;
    this.controls_ = null;
    this.panel_ = null;
    this.params_ = null;
    this.options_ = null;
    this.name = null;
  }

  /**
   * This function compare if pluging recieved by param is instance of   this
   *
   * @public
   * @function
   * @param {M.plugin} plugin to comapre
   * @api stable
   */
  equals(plugin) {
    let equals = false;
    if (plugin instanceof ManageLayers) {
      equals = true;
    }
    return equals;
  }

  /**
   * This function gets metadata plugin
   *
   * @public
   * @function
   * @api stable
   */
  getMetadata(){
    return this.metadata_;
  }
}
