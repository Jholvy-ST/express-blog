const Post = require('../models/post');
const Comment = require('../models/comment');
const async = require('async');
const { body,validationResult } = require('express-validator');


exports.post_list = (req, res, next) => {
	Post.find()
	.sort([['date', 'ascending']])
	.exec( (err, post_list) => {
		if (err) { return next(err); }
		//Successful, so render
		res.send({ post_list: post_list });
	})
}

exports.post_detail = (req, res, next) => {
	/*Post.findById(req.params.id)
	.exec( (err, post) => {
		if (err) { return next(err); }
		//Successful, so render
		return res.send({ post: post });
	})*/

	async.parallel({
		post: function(callback) {
			Post.findById(req.params.id)
			.exec(callback)
		},
		comments: function(callback) {
			Comment.find({ 'post': req.params.id })
			.sort([['date', 'ascending']])
			.exec(callback)
		},
	}, (err, results) => {
		if (err) { return next(err); } // Error in API usage.
		if (results.post==null) { // No results.
				var err = new Error('Author not found');
				err.status = 404;
				return next(err);
		}
		// Successful, so render.
		res.json( { post: results.post, comments: results.comments } );
	});
}

exports.create_post_get = (req, res, next) => {
	return res.json({title: 'Create post'})
}

exports.create_post_post =  [
	body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
	body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
	body('content', 'Content must not be empty.').trim().isLength({ min: 1 }).escape(),

	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		const post = new Post(
			{
				title: req.body.title,
				content: req.body.content,
				author: req.body.author,
				published: req.body.published
			}
		)

		post['date'] = Date.now();

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			return res.json({ post: post, errors: errors.array() });
		} else {
			post.save(function (err) {
				if (err) { return next(err); }
				// Successful - redirect to new author record.
				res.redirect('/');
			});
		}
	}
]

exports.update_post = [
	(req, res, next) => {
		//const c_post = {};

		Post.findById(req.params.id)
		.exec( (err, found_post) => {
			if (err) { return next(err); }
			//Successful, so render
			/*c_post['title'] = found_post.title;
			c_post['content'] = found_post.content; 
			c_post['author'] = found_post.author; 
			c_post['date'] = found_post.date;
			c_post['_id'] = found_post.id; 

			if (found_post.published) {
				c_post['published'] = false;
			} else {
				c_post['published'] = true;
			}*/

			const post = new Post(
				{
					title: req.body.title,
					content: req.body.content,
					author: req.body.author,
					date: found_post.date,
					published: req.body.published,
					_id: found_post.id
				}
			)
		
			Post.findByIdAndUpdate(req.params.id, post, {}, function (err) {
				if (err) { return next(err); }
				// Successful - redirect to book detail page.
				res.redirect('/');
			});
		})

		/*const post = new Post(
			{
				title: found_post.title,
				content: found_post.content,
				author: found_post.author,
				date: found_post.date,
				published: found_post.published
			}
		)

		Post.findByIdAndUpdate(req.params.id, post, {}, function (err) {
			if (err) { return next(err); }
			// Successful - redirect to book detail page.
			res.redirect('/');
		});*/
	}
]

