const DB = require("../utils/db.js")

module.exports = {
  add: async ctx => {
    let userId = ctx.state.$wxInfo.userinfo.openId
    let username = ctx.state.$wxInfo.userinfo.nickName
    let userAvatar = ctx.state.$wxInfo.userinfo.avatarUrl
    let data = ctx.request.body
    let movie_id = + data.id
    let content = data.content
    let type = data.type

    if (!isNaN(movie_id)) {
      await DB.query("INSERT INTO comments(user, username, avatar, content, movie_id, category) VALUES (?, ?, ?, ?, ?, ?)", [userId, username, userAvatar, content, movie_id, type])
    }

    ctx.state.data = {}
  },
  hot: async ctx => {
    let hotMovie

    let hotComment = (await DB.query("SELECT * FROM comments order by rand() limit 1"))[0]

    let movie_id = hotComment.movie_id

    if (!isNaN(movie_id)) {
      hotMovie = (await DB.query("SELECT * FROM movies WHERE id=?", [movie_id]))[0]
    }

    ctx.state.data = {
      hotComment: hotComment || "",
      hotMovie: hotMovie || ""
    }
  },
  list: async ctx => {
    let id = ctx.params.id || ""
    let commentList = []

    if (!isNaN(+id)) {
      commentList = await DB.query("SELECT * FROM comments WHERE movie_id=? ORDER BY id DESC", [id])
    } else {
      commentList = await DB.query("SELECT comments.id,comments.movie_id, comments.avatar, comments.category, comments.content, comments.user, comments.username, movies.title, movies.image FROM comments LEFT JOIN movies ON comments.movie_id = movies.id  WHERE user=? ORDER BY comments.id DESC", [id])
    }

    ctx.state.data = commentList
  },
  detail: async ctx => {
    let commentDetail = {}
    let userCommentDetail = {}

    let data = ctx.request.query
    let id = + data.id || null
    let movie_id = + data.movie_id
    let user = ctx.state.$wxInfo.userinfo.openId

    if (!isNaN(id)) {
      commentDetail = (await DB.query("SELECT * FROM comments WHERE id=?", [id]))[0]
    }
    userCommentDetail = (await DB.query("SELECT * FROM comments WHERE user=? AND movie_id=?", [user, movie_id]))[0]

    ctx.state.data = {
      commentDetail,
      userCommentDetail
    }
  }
}