const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    numberOfTickets= Number,
    ticketPrice= Number,
    firstName= String,
    lastName= String,
    phoneNumber= String,
    email= String,
     Address= String,
});
module.exports = mongoose.model('Ticket', ticketSchema);
