const DB = require("../utils/db.js")

module.exports = {
  add: async ctx => {
    let favoriteEntry
    let id = +ctx.request.body.id || null
    let user = ctx.state.$wxInfo.userinfo.openId

    if(!isNaN(id)) {
      favoriteEntry = await DB.query("SELECT * FROM favorites WHERE comment_id=? AND user=?", [id, user])
      if (!favoriteEntry.length) {
        await DB.query("INSERT INTO favorites(comment_id, user) VALUES (?, ?)", [id, user])
      }
    }

    ctx.state.data = { 
      isExisted: favoriteEntry.length ? 1 : 0
    }
  },
  list: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId

    let list = await DB.query("SELECT favorites.id AS `id`, comments.user AS `user`, comments.create_time AS `create_time`, comments.id AS `comment_id`, comments.content AS `content`, comments.username AS `username`, comments.movie_id AS `movie_id`, comments.category AS `category`, comments.avatar as `avatar`, movies.title as `title`, movies.image as `image` FROM favorites LEFT JOIN comments ON favorites.comment_id = comments.id LEFT JOIN movies ON comments.movie_id = movies.id WHERE favorites.user = ? ORDER BY favorites.id DESC", [user])

    ctx.state.data = list
  }
}