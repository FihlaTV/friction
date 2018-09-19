// Copyright 2018, University of Colorado Boulder

/**
 * Describer responsible for handling the appropriate alert when atoms evaporate, or "break away" from the top book.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( ( require ) => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const FrictionQueryParameters = require( 'FRICTION/friction/FrictionQueryParameters' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const timer = require( 'PHET_CORE/timer' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );

  // a11y strings
  const capitalizedVeryHotString = FrictionA11yStrings.capitalizedVeryHot.value;
  const breakAwaySentenceFirstString = FrictionA11yStrings.breakAwaySentenceFirst.value;
  const breakAwaySentenceAgainString = FrictionA11yStrings.breakAwaySentenceAgain.value;

  // constants

  // break away sentences
  const BREAK_AWAY_THRESHOLD_FIRST = StringUtils.fillIn( breakAwaySentenceFirstString, { temp: capitalizedVeryHotString } );
  const BREAK_AWAY_THRESHOLD_AGAIN = StringUtils.fillIn( breakAwaySentenceAgainString, { temp: capitalizedVeryHotString } );

  // time in between "break away sessions". This is the minimum amount of time to wait before hearing a subsequent break
  // away alert
  const ALERT_TIME_DELAY = FrictionQueryParameters.breakAwayAlertTimeDelay;

  const EVAPORATION_LIMIT = FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit;


  // the singleton instance of this describer, used for the entire instance of the sim.
  let describer = null;

  /**
   * Responsible for alerting when the temperature increases
   * @param {Object} [options]
   * @constructor
   */
  class BreakAwayDescriber {
    constructor( model ) {

      // @private
      this.model = model;


      // @private - (a11y) true if there has already been an alert about atoms breaking away
      this.alertedBreakAwayProperty = new BooleanProperty( false );

      // private
      this.tooSoonForNextAlert = false;

      // @private
      this.amplitudeListener = ( amplitude, oldAmplitude ) => {

        // Handle the alert when amplitude is high enough to begin evaporating
        if ( !this.tooSoonForNextAlert && // alert only separate "break away events"
             amplitude > EVAPORATION_LIMIT && oldAmplitude < EVAPORATION_LIMIT && // just hit evaporation limit
             model.numberOfAtomsEvaporated < FrictionModel.NUMBER_OF_EVAPORABLE_ATOMS ) { // still atoms to evaporate
          this.alertAtEvaporationThreshold();
        }
      };

      // exists for the lifetime of the sim, no need to dispose
      this.model.amplitudeProperty.link( this.amplitudeListener );
    }


    /**
     * Alert when the temperature has just reached the point where atoms begin to break away
     * @public
     */
    alertAtEvaporationThreshold() {
      utteranceQueue.addToFront( this.alertedBreakAwayProperty.value ? BREAK_AWAY_THRESHOLD_AGAIN : BREAK_AWAY_THRESHOLD_FIRST );

      this.alertedBreakAwayProperty.value = true;
      this.tooSoonForNextAlert = true;
      timer.setTimeout( () => { this.tooSoonForNextAlert = false; }, ALERT_TIME_DELAY );
    }

    /**
     * @public
     */
    reset() {
      this.alertedBreakAwayProperty.reset(); // get the "first time" break away alert on reset
    }


    /**
     * Uses the singleton pattern to keep one instance of this describer for the entire lifetime of the sim.
     * @param {FrictionModel} [model]
     * @returns {*}
     */
    static getDescriber( model ) {

      if ( describer ) {
        return describer;
      }
      assert && assert( model, 'arg required to instantiate BreakAwayDescriber' );
      describer = new BreakAwayDescriber( model );
      return describer;
    }

    // "initialize" method for clarity
    static initialize( model ) {
      BreakAwayDescriber.getDescriber( model );
    }
  }

  return friction.register( 'BreakAwayDescriber', BreakAwayDescriber );
} );