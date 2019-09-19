const socket = io('http://localhost');

socket.on('reconnect_attempt', () => {
  socket.io.opts.transports = ['polling', 'websocket'];
});

socket.on('connect', () => {
    // styleConnected();
    console.log('connected');
})

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
  // styleConnected()
  console.log('connected');
});