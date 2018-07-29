// Copyright 2013-2018, University of Colorado Boulder

/**
 * Friction's ScreenView
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BookNode = require( 'FRICTION/friction/view/book/BookNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ControlPanelNode = require( 'SCENERY_PHET/accessibility/nodes/ControlPanelNode' );
  var friction = require( 'FRICTION/friction' );
  var FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  var FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MagnifierNode = require( 'FRICTION/friction/view/magnifier/MagnifierNode' );
  var PlayAreaNode = require( 'SCENERY_PHET/accessibility/nodes/PlayAreaNode' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );
  var Node = require( 'SCENERY/nodes/Node' );

  // strings
  var chemistryString = require( 'string!FRICTION/chemistry' );
  var physicsString = require( 'string!FRICTION/physics' );

  // constants
  var THERMOMETER_FLUID_MAIN_COLOR = 'rgb(237,28,36)';
  var THERMOMETER_FLUID_HIGHLIGHT_COLOR = 'rgb(240,150,150)';
  var THERMOMETER_FLUID_RIGHT_SIDE_COLOR = 'rgb(237,28,36)';
  var THERMOMETER_BACKGROUND_FILL_COLOR = 'white';

  /**
   * @param {FrictionModel} model
   * @param {Tandem} tandem
   * @constructor
   */
  function FrictionScreenView( model, tandem ) {
    ScreenView.call( this, {
      layoutBounds: new Bounds2( 0, 0, model.width, model.height ),
      includePDOMSummary: true // opt into the generic sceneoverview strategy provided by ScreenView.js see https://github.com/phetsims/joist/issues/509
    } );

    assert && assert( this.sceneOverview instanceof Node );
    addSceneOverview( this.sceneOverview );


    // add physics book
    this.addChild( new BookNode( model, physicsString, {
      x: 50,
      y: 225,
      tandem: tandem.createTandem( 'physicsBookNode' )
    } ) );

    // add chemistry book
    var chemistryBookNode = new BookNode( model, chemistryString, {
      x: 65,
      y: 209,
      color: FrictionConstants.TOP_BOOK_COLOR_MACRO,
      drag: true,
      tandem: tandem.createTandem( 'chemistryBookNode' )
    } );
    this.addChild( chemistryBookNode );

    // @private - add magnifier
    this.magnifierNode = new MagnifierNode( model, 195, 425, chemistryString, tandem.createTandem( 'magnifierNode' ), {
      x: 40,
      y: 25,
      layerSplit: true
    } );
    this.addChild( this.magnifierNode );

    // add thermometer
    this.addChild( new ThermometerNode(
      FrictionModel.MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min - 1.05,
      FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit * 1.1,
      model.amplitudeProperty,
      {
        x: 690,
        y: 250,
        tubeHeight: 160,
        tickSpacing: 9,
        lineWidth: 1,
        tubeWidth: 12,
        bulbDiameter: 24,
        majorTickLength: 4,
        minorTickLength: 4,
        fluidMainColor: THERMOMETER_FLUID_MAIN_COLOR,
        fluidHighlightColor: THERMOMETER_FLUID_HIGHLIGHT_COLOR,
        fluidRightSideColor: THERMOMETER_FLUID_RIGHT_SIDE_COLOR,
        backgroundFill: THERMOMETER_BACKGROUND_FILL_COLOR
      }
    ) );

    var playAreaNode = new PlayAreaNode();
    this.addChild( playAreaNode );
    playAreaNode.accessibleOrder = [ chemistryBookNode, this.magnifierNode ];

    // add reset button
    var resetAllButton = new ResetAllButton( {
      listener: function() { model.reset(); },
      radius: 22,
      x: model.width * 0.94,
      y: model.height * 0.9,
      touchAreaDilation: 12,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    var controlAreaNode = new ControlPanelNode();
    this.addChild( controlAreaNode );
    controlAreaNode.accessibleOrder = [ resetAllButton ];
  }

  friction.register( 'FrictionScreenView', FrictionScreenView );

  function addSceneOverview( overviewNode ) {

    // TODO: use pattern and factor out string
    overviewNode.addChild( new Node( {
      tagName: 'p',
      innerContent: 'A Chemistry book rests on top of a Physics book, and is ready to be rubbed against it. ' +
                    'In a zoomed-in view of where books meet, atoms jiggle {{a tiny bit}}, and a thermometer is ' +
                    '{{at cool}}. Move Chemistry book to rub books together.'
    } ) );

    // TODO: factor this out into its own type in ScreenView
    overviewNode.addChild( new Node( {
      tagName: 'p',
      innerContent: 'If needed, check out keyboard shortcuts under Sim Resources.'
    } ) );
  }

  return inherit( ScreenView, FrictionScreenView, {

    /**
     * move forward in time
     * @param {number} dt - delta time, in seconds
     * @public
     */
    step: function( dt ) {
      this.magnifierNode.step( dt );
    }
  } );
} );
