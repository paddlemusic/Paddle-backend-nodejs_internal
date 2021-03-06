const express = require('express')
const router = express.Router()
const HomePageController = require('../controllers/homePageController')
const homePageController = new HomePageController()
const authenticate = require('../../../middleware/authenticate')

/**
 * @swagger
 *
 * /createPost:
 *   post:
 *     tags :
 *      - Home
 *     summary: Create User Post.
 *     produces:
 *       - application/json
 *     consumes:
 *        - application/json
  *     parameters:
 *        - in: header
 *          name: Authorization
 *          schema:
 *          type: string
 *          required: true
 *        - in: path
 *          name: type
 *          schema:
 *          type: integer
 *          required: true
 *          description: Numeric ID for track & artist, 1 = track & 2 = artist
 *        - in: body
 *          name: body
 *          required: true
 *          description: In case of SHARE TO ALL the "shared_with" field will be send blank else for SHARE TO FRIEND "shared_with" field will be the user_id of a friend.
 *          schema:
 *              type: object
 *              properties:
 *                  media_id:
 *                      type: string
 *                      required: true
 *                  playURI:
 *                      type: string
 *                      required: false
 *                  artist_id:
 *                      type: string
 *                      required: false
 *                  album_id:
 *                      type: string
 *                      required: false
 *                  caption:
 *                      type: string
 *                  media_image:
 *                      type: string
 *                      required: false
 *                  meta_data:
 *                      type: string
 *                      required: false
 *                  meta_data2:
 *                      type: string
 *                      required: false
 *                  shared_with:
 *                      type: integer
 *                      required: true
 *     description: >
 *       In case of shared with everyone=> value = null, shared with friend => value = userId(whom to share)
 */
router.post('/createPost/:media_type', authenticate.verifyToken, homePageController.createUserPost)

/**
 * @swagger
 *
 * /getPosts:
 *   get:
 *     tags :
 *      - Home
 *     summary: get User posts.
 *     description: >
 *      This resource will be used for getting user's posts .
 *     parameters:
 *      - in: header
 *        name: Authorization
 *        schema:
 *        type: string
 *        required: true
 *      - in: query
 *        name: page
 *        schema:
 *        type: integer
 *        required: false
 *      - in: query
 *        name: pageSize
 *        schema:
 *        type: integer
 *        required: false
 *     produces:
 *       - application/json
 */
router.get('/getPosts', authenticate.verifyToken, homePageController.getUserPosts)

/**
 * @swagger
 *
 * /getPost/{id}:
 *   get:
 *     tags :
 *      - Home
 *     summary: get a posts.
 *     description: >
 *      This resource will be used for getting a post.
 *     parameters:
 *      - in: header
 *        name: Authorization
 *        schema:
 *        type: string
 *        required: true
 *      - in: path
 *        name: id
 *        schema:
 *        type: string
 *        required: true
 *     produces:
 *       - application/json
 */
router.get('/getPost/:id', authenticate.verifyToken, homePageController.getAPost)

/**
 * @swagger
 *
 * /getPosts:
 *   get:
 *     tags :
 *      - Home
 *     summary: get User posts.
 *     description: >
 *      This resource will be used for getting user's posts .
 *     parameters:
 *      - in: header
 *        name: Authorization
 *        schema:
 *        type: string
 *        required: true
 *      - in: query
 *        name: page
 *        schema:
 *        type: integer
 *        required: false
 *      - in: query
 *        name: pageSize
 *        schema:
 *        type: integer
 *        required: false
 *     produces:
 *       - application/json
 */
router.get('/getPosts', authenticate.verifyToken, homePageController.getUserPosts)

/**
 * @swagger
 *
 * /post/{id}:
 *   delete:
 *     tags :
 *      - Home
 *     summary: Delete recent posts
 *     description: >
 *      This resource will be used for deleting user's recent posts .
 *     parameters:
 *      - in: header
 *        name: Authorization
 *        schema:
 *        type: string
 *        required: true
 *      - in: path
 *        name: id
 *        schema:
 *        type: integer
 *        required: true
 *     produces:
 *       - application/json
 */
router.delete('/post/:id', authenticate.verifyToken, homePageController.deleteUserPosts)

// /**
//  * @swagger
//  *
//  * /getUserSharedAsFriendPost/{shared_with}:
//  *   get:
//  *     tags :
//  *      - Home
//  *     summary: get User posts by shared_with friend.
//  *     description: >
//  *      This resource will be used for getting shared with friend posts .
//  *     parameters:
//  *      - in: header
//  *        name: Authorization
//  *        schema:
//  *        type: string
//  *        required: true
//  *      - in: path
//  *        name: shared_with
//  *        schema:
//  *        type: string
//  *        required: true
//  *     produces:
//  *       - application/json
//  */
// router.get('/getUserSharedAsFriendPost/:shared_with', authenticate.verifyToken, homePageController.getUserSharedAsFriendPost)
/**
 * @swagger
 *
 * /likeunlike/{post_id}/{type}:
 *   post:
 *     tags :
 *      - Home
 *     summary: LIKE OR UNLIKE .
 *     description: >
 *      This resource will be used ffor liking and unliking .
 *     parameters:
 *      - in: header
 *        name: Authorization
 *        schema:
 *        type: string
 *        required: true
 *      - in: path
 *        name: post_id
 *        schema:
 *        type: string
 *        required: true
 *      - in: path
 *        name: type
 *        schema:
 *        type: string
 *        required: true
 *      - in: path
 *        name: playURI
 *        schema:
 *        type: string
 *        required: false
 *     responses:
 *          default:
 *              description: Delete tracks from playlists response object.
 */

router.post('/likeunlike/:post_id/:type', authenticate.verifyToken, homePageController.likeUnlikePost)

/**
 * @swagger
 *
 * /userShare/{type}:
 *   post:
 *     tags :
 *      - Home
 *     summary: This resource will be used to create post from end user as a SHARE TO ALL post OR as SHARE TO FRIEND post.
 *     produces:
 *       - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - in: path
 *          name: media_type
 *          schema:
 *          type: integer
 *          required: true
 *          description: Numeric ID for track & artist, 1 = track & 2 = artist
 *        - in: body
 *          name: body
 *          required: true
 *          description: In case of SHARE TO ALL the "shared_with" field will be send blank else for SHARE TO FRIEND "shared_with" field will be the user_id of a friend.
 *          schema:
 *              type: object
 *              properties:
 *                  media_id:
 *                      type: string
 *                      required: true
 *                  playURI:
 *                      type: string
 *                      required: false
 *                  artist_id:
 *                      type: string
 *                      required: false
 *                  album_id:
 *                      type: string
 *                      required: false
 *                  caption:
 *                      type: string
 *                  media_image:
 *                      type: string
 *                      required: false
 *                  meta_data:
 *                      type: string
 *                      required: false
 *                  shared_with:
 *                      type: string
 *                      required: true
 *     responses:
 *          default:
 *              description: In case of SHARE TO ALL the "shared_with" field will be send blank else for SHARE TO FRIEND "shared_with" field will be the user_id of a friend.
 */
router.post('/userShare/:media_type', authenticate.verifyToken, homePageController.createUserPost)

module.exports = router
