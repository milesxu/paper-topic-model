from aiohttp import web

app = web.Application()
app.add_routes(
    [web.static('/', '/data/mingx/dist/paper-app', show_index=True,
                follow_symlinks=True)])
web.run_app(app)
