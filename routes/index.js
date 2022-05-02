const express = require('express');
const router = express.Router();

const comment_controller = require('../controllers/commentController')
const post_controller = require('../controllers/postController')
const user_controller = require('../controllers/userController')

const verifyToken = (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }

}

/* GET home page.  Works*/
router.get('/', post_controller.post_list);

//Create user - Works
router.get('/sign-in', user_controller.sign_user_get);

//Create user - Works
router.post('/sign-in', user_controller.sign_user_post);

//Create post - Works
router.get('/posts/create', verifyToken, post_controller.create_post_get);

//Create post - Works
router.post('/posts/create', verifyToken, post_controller.create_post_post);

//Update post - Works
router.post('/posts/:id/update', verifyToken, post_controller.update_post);

//Get request for one post - Works
router.get('/posts/:id', post_controller.post_detail);

//Post comment - Works
router.post('/posts/:id', comment_controller.comment_post);

//Delete comment - Works
router.post('/posts/:post/comments/:comment', verifyToken, comment_controller.comment_delete);

module.exports = router;
