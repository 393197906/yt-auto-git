const emitEvent = require('events').EventEmitter;
const debug = require('debug')('Auto:Event');
module.exports = ()=>{
    const event = new emitEvent();
    event.on('error',err=>{
        debug(err)
    })
    return event
}