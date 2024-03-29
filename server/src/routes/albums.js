const express = require('express')
const albumsRouter = express.Router()
const db = require('../config/db')


albumsRouter.route('/')
.get((_req, res) => { // get all albums
    db.task('get-albums', async (t) => {
        await t.any('SELECT * FROM albums')
        return await t.any('SELECT album_id, album_title, artist_name FROM artists, albums')
    })
    .then((albums) => res.send(albums))
    .catch(err => res.send(err))
})
.post((req, res) => { // create new album from object
    let albumTitle = req.query.album_title,
    artistName = req.query.artist_name
    db.task('add-album', async t => {
        return await t.one('SELECT artist_id FROM artists WHERE artist_name = $1', [artistName]) 
    })
    .then(aId => {
        db.none('INSERT INTO albums (album_title, artist_id) VALUES ($1, $2)', [albumTitle, aId.artist_id])
    })
    .then(() => res.send('success'))
    .catch(err => res.send(err))
})

albumsRouter.route('/:album_id')
.get((req, res) =>{ // return album from parameter
    let albumId = req.params.album_id
    db.oneOrNone('SELECT album_title, artist_name FROM albums, artists WHERE album_id = $1', [albumId])
    .then(data => res.send(data))
    .catch(err => res.send(err))
})
.put((req, res) => { // edit album information from object
    let albumId = req.params.album_id
    ,albumTitle = req.query.album_title
    ,artistName = req.query.artist_name
    db.one('SELECT artist_id FROM artists WHERE artist_name=$1', [artistName])
    .then(aId => {
        db.none('UPDATE albums SET album_title=$1, artist_id=$2 WHERE album_id=$3',[albumTitle, aId.artist_id, albumId])
    })
    .catch(err => res.send(err))
})
.delete((req, res) => { // delete an album
    let albumId = req.params.album_id
    db.none('DELETE FROM albums WHERE album_id = $1', [albumId])
    .catch(err => res.send(err))
})



module.exports = albumsRouter