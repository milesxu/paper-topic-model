from flask import Flask, jsonify, Response, stream_with_context, request, flash
import time
import json
from datetime import datetime
import database_operations as ops
app = Flask(__name__)


@app.route('/')
def Hello():
    return jsonify(message='Hello World!',
                   user='papers')


@app.route('/papers')
def get_papers():
    return jsonify(ops.get_papers())


@app.route('/countries')
def get_countries():
    return jsonify(ops.get_countries())


@app.route('/distribute')
def get_distribute():
    return jsonify(ops.get_distribute())


# @app.route('/time')
# def get_times():
#     def generate():
#         i = 0
#         while i < 5:
#             yield "{}\n".format(datetime.now().isoformat())
#             time.sleep(2)
#             i += 1
#     return Response(generate(), mimetype='text/plain')

def stream_template(template_name, **context):
    app.update_template_context(context)
    t = app.jinja_env.get_template(template_name)
    rv = t.stream(context)
    rv.disable_buffering()
    return rv


data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]


def generate():
    yield '['
    for item in data:
        # yield str(item)
        yield json.dumps({'count': item}) + ','
        time.sleep(2)
    yield ']'


@app.route('/stream')
def stream_view():
    rows = generate()
    # return Response(
    #     stream_with_context(stream_template('template.html', rows=rows)))
    return Response(
        stream_with_context(generate()), mimetype='application/json')
