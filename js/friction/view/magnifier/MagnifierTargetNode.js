// Copyright 2013-2019, University of Colorado Boulder

/**
 * View for magnifier's target, this includes the dashed traces up to the magnified view
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} cornerRadius - corner radius for the rectangle (in X and Y)
   * @param {Vector2} leftAnchor - point on the magnifier to draw the left dashed line to
   * @param {Vector2} rightAnchor - point on the magnifier to draw the right dashed line to
   * @param {Object} [options]
   * @constructor
   */
  function MagnifierTargetNode( x, y, width, height, cornerRadius, leftAnchor, rightAnchor, options ) {

    options = merge( {
      stroke: 'black'
    }, options );

    Node.call( this );

    const rectangle = new Rectangle( 0, 0, width, height, cornerRadius, cornerRadius, {
      stroke: options.stroke,
      lineWidth: 1
    } );
    this.addChild( rectangle );
    const pathLeft = new Path( new Shape()
      .moveToPoint( leftAnchor )
      .lineTo( x - width / 2, y ), {
      stroke: options.stroke,
      lineDash: [ 10, 10 ]
    } );
    this.addChild( pathLeft );
    const pathRight = new Path( new Shape()
      .moveToPoint( rightAnchor )
      .lineTo( x + width / 2, y ), {
      stroke: options.stroke,
      lineDash: [ 10, 10 ]
    } );
    this.addChild( pathRight );

    rectangle.setTranslation( x - width / 2, y - height / 2 );
  }

  friction.register( 'MagnifierTargetNode', MagnifierTargetNode );

  return inherit( Node, MagnifierTargetNode );
} );