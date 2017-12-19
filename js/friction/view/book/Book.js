// Copyright 2013-2017, University of Colorado Boulder

/**
 * Container for single book.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var Cover = require( 'FRICTION/friction/view/book/Cover' );
  var FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  var friction = require( 'FRICTION/friction' );
  var FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  var FrictionKeyboardDragHandler = require( 'FRICTION/friction/view/FrictionKeyboardDragHandler' );
  var FrictionSharedConstants = require( 'FRICTION/friction/FrictionSharedConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // a11y strings
  var bookTitleStringPattern = FrictionA11yStrings.bookTitleStringPattern.value;

  /**
   * Constructor
   *
   * @param {FrictionModel} model
   * @param {number} x
   * @param {number} y
   * @param {string} title - title that appears on the book spine
   * @param {Object} options
   */
  function Book( model, x, y, title, options ) {
    var self = this;
    var dndScale = model.dndScale;

    options = _.extend( {

      // whether or not we can drag the book
      drag: false,
      color: FrictionSharedConstants.BOTTOM_BOOK_COLOR_MACRO
    }, options );

    Node.call( this, options );

    // position the book
    this.x = x;
    this.y = y;

    // add cover
    this.addChild( new Cover( x, y, title, options ) );

    // init drag and a11y options for the draggable book
    if ( options.drag ) {

      // We want the focus highlight to be completely within the bounds of the book.
      var focusHighlightRect = new FocusHighlightPath( null );
      var focusHighlightLineWidth = focusHighlightRect.getOuterLineWidth( this );
      focusHighlightRect.setShape( Shape.bounds( this.localBounds.eroded( focusHighlightLineWidth / 2 ) ) );

      this.addChild( focusHighlightRect );

      // add a11y options for the interactive Book
      this.mutate( {
        tagName: 'div',
        parentContainerAriaRole: 'application',
        parentContainerTagName: 'div',
        prependLabels: true,
        accessibleLabel: StringUtils.fillIn( bookTitleStringPattern, { bookTitle: title } ),
        focusable: true,
        focusHighlightLayerable: true,
        focusHighlight: focusHighlightRect
      } );

      // this node is labelledby its own label
      this.setAriaLabelledByNode( this );
      this.setAriaLabelledContent( AccessiblePeer.PARENT_CONTAINER );

      model.initDrag( this );

      // a11y - add a keyboard drag handler
      this.keyboardDragHandler = new FrictionKeyboardDragHandler( model );
      this.addAccessibleInputListener( this.keyboardDragHandler );

      // add observer
      model.positionProperty.link( function( v ) {
        self.setTranslation( x + v.x * dndScale, y + v.y * dndScale );
      } );
    }
  }

  friction.register( 'Book', Book );

  return inherit( Node, Book, {

    step: function( dt ) {

      // step the keyboard drag handler if one exists on this Book
      this.keyboardDragHandler && this.keyboardDragHandler.step( dt );
    }
  } );
} );
