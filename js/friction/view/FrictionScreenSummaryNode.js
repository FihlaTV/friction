// Copyright 2018-2019, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in Friction.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const Node = require( 'SCENERY/nodes/Node' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );


  // a11y strings
  const summarySentencePatternString = require( 'string!FRICTION/a11y.summarySentencePattern' );
  const droppingAsAtomsJiggleLessString = require( 'string!FRICTION/a11y.droppingAsAtomsJiggleLess' );
  const atomsJigglePatternString = require( 'string!FRICTION/a11y.atomsJigglePattern' );
  const jiggleClausePatternString = require( 'string!FRICTION/a11y.jiggleClausePattern' );
  const jiggleTemperatureScaleSentenceString = require( 'string!FRICTION/a11y.jiggleTemperatureScaleSentence' );
  const thermometerString = require( 'string!FRICTION/a11y.thermometer' );
  const temperatureStatePatternString = require( 'string!FRICTION/a11y.temperature.statePattern' );
  const moveChemistryBookSentenceString = require( 'string!FRICTION/a11y.moveChemistryBookSentence' );
  const resetSimMoreObservationSentenceString = require( 'string!FRICTION/a11y.resetSimMoreObservationSentence' );
  const startingChemistryBookPatternString = require( 'string!FRICTION/a11y.startingChemistryBookPattern' );
  const lightlyString = require( 'string!FRICTION/a11y.lightly' );
  const amountOfAtomsSentenceString = require( 'string!FRICTION/a11y.amountOfAtoms.sentence' );
  const amountOfAtomsFewerString = require( 'string!FRICTION/a11y.amountOfAtoms.fewer' );
  const amountOfAtomsFarFewerString = require( 'string!FRICTION/a11y.amountOfAtoms.farFewer' );
  const amountOfAtomsSomeString = require( 'string!FRICTION/a11y.amountOfAtoms.some' );
  const amountOfAtomsManyString = require( 'string!FRICTION/a11y.amountOfAtoms.many' );

  // Used for the screen summary sentence to compare how many atoms have evaporated
  const SOME_ATOMS_EVAPORATED_THRESHOLD = FrictionModel.NUMBER_OF_EVAPORABLE_ATOMS / 2;

  /**
   *
   * @param {Object} [options]
   * @constructor
   */
  class FrictionScreenSummaryNode extends Node {
    constructor( model, thermometerMinTemp, thermometerMaxTemp, temperatureDecreasingDescriber ) {

      super();

      // @private
      this.model = model;
      this.booksParagraph = new Node( { tagName: 'p' } );
      this.interactionHintParagraph = new Node( { tagName: 'p' } );
      this.thermometerMinTemp = thermometerMinTemp;
      this.thermometerMaxTemp = thermometerMaxTemp;

      // requires an init
      this.updateSummaryString( model );

      // a11y - update the screen summary when the model changes
      let previousTempString = this.amplitudeToTempString( model.vibrationAmplitudeProperty.value );
      let previousJiggleString = this.amplitudeToJiggleString( model.vibrationAmplitudeProperty.value );

      // make a11y updates as the amplitude changes in the model, no need to unlink, exists for sim lifetime.
      model.vibrationAmplitudeProperty.link( amplitude => {

          // the temperature is decreasing
          const tempDecreasing = temperatureDecreasingDescriber.tempDecreasing;

          // Not if it is completely cool, so we don't trigger the update too much.
          const amplitudeSettledButNotMin = amplitude < FrictionModel.AMPLITUDE_SETTLED_THRESHOLD && // considered in a "settled" state
                                          amplitude !== FrictionModel.VIBRATION_AMPLITUDE_MIN; // not the minimum amplitude

          // nested if statements so that we don't have to calculate these strings as much
          if ( tempDecreasing ||
               amplitudeSettledButNotMin ||
               this.amplitudeToTempString( amplitude ) !== previousTempString ||
               this.amplitudeToJiggleString( amplitude ) !== previousJiggleString ) {

            // if jiggle or temperature changed, update the string
            this.updateSummaryString( model );
            previousTempString = this.amplitudeToTempString( amplitude ); // compute this again for a more efficient if statement
            previousJiggleString = this.amplitudeToJiggleString( amplitude ); // compute this again for a more efficient if statement

          }
        }
      );

      // exists for the lifetime of the sim, no need to unlink
      model.contactProperty.link( () => { this.updateSummaryString( model );} );

      this.mutate( {
        children: [ this.booksParagraph, this.interactionHintParagraph ],

        // a11y
        tagName: 'div'
      } );
    }


    /**
     * Given the number of atoms that have evaporated from the model so far, get the first screen summary sentence,
     * describing the chemistry book.
     * @param {number} atomsEvaporated
     * @returns {string} the first sentence of the screen summary
     */
    getFirstSummarySentence( atomsEvaporated ) {

      // There are three ranges based on how many atoms have evaporated

      let relativeChemistryBookSentence = null;
      // "no evaporated atoms"
      if ( atomsEvaporated === 0 ) {
        relativeChemistryBookSentence = ''; // blank initial sentence of "First Sentence"
      }

      // some evaporated atoms, describe the chemistry book with some atoms "broken away"
      else if ( atomsEvaporated < SOME_ATOMS_EVAPORATED_THRESHOLD ) {
        relativeChemistryBookSentence = StringUtils.fillIn( amountOfAtomsSentenceString, {
          comparisonAmount: amountOfAtomsFewerString,
          breakAwayAmount: amountOfAtomsSomeString
        } );
      }

      // lots of evaporated atoms, describe many missing atoms
      else {
        relativeChemistryBookSentence = StringUtils.fillIn( amountOfAtomsSentenceString, {
          comparisonAmount: amountOfAtomsFarFewerString,
          breakAwayAmount: amountOfAtomsManyString
        } );
      }

      return StringUtils.fillIn( startingChemistryBookPatternString, {
        lightly: this.model.contactProperty.value ? '' : lightlyString,
        relativeChemistryBookSentence: relativeChemistryBookSentence
      } );
    }

    /**
     * Implementation to go from amplitude to an index for a list of strings to describe the model amplitude. Either
     * the temperature or the amount of jiggling.
     * @private
     * @param {number} amplitude
     * @param {Array.<string>} stringsList
     * @returns {number}
     */
    amplitudeToIndex( amplitude, stringsList ) {
      if ( amplitude > this.thermometerMaxTemp ) {
        amplitude = this.thermometerMaxTemp;
      }

      // cancel out the range
      const normalized = ( amplitude - this.thermometerMinTemp ) / this.thermometerMaxTemp;
      let i = Math.floor( normalized * stringsList.length );

      // to account for javascript rounding problems
      if ( i === stringsList.length ) {
        i = stringsList.length - 1;
      }

      assert && assert( i >= 0 && i < stringsList.length );
      return i;
    }

    /**
     * Map the amplitude of the model to a temperature string
     * @private
     * @a11y
     * @param {number} amplitude
     * @returns {string} the temp string based on the amplitude of the model
     */
    amplitudeToTempString( amplitude ) {
      const i = this.amplitudeToIndex( amplitude, FrictionConstants.TEMPERATURE_STRINGS );
      return FrictionConstants.TEMPERATURE_STRINGS[ i ];
    }

    /**
     * Map the amplitude of the model to a "jiggle" string
     * @private
     * @a11y
     * @param {number} amplitude
     * @returns {string} the "jiggle" amount string based on the amplitude of the model
     */
    amplitudeToJiggleString( amplitude ) {
      const i = this.amplitudeToIndex( amplitude, FrictionConstants.JIGGLE_STRINGS );
      return FrictionConstants.JIGGLE_STRINGS[ i ];
    }

    /**
     * Construct the second screen summary sentence about the zoomed in chemistry book.
     * @param {Property.<number>} vibrationAmplitudeProperty
     * @returns {*|string}
     */
    getSecondSummarySentence( vibrationAmplitudeProperty ) {

      // {{boolean}} is sim "in transition"? meaning it is changing, because it isn't settled (settled is the opposite of "in transition"
      const inTransition = vibrationAmplitudeProperty.value > FrictionModel.AMPLITUDE_SETTLED_THRESHOLD;


      // Default to describing the jiggling of the atoms
      const jiggleAmount = StringUtils.fillIn( atomsJigglePatternString, {
        jiggleAmount: this.amplitudeToJiggleString( vibrationAmplitudeProperty.value )
      } );
      let jiggleClause = StringUtils.fillIn( jiggleClausePatternString, {
        jiggleAmount: jiggleAmount
      } );

      // If the temperature is decreasing, then describe the jiggling relatively
      if ( inTransition ) {
        jiggleClause = StringUtils.fillIn( jiggleClausePatternString, {
          jiggleAmount: droppingAsAtomsJiggleLessString
        } );
      }

      // Fill in the current temperature string
      const tempString = StringUtils.fillIn( temperatureStatePatternString, {
        temp: this.amplitudeToTempString( vibrationAmplitudeProperty.value ),
        thermometer: inTransition ? '' : thermometerString
      } );

      // Construct the final sentence from its parts
      return StringUtils.fillIn( jiggleTemperatureScaleSentenceString, {
        jigglingClause: jiggleClause,
        temperatureClause: tempString
      } );
    }

    /**
     * @private
     * @param {number} numberOfAtomsEvaporated
     * @returns {string}
     */
    getThirdSupplementarySentence( numberOfAtomsEvaporated ) {

      // Queue moving the book if there are still many atoms left, queue reset if there are many evaporated atoms
      return numberOfAtomsEvaporated > SOME_ATOMS_EVAPORATED_THRESHOLD ?
             resetSimMoreObservationSentenceString : moveChemistryBookSentenceString;
    }

    /**
     * Update the summary string in the PDOM
     * @private
     * @a11y
     */
    updateSummaryString() {

      // FIRST SENTENCE
      const chemistryBookString = this.getFirstSummarySentence( this.model.numberOfAtomsEvaporated );

      // SECOND SENTENCE (ZOOMED-IN)
      const jiggleTempSentence = this.getSecondSummarySentence( this.model.vibrationAmplitudeProperty );

      // SUPPLEMENTARY THIRD SENTENCE
      const supplementarySentence = this.getThirdSupplementarySentence( this.model.numberOfAtomsEvaporated );

      this.booksParagraph.innerContent = StringUtils.fillIn( summarySentencePatternString, {
        chemistryBookString: chemistryBookString,
        jiggleTemperatureScaleSentence: jiggleTempSentence
      } );

      this.interactionHintParagraph.innerContent = supplementarySentence;

    }
  }

  return friction.register( 'FrictionScreenSummaryNode', FrictionScreenSummaryNode );
} );