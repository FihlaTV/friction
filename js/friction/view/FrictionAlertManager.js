// Copyright 2018, University of Colorado Boulder

/**
 * Manager for the alerts that are dynamically emitted in the simulation.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const Range = require( 'DOT/Range' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const TemperatureZoneEnum = require( 'FRICTION/friction/model/TemperatureZoneEnum' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );

  // a11y strings
  const frictionIncreasingTemperatureClausePatternString = FrictionA11yStrings.frictionIncreasingTemperatureClausePattern.value;
  const frictionIncreasingAtomsJigglingTemperaturePatternString = FrictionA11yStrings.frictionIncreasingAtomsJigglingTemperaturePattern.value;
  const surfaceString = FrictionA11yStrings.surface.value;

  // a11y strings interactive alerts
  const aTinyBitString = FrictionA11yStrings.aTinyBit.value;
  const aLittleString = FrictionA11yStrings.aLittle.value;
  const aLittleMoreString = FrictionA11yStrings.aLittleMore.value;
  const fasterString = FrictionA11yStrings.faster.value;
  const evenFasterString = FrictionA11yStrings.evenFaster.value;
  const veryFastString = FrictionA11yStrings.veryFast.value;
  const isCoolString = FrictionA11yStrings.isCool.value;
  const getsWarmerString = FrictionA11yStrings.getsWarmer.value;
  const nowWarmString = FrictionA11yStrings.nowWarm.value;
  const getsHotterString = FrictionA11yStrings.getsHotter.value;
  const nowHotString = FrictionA11yStrings.nowHot.value;
  const veryHotString = FrictionA11yStrings.veryHot.value;
  const lessString = FrictionA11yStrings.less.value;
  const evenLessString = FrictionA11yStrings.evenLess.value;
  const droppingString = FrictionA11yStrings.dropping.value;

  // constants
  //TODO duplicated min/max constants with the screen view
  const THERMOMETER_MIN_TEMP = FrictionModel.MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min - 1.05; // about 0
  const THERMOMETER_MAX_TEMP = FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit * 1.1; // 7.7???

  const THERMOMETER_RANGE = THERMOMETER_MAX_TEMP - THERMOMETER_MIN_TEMP;
  const DIVIDED_RANGE = THERMOMETER_RANGE / 9;

  // a11y - [cool, warm, hot, very hot]
  const AMPLITUDE_RANGES = [ new Range( THERMOMETER_MIN_TEMP, 2 * DIVIDED_RANGE ),
    new Range( 2 * DIVIDED_RANGE, 5 * DIVIDED_RANGE ),
    new Range( 5 * DIVIDED_RANGE, 8 * DIVIDED_RANGE ),
    new Range( 8 * DIVIDED_RANGE, 9 * DIVIDED_RANGE )
  ];

  // sanity check to keep these in sync
  assert && assert( AMPLITUDE_RANGES.length === TemperatureZoneEnum.getOrdered().length );


  var FrictionAlertManager = {

    /**
     * Get the temperature zone string based on the amplitude
     * @param {number} amplitude
     * @param {boolean} [clampMax] - if false, and the amplitude is above the thermometer range, then return the edge case "MORE_THAN_VERY_HOT"
     * @returns {string}
     */
    amplitudeToTempZone: function( amplitude, clampMax ) {
      clampMax = typeof clampMax === 'boolean' ? clampMax : true; // poor mans extend, normally do clamp it

      var maxAmplitude = AMPLITUDE_RANGES[ AMPLITUDE_RANGES.length - 1 ].max;
      if ( amplitude > maxAmplitude ) {
        if ( clampMax ) {
          amplitude = maxAmplitude;
        }
        else {
          return TemperatureZoneEnum.MORE_THAN_VERY_HOT;
        }
      }
      let rangeIndex;
      for ( let i = AMPLITUDE_RANGES.length - 1; i >= 0; i-- ) {
        let range = AMPLITUDE_RANGES[ i ];
        if ( amplitude < range.max || // exclusive maximum
             ( i === AMPLITUDE_RANGES.length - 1 && amplitude === range.max ) ) { // edge case for the larges possible value in ranges
          rangeIndex = i;
        }
      }
      assert && assert( typeof rangeIndex === 'number' );

      return TemperatureZoneEnum.getOrdered()[ rangeIndex ];
    },

    /**
     * Get the zone releationship
     * @param newZone
     * @param oldZone
     * @returns {MORE|LESS|SAME} - the relationship between the two temperature zone
     */
    getRelativeZonePosition: function( newZone, oldZone ) {
      var zones = TemperatureZoneEnum.getOrdered();
      var newZoneIndex = zones.indexOf( newZone );
      var oldZoneIndex = zones.indexOf( oldZone );

      assert( newZoneIndex >= 0 );
      assert( oldZoneIndex >= 0 );

      let relativePosition;
      if ( newZoneIndex === oldZoneIndex ) {
        relativePosition = this.SAME;
      }

      // new zone is less than it was
      if ( newZoneIndex < oldZoneIndex ) {
        relativePosition = this.LESS;
      }

      // new zone is more than it was
      if ( newZoneIndex > oldZoneIndex ) {
        relativePosition = this.MORE;
      }
      return relativePosition;
    },
    /**
     * @private
     * @param tempString
     * @param surface
     * @returns {*|string}
     */
    getTemperatureClause: function( tempString, surface ) {
      return StringUtils.fillIn( frictionIncreasingTemperatureClausePatternString, {
        surface: surface ? surfaceString : '',
        temperature: tempString
      } );
    },

    /**
     * @param {object} alertObject - data object holding strings for alert, see this.ALERT_SCHEMA
     */
    alertTemperatureFromObject: function( alertObject ) {
      var string = StringUtils.fillIn( frictionIncreasingAtomsJigglingTemperaturePatternString, {
        temperatureClause: this.getTemperatureClause( alertObject.temp, alertObject.useSurface ),
        jigglingAmount: alertObject.jiggle
      } );
      utteranceQueue.addToBack( string );
    },

    /**
     * Add a temperature related alert to the utterance queue based on what the amplitude is, and what it was.
     * @param {number} newAmplitude
     * @param {number} oldAmplitude
     */
    alertTemperatureFromAmplitude: function( newAmplitude, oldAmplitude ) {

      let newZone = this.amplitudeToTempZone( newAmplitude );
      let oldZone = this.amplitudeToTempZone( oldAmplitude );

      assert && assert( TemperatureZoneEnum[ newZone ] );
      assert && assert( TemperatureZoneEnum[ oldZone ] );

      // determine the relationship between the new and old zones
      var relativePosition = this.getRelativeZonePosition( newZone, oldZone );

      // get the appropriate data about what alert we will give
      let alertObject = this.ALERT_SCHEMA[ newZone ][ relativePosition ];

      // some relationships don't have alerts to give out
      if ( alertObject ) {

        this.alertTemperatureFromObject( alertObject );

      }

    },

    // @public
    // schema that describes the alerts based on the what the current temp is, and how it changed.
    // Think of each relational word as "* Now", i.e. "COOL LESS NOW" because it used to be warmer.
    // so ALERT_SCHEMA.WARM.LESS would be triggered when going from HOT to WARM on a drag.
    ALERT_SCHEMA: {
      COOL: {
        SAME: {
          temp: isCoolString,
          useSurface: true,
          jiggle: aTinyBitString
        },
        LESS: {
          useSurface: true,
          jiggle: aTinyBitString,
          temp: isCoolString
        }
      },
      WARM: {
        MORE: {
          temp: getsWarmerString,
          useSurface: true,
          jiggle: aLittleString
        },
        SAME: {
          temp: nowWarmString,
          useSurface: false,
          jiggle: aLittleMoreString
        },
        LESS: {
          temp: nowWarmString,
          useSurface: false,
          jiggle: aLittleString
        }
      },
      HOT: {
        MORE: {
          temp: getsHotterString,
          useSurface: false,
          jiggle: fasterString
        },
        SAME: {
          temp: nowHotString,
          useSurface: false,
          jiggle: evenFasterString
        },
        LESS: {
          temp: nowHotString,
          useSurface: false,
          jiggle: evenLessString
        }
      },
      VERY_HOT: {

        // when there are no more atoms to break away
        MORE: {
          temp: veryHotString,
          useSurface: false,
          jiggle: veryFastString
        },
        LESS: {
          temp: droppingString,
          useSurface: false,
          jiggle: lessString
        }
      }

    },
    LESS: 'LESS',
    SAME: 'SAME',
    MORE: 'MORE'

  };

  friction.register( 'FrictionAlertManager', FrictionAlertManager );

  return FrictionAlertManager;
} );