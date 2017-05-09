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
            type: 'number',
            read: true,
            write: false
        };
        if (item.stateDescription) {
            if (item.stateDescription.pattern.indexOf('°C') !== -1) {
                data.unit = '°C';
            }
            if (item.stateDescription.pattern.indexOf('°F') !== -1) {
                data.unit = '°F';
            }
            if (item.category === 'temperature' && item.stateDescription.readOnly === false) {
                data.role = 'level.temperature';
                data.write = true;
            } else
            if (item.category === 'temperature') {
                data.role = 'value.temperature';
            }
        } else {
            if (item.category === 'temperature') {
                data.role = 'value.temperature';
            }
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