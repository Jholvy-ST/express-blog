const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
	{
		mail: {type: String, required: true, maxLength: 50},
		text: {type: String, required: true, maxLength: 250},
		post: {type: Schema.Types.ObjectId, ref: 'Post', required: true},
		date: {type: Date, default: Date.now},
	}
)

CommentSchema
.virtual('url')
.get( function() {
	return '/posts/' + this._id;
})

module.exports = mongoose.model('Comment', CommentSchema);