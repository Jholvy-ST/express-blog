const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const PostSchema = new Schema(
	{
		title: {type: String, required: true, maxLength: 50},
		content: {type: String, required: true},
		author: {type: String, required: true, maxLength: 50},
		date: {type: Date, default: Date.now},
		published: {type: Boolean}
	}
)

PostSchema
.virtual('url')
.get( function() {
	return this._id;
})

PostSchema
.virtual('date_formatted')
.get(function () {
	const dt = new Date (this.date);

	const checkDate = (date) => {
		if (date < 10) {
			return '0' + date
		}

		return date;
	}
	const day = checkDate(dt.getUTCDate());
	const month = checkDate(dt.getUTCMonth());
	const year = dt.getUTCFullYear();
	const formattedDate = year + '-' + month + '-' + day;
  return formattedDate;
});

module.exports = mongoose.model('Post', PostSchema);