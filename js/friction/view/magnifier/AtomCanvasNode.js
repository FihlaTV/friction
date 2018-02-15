// Copyright 2016-2018, University of Colorado Boulder

/**
 * This is an optimization that uses a CanvasNode to draw the atoms.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var friction = require( 'FRICTION/friction' );
  var FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants
  var PARTICLE_IMAGE_SIZE = 32; // pixels, square

  /**
   * @param {Object} [options]
   * @constructor
   */
  function AtomCanvasNode( options ) {

    CanvasNode.call( this, options );

    // create a canvas and render the particle images that will be used
    // TODO: why not render these with scenery and use Node.toImage? or toImageSynchronous?
    // TODO: or just use SphereNode.toImage?
    // TODO: see https://github.com/phetsims/friction/issues/71
    this.particleImageCanvas = document.createElement( 'canvas' );
    this.particleImageCanvas.width = PARTICLE_IMAGE_SIZE * 2; // wide enough to accommodate two particles // TODO: WHY?
    this.particleImageCanvas.height = PARTICLE_IMAGE_SIZE;

    // the particle radius must be a little smaller than half the image to allow space for the stroke
    var particleImageRadius = PARTICLE_IMAGE_SIZE * 0.47;

    // draw the circle that will be used for atoms in the top book onto the canvas
    var context = this.particleImageCanvas.getContext( '2d' );
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.fillStyle = FrictionConstants.TOP_BOOK_ATOMS_COLOR;
    context.beginPath();
    context.arc(
      PARTICLE_IMAGE_SIZE / 2,
      PARTICLE_IMAGE_SIZE / 2,
      particleImageRadius,
      0,
      Math.PI * 2
    );
    context.fill();
    context.stroke();

    // draw the circle that will be used for atoms in the bottom book onto the canvas
    context.fillStyle = FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR;
    context.beginPath();
    context.arc(
      PARTICLE_IMAGE_SIZE * 1.5,
      PARTICLE_IMAGE_SIZE / 2,
      particleImageRadius,
      0,
      Math.PI * 2
    );
    context.fill();
    context.stroke();

    // add the highlights for both atom images
    context.beginPath();
    context.fillStyle = 'white';
    context.arc(
      PARTICLE_IMAGE_SIZE * 0.65,
      PARTICLE_IMAGE_SIZE * 0.35,
      PARTICLE_IMAGE_SIZE * 0.12,
      0,
      Math.PI * 2
    );
    context.fill();
    context.beginPath();
    context.arc(
      PARTICLE_IMAGE_SIZE * 1.65,
      PARTICLE_IMAGE_SIZE * 0.35,
      PARTICLE_IMAGE_SIZE * 0.12,
      0,
      Math.PI * 2
    );
    context.fill();

    // @private - array that holds the Atoms
    this.atomCanvasNodeAtoms = [];

    var self = this;
    setInterval( function() {
      self.invalidatePaint();
    }, 10 );
  }

  friction.register( 'AtomCanvasNode', AtomCanvasNode );

  return inherit( CanvasNode, AtomCanvasNode, {

    /**
     * Paints the particles on the canvas node
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {

      // image width - this is tweaked slightly to account for stroke and to get behavior that is consistent with
      // previous versions of the sim
      var particleImageSize = FrictionConstants.ATOM_RADIUS * 2 * 1.1;

      // render each of the atoms on the canvas
      for ( var i = 0; i < this.atomCanvasNodeAtoms.length; i++ ) {
        var atom = this.atomCanvasNodeAtoms[ i ];
        context.drawImage(
          this.particleImageCanvas,
          atom.isTopAtom ? 0 : PARTICLE_IMAGE_SIZE,
          0,
          PARTICLE_IMAGE_SIZE,
          PARTICLE_IMAGE_SIZE,
          atom.positionProperty.get().x - particleImageSize / 2,
          atom.positionProperty.get().y - particleImageSize / 2,
          particleImageSize,
          particleImageSize
        );
      }
    },

    /**
     * When an Atom is created, we want a reference so we can quickly scan a list of atoms
     * @param atom
     * @public
     */
    registerAtom: function( atom ) {
      this.atomCanvasNodeAtoms.push( atom );
    }
  } );
} );