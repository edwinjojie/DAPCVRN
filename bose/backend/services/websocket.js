export function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    console.log('🔗 New WebSocket connection established');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to BOSE Real-time Event Stream',
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('📨 Received WebSocket message:', message);
        
        // Echo message back (can be extended for specific handlers)
        if (message.type === 'ping') {
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Store wss globally for event broadcasting
  global.wss = wss;

  // Simulate periodic events for demo
  setInterval(() => {
    const events = [
      { type: 'CredentialIssued', data: { credentialId: 'CRED_' + Date.now(), studentId: 'STUDENT_001' }},
      { type: 'CredentialVerified', data: { credentialId: 'CRED_' + (Date.now() - 1000), result: 'valid' }},
      { type: 'SystemHealth', data: { status: 'healthy', activeNodes: 3, blockHeight: Math.floor(Date.now() / 1000) }}
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'fabric-event',
          eventName: randomEvent.type,
          data: randomEvent.data,
          timestamp: new Date().toISOString()
        }));
      }
    });
  }, 30000); // Every 30 seconds
}