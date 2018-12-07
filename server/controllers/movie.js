const DB = require("../utils/db.js")

module.exports = {
  list: async ctx => {
    ctx.state.data = await DB.query("SELECT * FROM movies")
  },
  detail: async ctx => {
    let movie_id = +ctx.params.id
    ctx.state.data = (await DB.query("SELECT * FROM movies WHERE id=?", [movie_id]))[0]
  }
}