var socket = WebSocketReconnect({
    onopen: function() {
        console.log('connected');
    },
    onmessage: function(data) {
        console.log('message', data);
    }
});

function image(src) {
    src = "/static/assets/"+src;
    socket.send({
        func: 'trigger.start',
        src: src,
    });
}