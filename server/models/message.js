const mongoose = require('mongoose')
const Schema = mongoose.Schema // not nessisary

// Creating a schema, sort of like working with an ORM
const MessageSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Name field is required.']//require ? : Name is ...
	},
	body: {
		type: String,
		required: [true, 'Body field is required.']
	}
})

// Creating a table within database with the defined schema
const Message = mongoose.model('message', MessageSchema)
                              //Message construct (message, schemaname)   
// Exporting table for querying and mutating
module.exports = Message
