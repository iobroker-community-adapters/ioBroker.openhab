/* OH types
Item Name      Description                                       Command Types
Color          Color information (RGB)                           OnOff, IncreaseDecrease, Percent, HSB
Contact        Status of contacts, e.g. door/window contacts     OpenClose
DateTime       Stores date and time                              -
Dimmer         Percentage value for dimmers                      OnOff, IncreaseDecrease, Percent
Group          Item to nest other items / collect them in groups -
Image          Binary data of an image                           -
Location       GPS coordinates                                   Point
Number         Values in number format                           Decimal
Player         Allows control of players (e.g. audio players)    PlayPause, NextPrevious, RewindFastforward
Rollershutter  Roller shutter Item, typically used for blinds    UpDown, StopMove, Percent
String         Stores texts                                      String
Switch         Switch Item, typically used for lights (on/off)   OnOff
*/
'use strict';

const openHabTypes = {
    Rollershutter: item => {
        return {
            name:  item.label,
            type:  'number',
            role:  'level.blind',
            read:  true,
            write: true,
            min:   0,
            max:   100,
            unit:  '%'
        };
    },
    Switch: item => {
        return {
            name:  item.label,
            read:  true,
            write: true,
            type:  'boolean',
            role:  'switch'
        };
    },
    Color: function(item) {
        const data = {
            name: item.label,
            type: 'string',
            role:  'level.color',
            read: true,
            write: false
        };

        if (!(item.readOnly) || item.readOnly === false ) {
            data.write = true;
        }
        return data;
    },
    Number: item => {
        /*
         "stateDescription": {
            "pattern": "%.1f Â°C",
            "readOnly": false,
            "options": []
         },
         "type": "Number",
         "name": "Temperature_GF_Corridor",
         "label": "Temperature",
         "category": "temperature",
        */

        const data = {
            name: item.label,
            type: 'number',
            read: true,
            write: false
        };

        if (item.stateDescription) {
            if (item.stateDescription.pattern && item.stateDescription.pattern.indexOf('°C') !== -1) {
                data.unit = '°C';
            }
            if (item.stateDescription.pattern && item.stateDescription.pattern.indexOf('°F') !== -1) {
                data.unit = '°F';
            }

            if (!(item.stateDescription.readOnly) || item.stateDescription.readOnly === false ) {
                data.write = true;
            }

        } else {
            if (!(item.readOnly) || item.readOnly === false ) {
                data.write = true;
            }
        }

        if (item.category === 'temperature' || item.category === 'Temperature') {
            if (data.write) {
                data.role = 'level.temperature'; // writeable temperatures should be marked as level.
            } else {
                data.role = 'value.temperature';
            }
        } else if (item.category === 'humidity' || item.category === 'Humidity') {
            data.role = 'value.humidity';
        }

        return data;
    },
    Contact: item => {
        return {
            name:  item.label,
            read:  true,
            write: false,
            type:  'boolean',
            role:  'state'
        };
    },
    Dimmer: item => {
        return {
            name:  item.label,
            read:  true,
            write: true,
            min: 0,
            max: 100,
            unit: '%',
            type:  'number',
            role:  'state'
        };
    },
    String: item => {
        return {
            name:  item.label,
            read:  true,
            write: true,
            type:  'string',
            role:  'state'
        };
    },
    Location: item => {
        return {
            name:  item.label,
            read:  true,
            write: false,
            type:  'string',
            role:  'value.gps'
        };
    }
};

module.exports = openHabTypes;
