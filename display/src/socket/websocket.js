import 'core-js/fn/object/assign';


// Text Websocket + Auto-Reconnect ---------------------------------------------

export class SocketReconnect {

    constructor(kwargs) {
        Object.assign(this, {
            WebSocket: WebSocket,
            hostname: location.hostname,
            port: 9873,
            disconnected_retry_interval_seconds: 5,
            console: console
        }, kwargs);
        this._connect();
    }

    _connect() {
        const socket = new this.WebSocket('ws://'+this.hostname+':'+this.port+'/');
        let retry_interval = null;

        socket.onopen = () => {
            if (retry_interval) {
                clearInterval(retry_interval);
                retry_interval = null;
            }
            this._send = (msgs) => {
                return socket.send(this.encodeMessages(msgs));
            };
            this.onConnected();
        };
        socket.onclose = () => {
            if (!retry_interval) {
                retry_interval = setInterval(this._connect(), this.disconnected_retry_interval_seconds * 1000);
            }
            this._send = this.send_while_disconnected;
            this.onDisconnected();
        };
        socket.onmessage = (msg) => {
            //AbstractSocketReconnect.prototype.onMessage.call(this, msg.data);
            for (let m of this.decodeMessages(msg.data)) {
                this.onMessage(m);
            }
        };
    }

    send(msg) {
        this._send(msg);
    }
    _send(msg) {
        this.console.error('Send Failed: Socket has not been initalised', msg);
    }
    _send_while_disconnected(msg) {
        this.console.warn('Send Failed: Currently disconnected', msg);
    }

    encodeMessages(msgs) {
        return msgs.map((msg)=>{return msg+'\n'});
    }
    decodeMessages(msgs) {
        return msgs.split('\n').filter((x)=>{return x});
    }

    // Overrideable Methods -------
    onMessage(msg) {this.console.log('onMessage', msg);}
    onConnected() {this.console.log('onConnected');}
    onDisconnected() {this.console.log('onDisconnected');}
}


// Json ------------------------------------------------------------------------

export class JsonSocketReconnect extends SocketReconnect {
    encodeMessages(msgs) {
        const ee = super.encodeMessages(msgs).map(JSON.stringify);
        console.log('JSON encodeMessages', msgs, ee);
        return ee;
        //super.encodeMessages(msgs).map(JSON.stringify);
    }
    decodeMessages(msgs) {
        return super.decodeMessages(msgs).map(JSON.parse);
    }
}


// trigger Subscription system -------------------------------------------------

export class SubscriptionSocketReconnect extends JsonSocketReconnect {
    constructor(kwargs) {
        super(kwargs);
        this.subscriptions = kwargs.subscriptions || [];
    }

    decodeMessages(msgs) {
        msgs = super.decodeMessages(msgs);
        return function*() {
            for (let msg of msgs) {
                if (msg && msg.action === 'message' && msg.data.length > 0) {
                    for (let m of msg.data) {
                        yield m;
                    }
                }
            }
        };
    }

    onConnected() {
        if (this.subscriptions.length > 0) {
            this.sendSubscriptions();
        }
    }

    _sendPayload(action, data) {
        if (!Array.isArray(data)) {data = [data];}
        this.send([{action: action, data: data}]);
    }
    
    sendSubscriptions() {
        this._sendPayload('subscribe', this.subscriptions);
    }

    sendMessages(msgs) {
        this._sendPayload('message', msgs);
    }

    updateSubscriptions() {
        // TODO? This is broken!
        // Update existing array rather than replace?  _.union(options.subscriptions,
        this.subscriptions = Array.from(arguments);
        this.sendSubscriptions();
    }
}
