// Copyright 2016-2019, University of Colorado Boulder

/**
 * This is an optimization that uses a CanvasNode to draw the atoms.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  const friction = require( 'FRICTION/friction' );
  const FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  const inherit = require( 'PHET_CORE/inherit' );
  const ShadedSphereNode = require( 'SCENERY_PHET/ShadedSphereNode' );

  // constants
  const PARTICLE_IMAGE_SIZE = 32; // pixels, square
  const ATOM_NODE_LINE_WIDTH = 2;
  const HIGHLIGHT_FACTOR = 0.7;
  const ATOM_STROKE = 'black';

  // image size - this is tweaked slightly to account for stroke and to get behavior that is consistent with
  // previous versions of the sim
  const PARTICLE_IMAGE_SIZE_FOR_RENDERING = FrictionConstants.ATOM_RADIUS * 2 * 1.2;
  const PARTICLE_RENDERING_OFFSET = -PARTICLE_IMAGE_SIZE_FOR_RENDERING / 2;

  /**
   * @param {Object} [options]
   * @constructor
   */
  function AtomCanvasNode( atoms, options ) {

    const self = this;
    CanvasNode.call( this, options );

    // create the Scenery image nodes that will be drawn onto the canvas in order to render the atoms
    const topBookAtomNode = new ShadedSphereNode( PARTICLE_IMAGE_SIZE, {
      mainColor: FrictionConstants.TOP_BOOK_ATOMS_COLOR,
      highlightColor: FrictionConstants.TOP_BOOK_ATOMS_COLOR.colorUtilsBrighter( HIGHLIGHT_FACTOR ),
      stroke: ATOM_STROKE,
      lineWidth: ATOM_NODE_LINE_WIDTH
    } );
    topBookAtomNode.toCanvas( function( image ) {
      self.topBookAtomImage = image;
    } );

    const bottomBookAtomNode = new ShadedSphereNode( PARTICLE_IMAGE_SIZE, {
      mainColor: FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR,
      highlightColor: FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR.colorUtilsBrighter( HIGHLIGHT_FACTOR ),
      stroke: ATOM_STROKE,
      lineWidth: ATOM_NODE_LINE_WIDTH
    } );
    bottomBookAtomNode.toCanvas( function( image ) {
      self.bottomBookAtomImage = image;
    } );

    // @private {Atom[]} - array that holds the atoms to be rendered
    this.atoms = atoms;

    // @private - reusable position values, saves memory allocations
    this.axomPositionX = 0;
    this.atomPositionY = 0;
  }

  friction.register( 'AtomCanvasNode', AtomCanvasNode );

  return inherit( CanvasNode, AtomCanvasNode, {

    /**
     * paints the particles on the canvas node
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {

      // render each of the atoms to the canvas
      for ( let i = 0; i < this.atoms.length; i++ ) {
        const atom = this.atoms[ i ];
        const atomPosition = atom.positionProperty.get();
        const sourceImage = atom.isTopAtom ? this.topBookAtomImage : this.bottomBookAtomImage;
        context.drawImage(
          sourceImage,
          atomPosition.x + PARTICLE_RENDERING_OFFSET,
          atomPosition.y + PARTICLE_RENDERING_OFFSET,
          PARTICLE_IMAGE_SIZE_FOR_RENDERING,
          PARTICLE_IMAGE_SIZE_FOR_RENDERING
        );
      }
    }

  } );
} );