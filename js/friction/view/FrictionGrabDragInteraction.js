// Copyright 2018-2019, University of Colorado Boulder

/**
 * A wrapping type around A11yGrabDragNode that handles the alerts consistently for both book grab buttons.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const GrabDragInteraction = require( 'SCENERY_PHET/accessibility/GrabDragInteraction' );
  const merge = require( 'PHET_CORE/merge' );
// a11y strings
  const initialGrabbedNotTouchingString = FrictionA11yStrings.initialGrabbedNotTouching.value;
  const grabbedNotTouchingString = FrictionA11yStrings.grabbedNotTouching.value;
  const initialGrabbedTouchingString = FrictionA11yStrings.initialGrabbedTouching.value;
  const grabbedTouchingString = FrictionA11yStrings.grabbedTouching.value;

  // constants
  const touchingAlerts = { initial: initialGrabbedTouchingString, subsequent: grabbedTouchingString };
  const notTouchingAlerts = { initial: initialGrabbedNotTouchingString, subsequent: grabbedNotTouchingString };

  /**
   * @param {FrictionModel} model
   * @param {Node} wrappedNode
   * @param {Object} options
   * @constructor
   */
  class FrictionGrabDragInteraction extends GrabDragInteraction {

    constructor( model, wrappedNode, options ) {
      options = merge( {

        // Function that returns whether or not the drag cue should be shown.
        successfulDrag: () => {
          return !model.topBookPositionProperty.value.equals( model.topBookPositionProperty.initialValue );
        }
      }, options );

      // Keep track of the passed in grab listener, to add to it below
      const oldGrab = options.onGrab;

      // Wrap the onGrab option in default functionality for al of the type in Friction
      options.onGrab = () => {
        oldGrab && oldGrab();

        const alerts = model.contactProperty.get() ? touchingAlerts : notTouchingAlerts;

        let alert = alerts.initial;
        if ( this.successfullyInteracted ) {
          alert = alerts.subsequent;
        }
        phet.joist.sim.utteranceQueue.addToBack( alert );
      };

      super( wrappedNode, options );

      // @private
      this.successfullyInteracted = false; // Keep track when an interaction has successfully occurred.
      this.model = model;
      this.amplitudeListener = amplitude => {
        if ( !this.successfullyInteracted && amplitude > FrictionModel.AMPLITUDE_SETTLED_THRESHOLD ) {
          this.successfullyInteracted = true;
        }
      };
      model.vibrationAmplitudeProperty.link( this.amplitudeListener );
    }

    /**
     * Reset the utterance singleton
     * @public
     * @override
     */
    reset() {
      super.reset();
      this.successfullyInteracted = false;
    }

    /**
     * @public
     * @override
     */
    dispose() {
      this.model.vibrationAmplitudeProperty.unlink( this.amplitudeListener );
    }
  }

  return friction.register( 'FrictionGrabDragInteraction', FrictionGrabDragInteraction );
} );