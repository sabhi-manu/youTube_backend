import express from 'express'
import { authMiddlewareJWT } from '../middlewares/auth.middleware.js'
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, updatePlaylist } from '../controllers/playList.controller.js'

const route = express.Router()

route.post('/',authMiddlewareJWT,createPlaylist)
route.get('/user/:userId',authMiddlewareJWT,getUserPlaylists)

route.get('/:playlistId',authMiddlewareJWT,getPlaylistById)
route.patch('/add/:playlistId',authMiddlewareJWT,addVideoToPlaylist)
route.delete('/:playlistId',authMiddlewareJWT,deletePlaylist)

route.patch('/:playlistId',authMiddlewareJWT,updatePlaylist)

export default route