const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({

    proimg: String,
    eventName: String,
    eventType: String,
    eventPlace: String,
    eventDate: String,
    eventTime: String,
    eventdescription: String,
    city: String,
    state: String,
    organizerdetails: {
        type: Object
    },
    eventinfo: {
        type: Object
    },
    speakerName: String,
    company: String,
    position: String,
    email: String,
    description: String,
    filename: String

})
module.exports = mongoose.model('Event', EventSchema);

