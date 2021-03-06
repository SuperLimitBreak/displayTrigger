const Immutable = require('immutable');
import {DefaultDict} from 'pycollections';  // TODO: replace dependency with calaldees_libs/core/MapDefaultGet
import {Screen} from './Screen.js';


export class ScreenMessageRouter {
    /*
    Reference/Create/Manage all screens and route incoming messages to the correct screens.
    Screens should have no knowlge of their subscriptions or network routing
    */

    constructor(subscription_socket, kwargs) {
        Object.assign(this, {
            ScreenClass: Screen,
            console: console,
        }, kwargs);
        this.screens = new Map();
        this.subscription_screen_id_lookup = new DefaultDict(()=>new Set());
        this.subscription_socket = subscription_socket;
        this.subscription_socket.addOnMessageListener((msg) => this.onMessage(msg));
    }

    bindScreen(id, element, subscriptions=[], config=new Immutable.Map()) {
        this.console.assert(id, 'Screen id should be provided');
        this.console.assert(element, 'Element should be provided to bind a Screen');
        this.console.assert(!this.screens.hasOwnProperty(id), 'Screen id already exists');
        this.screens.set(id, new this.ScreenClass(id, element));  // TODO: get `config` down to screen layers
        for (let subscription of new Set([...subscriptions, ...[id, 'all']])) {
            this.subscription_screen_id_lookup.get(subscription).add(id);
        }
        const allSubscriptions = this.allSubscriptions;
        this.subscription_socket.addSubscriptions(allSubscriptions);
    }

    get allSubscriptions() {
        const allSubscriptions = new Set(this.subscription_screen_id_lookup.keys());
        allSubscriptions.add('all');
        return allSubscriptions;
    }

    // Route message to the subscribed screens
    onMessage(msg) {
        for (let id of this.subscription_screen_id_lookup.get(msg.deviceid, [])) {
            this.screens.get(id).onMessage(msg);
        }
    }
}
