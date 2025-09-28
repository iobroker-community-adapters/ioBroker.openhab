# ioBroker Adapter Development with GitHub Copilot

**Version:** 0.4.0
**Template Source:** https://github.com/DrozmotiX/ioBroker-Copilot-Instructions

This file contains instructions and best practices for GitHub Copilot when working on ioBroker adapter development.

## Project Context

You are working on an ioBroker adapter. ioBroker is an integration platform for the Internet of Things, focused on building smart home and industrial IoT solutions. Adapters are plugins that connect ioBroker to external systems, devices, or services.

### Adapter-Specific Context
- **Adapter Name**: openhab
- **Primary Function**: Connects ioBroker with OpenHAB home automation platform
- **Key Features**: 
  - Exports OpenHAB devices and groups to ioBroker
  - Monitors real-time updates of OpenHAB variables via SSE (Server-Sent Events)
  - Supports bidirectional communication between ioBroker and OpenHAB
  - Handles OpenHAB REST API communication for device management
- **Key Dependencies**: 
  - OpenHAB REST API for device discovery and state management
  - EventSource for real-time SSE communication from OpenHAB
  - Request library for HTTP communication
- **Configuration Requirements**: 
  - OpenHAB server host, port, and protocol configuration
  - Optional authentication credentials for secured OpenHAB instances
  - Configurable reconnection timeout for connection resilience
  - REST API path customization (default: /rest)

### OpenHAB Integration Patterns
- Use OpenHAB REST API endpoints: `/rest/items`, `/rest/things`, `/rest/sitemaps`
- Handle OpenHAB item types: Switch, Dimmer, String, Number, DateTime, Color, Contact, Player, etc.
- Process OpenHAB state updates via Server-Sent Events from `/rest/events`
- Map OpenHAB item metadata (categories, tags, groups) to ioBroker object properties
- Implement proper OpenHAB command sending with correct item types and formats

## Core ioBroker Adapter Patterns

### Adapter Structure
ioBroker adapters follow a standard structure with these key files:
- `main.js` - Main adapter logic with lifecycle methods
- `io-package.json` - Adapter configuration and metadata
- `package.json` - Node.js package configuration
- `admin/` - Admin interface files for configuration
- `lib/` - Helper modules and utilities

### Main Adapter Lifecycle
Every ioBroker adapter extends the Adapter class and implements these methods:
```javascript
const adapter = new utils.Adapter('adaptername');

// Called when adapter starts
adapter.on('ready', () => {
  // Initialize adapter, connect to external systems
});

// Called when state changes in ioBroker
adapter.on('stateChange', (id, state) => {
  // Handle state changes from ioBroker objects
});

// Called when adapter stops
adapter.on('unload', (callback) => {
  // Clean up resources, close connections
  callback();
});
```

### State and Object Management
- Use `adapter.setObject()` to create ioBroker objects (devices, channels, states)
- Use `adapter.setState()` to update state values
- Use `adapter.subscribeStates()` to listen for state changes
- Always set `ack: false` for commands from ioBroker, `ack: true` for status updates

### Configuration Access
- Access adapter configuration via `adapter.config.property`
- Store sensitive data (passwords) encrypted in native configuration
- Use `adapter.decrypt()` and `adapter.encrypt()` for password handling

## OpenHAB-Specific Development Patterns

### REST API Communication
```javascript
// Standard OpenHAB REST API patterns
const request = require('request');

function getItems() {
    const url = `${URL}/rest/items`;
    request.get({
        url: url,
        headers: { 'Accept': 'application/json' },
        timeout: 10000
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const items = JSON.parse(body);
            // Process OpenHAB items
        }
    });
}
```

### Server-Sent Events Handling
```javascript
const EventSource = require('eventsource');

function connectSSE() {
    const sseUrl = `${URL}/rest/events`;
    es = new EventSource(sseUrl);
    
    es.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'ItemStateEvent' || data.type === 'ItemStateChangedEvent') {
                handleItemUpdate(data.topic, data.payload);
            }
        } catch (err) {
            adapter.log.warn('Error parsing SSE event: ' + err.message);
        }
    };
    
    es.onerror = (error) => {
        adapter.log.error('SSE connection error');
        // Implement reconnection logic
    };
}
```

### OpenHAB Item Type Mapping
Map OpenHAB item types to appropriate ioBroker state configurations:
```javascript
const ohTypes = {
    'Switch': { type: 'boolean', role: 'switch' },
    'Dimmer': { type: 'number', role: 'level.dimmer', min: 0, max: 100 },
    'Number': { type: 'number', role: 'value' },
    'String': { type: 'string', role: 'text' },
    'DateTime': { type: 'string', role: 'value.datetime' },
    'Color': { type: 'string', role: 'level.color.rgb' },
    'Contact': { type: 'boolean', role: 'sensor.door' }
};
```

### Command Handling
Send commands to OpenHAB items with proper type conversion:
```javascript
function sendCommand(itemName, command) {
    const url = `${URL}/rest/items/${itemName}`;
    request.post({
        url: url,
        body: String(command),
        headers: {
            'Content-Type': 'text/plain',
            'Accept': 'application/json'
        }
    }, (error, response) => {
        if (error) {
            adapter.log.error(`Failed to send command to ${itemName}: ${error.message}`);
        }
    });
}
```

## Testing

### Unit Testing
- Use Jest as the primary testing framework for ioBroker adapters
- Create tests for all adapter main functions and helper methods
- Test error handling scenarios and edge cases
- Mock external API calls and hardware dependencies
- For adapters connecting to APIs/devices not reachable by internet, provide example data files to allow testing of functionality without live connections
- Example test structure:
  ```javascript
  describe('AdapterName', () => {
    let adapter;
    
    beforeEach(() => {
      // Setup test adapter instance
    });
    
    test('should initialize correctly', () => {
      // Test adapter initialization
    });
  });
  ```

### Integration Testing

**IMPORTANT**: Use the official `@iobroker/testing` framework for all integration tests. This is the ONLY correct way to test ioBroker adapters.

**Official Documentation**: https://github.com/ioBroker/testing

#### Framework Structure
Integration tests MUST follow this exact pattern:

```javascript
const path = require('path');
const { tests } = require('@iobroker/testing');

// Define test coordinates or configuration
const TEST_COORDINATES = '52.520008,13.404954'; // Berlin
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Use tests.integration() with defineAdditionalTests
tests.integration(path.join(__dirname, '..'), {
    defineAdditionalTests({ suite }) {
        suite('Test adapter with specific configuration', (getHarness) => {
            let harness;

            before(() => {
                harness = getHarness();
            });

            it('should configure and start adapter', function () {
                return new Promise(async (resolve, reject) => {
                    try {
                        harness = getHarness();
                        
                        // Get adapter object using promisified pattern
                        const obj = await new Promise((res, rej) => {
                            harness.objects.getObject('system.adapter.your-adapter.0', (err, o) => {
                                if (err) return rej(err);
                                res(o);
                            });
                        });
                        
                        if (!obj) {
                            return reject(new Error('Adapter object not found'));
                        }

                        // Configure adapter properties
                        Object.assign(obj.native, {
                            position: TEST_COORDINATES,
                            createCurrently: true,
                            createHourly: true,
                            createDaily: true,
                            // Add other configuration as needed
                        });

                        // Set the updated configuration
                        harness.objects.setObject(obj._id, obj);

                        console.log('✅ Step 1: Configuration written, starting adapter...');
                        
                        // Start adapter and wait
                        await harness.startAdapterAndWait();
                        
                        console.log('✅ Step 2: Adapter started');

                        // Wait for adapter to process data
                        const waitMs = 15000;
                        await wait(waitMs);

                        console.log('🔍 Step 3: Checking states after adapter run...');
                        
                        resolve('Test completed successfully');
                    } catch (error) {
                        console.error('❌ Test failed:', error);
                        reject(error);
                    }
                });
            }).timeout(120000); // 2 minute timeout for integration tests
        });
    }
});
```

#### Testing Framework Best Practices

1. **Always use the official @iobroker/testing framework** - do not create custom test harnesses
2. **Use defineAdditionalTests pattern** - this is the correct way to add integration tests
3. **Handle async operations properly** - wrap in try/catch, use proper Promise patterns
4. **Provide meaningful console output** - help developers understand test progress
5. **Set appropriate timeouts** - integration tests often need 2+ minutes
6. **Clean configuration properly** - always configure the adapter properly before starting

#### Common Integration Test Patterns

**Configuration Testing:**
```javascript
// Always get and modify the adapter object properly
const obj = await new Promise((res, rej) => {
    harness.objects.getObject('system.adapter.openhab.0', (err, o) => {
        if (err) return rej(err);
        res(o);
    });
});

// Modify native configuration
Object.assign(obj.native, {
    host: 'demo.openhab.org',
    port: 8080,
    protocol: 'http',
    path: '/rest'
});

harness.objects.setObject(obj._id, obj);
```

**State Verification:**
```javascript
// Check if states were created correctly
const states = await harness.objects.getObjectViewAsync('system', 'state', 
    { startkey: 'openhab.0.', endkey: 'openhab.0.\u9999' });

console.log(`Found ${states.rows.length} states created by adapter`);

// Verify specific state exists and has correct properties
const connectionState = await harness.states.getStateAsync('openhab.0.info.connection');
expect(connectionState).toBeTruthy();
```

**Timeout and Error Handling:**
```javascript
it('should handle connection timeouts gracefully', async function () {
    this.timeout(180000); // 3 minutes for connection tests
    
    try {
        // Configure adapter with invalid host to test timeout
        await configureAdapter(harness, { host: 'invalid.host.local' });
        await harness.startAdapterAndWait();
        
        // Wait for timeout handling
        await wait(60000);
        
        // Verify adapter handled timeout correctly
        const connectionState = await harness.states.getStateAsync('openhab.0.info.connection');
        expect(connectionState.val).toBe(false);
        
    } catch (error) {
        throw new Error(`Connection timeout test failed: ${error.message}`);
    }
});
```

## Logging and Debugging

### Logging Best Practices
- Use appropriate log levels: `adapter.log.error()`, `adapter.log.warn()`, `adapter.log.info()`, `adapter.log.debug()`
- Include context in log messages: item names, error details, operation being performed
- Log connection state changes and important operations
- Use debug level for detailed API communication logs

### Error Handling
- Always catch and handle API errors gracefully
- Implement retry logic for temporary connection issues
- Set connection state to false on persistent errors
- Provide user-friendly error messages in logs

### Connection Management
- Implement automatic reconnection for lost connections
- Use connection timeouts to prevent hanging requests
- Monitor connection state and update `info.connection` accordingly
- Clean up resources (EventSource, timers) in unload method

## State Management and Object Creation

### Creating ioBroker Objects
- Create channel objects for grouping related states
- Use appropriate roles for different state types (switch, sensor, indicator, etc.)
- Set proper min/max values for numeric states
- Include units where applicable (°C, %, W, etc.)

### State Updates
- Always use proper acknowledgment flags (ack: true for updates, ack: false for commands)
- Update states only when values actually change to reduce system load
- Handle type conversion between OpenHAB and ioBroker formats
- Preserve OpenHAB timestamps when possible

## unload() Method Implementation

```javascript
adapter.on('unload', callback => {
  try {
    // Stop any running timers
    if (connectingTimeout) {
      clearTimeout(connectingTimeout);
      connectingTimeout = null;
    }
    
    // Close EventSource connection
    if (es) {
      es.close();
      es = null;
    }
    
    // Set connection state to false
    adapter.setState && adapter.setState('info.connection', false, true);
    
    adapter.log.info('OpenHAB adapter unloaded');
    callback();
  } catch (e) {
    callback();
  }
});
```

## Code Style and Standards

- Follow JavaScript/TypeScript best practices
- Use async/await for asynchronous operations
- Implement proper resource cleanup in `unload()` method
- Use semantic versioning for adapter releases
- Include proper JSDoc comments for public methods

## CI/CD and Testing Integration

### GitHub Actions for API Testing
For adapters with external API dependencies, implement separate CI/CD jobs:

```yaml
# Tests API connectivity with demo credentials (runs separately)
demo-api-tests:
  if: contains(github.event.head_commit.message, '[skip ci]') == false
  
  runs-on: ubuntu-22.04
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run demo API tests
      run: npm run test:integration-demo
```

### CI/CD Best Practices
- Run credential tests separately from main test suite
- Use ubuntu-22.04 for consistency
- Don't make credential tests required for deployment
- Provide clear failure messages for API connectivity issues
- Use appropriate timeouts for external API calls (120+ seconds)

### Package.json Script Integration
Add dedicated script for credential testing:
```json
{
  "scripts": {
    "test:integration-demo": "mocha test/integration-demo --exit"
  }
}
```

### Practical Example: Complete API Testing Implementation
Here's a complete example based on lessons learned from the Discovergy adapter:

#### test/integration-demo.js
```javascript
const path = require("path");
const { tests } = require("@iobroker/testing");

// Helper function to encrypt password using ioBroker's encryption method
async function encryptPassword(harness, password) {
    const systemConfig = await harness.objects.getObjectAsync("system.config");
    
    if (!systemConfig || !systemConfig.native || !systemConfig.native.secret) {
        throw new Error("Could not retrieve system secret for password encryption");
    }
    
    const secret = systemConfig.native.secret;
    let result = '';
    for (let i = 0; i < password.length; ++i) {
        result += String.fromCharCode(secret[i % secret.length].charCodeAt(0) ^ password.charCodeAt(i));
    }
    
    return result;
}

// Run integration tests with demo credentials
tests.integration(path.join(__dirname, ".."), {
    defineAdditionalTests({ suite }) {
        suite("API Testing with Demo Credentials", (getHarness) => {
            let harness;
            
            before(() => {
                harness = getHarness();
            });

            it("Should connect to API and initialize with demo credentials", async () => {
                console.log("Setting up demo credentials...");
                
                if (harness.isAdapterRunning()) {
                    await harness.stopAdapter();
                }
                
                const encryptedPassword = await encryptPassword(harness, "demo_password");
                
                await harness.changeAdapterConfig("your-adapter", {
                    native: {
                        username: "demo@provider.com",
                        password: encryptedPassword,
                        // other config options
                    }
                });

                console.log("Starting adapter with demo credentials...");
                await harness.startAdapter();
                
                // Wait for API calls and initialization
                await new Promise(resolve => setTimeout(resolve, 60000));
                
                const connectionState = await harness.states.getStateAsync("your-adapter.0.info.connection");
                
                if (connectionState && connectionState.val === true) {
                    console.log("✅ SUCCESS: API connection established");
                    return true;
                } else {
                    throw new Error("API Test Failed: Expected API connection to be established with demo credentials. " +
                        "Check logs above for specific API errors (DNS resolution, 401 Unauthorized, network issues, etc.)");
                }
            }).timeout(120000);
        });
    }
});
```

### OpenHAB-Specific Testing Considerations

When testing the OpenHAB adapter:

1. **Demo Server Testing**: Use OpenHAB's demo server (demo.openhab.org) for integration tests
2. **Item Discovery**: Test that the adapter correctly discovers and creates ioBroker objects for OpenHAB items
3. **Command Sending**: Verify bidirectional communication by sending commands to switchable items
4. **SSE Connection**: Test real-time updates via Server-Sent Events
5. **Error Handling**: Test behavior with invalid OpenHAB server configurations

```javascript
// OpenHAB-specific integration test example
it("Should discover OpenHAB items and create ioBroker objects", async () => {
    // Configure adapter to use demo OpenHAB server
    await harness.changeAdapterConfig("openhab", {
        native: {
            host: "demo.openhab.org",
            port: 8080,
            protocol: "http",
            path: "/rest"
        }
    });

    await harness.startAdapterAndWait();
    
    // Wait for item discovery
    await wait(30000);
    
    // Check if items were discovered and objects created
    const objects = await harness.objects.getObjectViewAsync('system', 'state', 
        { startkey: 'openhab.0.', endkey: 'openhab.0.\u9999' });
    
    expect(objects.rows.length).toBeGreaterThan(0);
    console.log(`✅ Discovered ${objects.rows.length} OpenHAB items`);
}).timeout(120000);
```