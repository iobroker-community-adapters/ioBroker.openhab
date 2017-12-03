var openHabTypes = {
    Rollershutter: function (item) {
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
    Switch: function (item) {
        return {
            name:  item.label,
            read:  true,
            write: true,
            type:  'boolean',
            role:  'switch'
        };
    },
    Number: function (item) {
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

        var data = {
            name: item.label,
            type: 'number',
            read: true,
            write: false
        };

        var isReadOnly = true;

        if (item.stateDescription) {
            if (item.stateDescription.pattern && item.stateDescription.pattern.indexOf('°C') !== -1) {
                data.unit = '°C';
            }
            if (item.stateDescription.pattern && item.stateDescription.pattern.indexOf('°F') !== -1) {
                data.unit = '°F';
            }

            if (!(item.stateDescription.readOnly) || item.stateDescription.readOnly === false ) {
                isReadOnly = false;
            }

        } else {
            if (!(item.readOnly) || item.readOnly === false ) {
                isReadOnly = false;
            }
        }

        if ( (item.category === 'temperature' || item.category === 'Temperature') && !isReadOnly) {
            data.role = 'level.temperature';
            data.write = true;
        } else if (item.category === 'temperature' || item.category === 'Temperature') {
            data.role = 'value.temperature';
        } else if (item.category === 'humidity' || item.category === 'Humidity') {
            data.role = 'value.humidity';
        }

        return data;
    },
    Contact: function (item) {
        return {
            name:  item.label,
            read:  true,
            write: false,
            type:  'boolean',
            role:  'state'
        };
    },
    Dimmer: function (item) {
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
    String: function (item) {
        return {
            name:  item.label,
            read:  true,
            write: true,
            type:  'string',
            role:  'state'
        };
    },
    Location: function (item) {
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
