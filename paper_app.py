import database_operations as ops
from datetime import datetime
from flask_socketio import SocketIO, emit
import json
import time
from flask_cors import CORS
from flask import Flask, jsonify, Response, stream_with_context, request, flash
import examples.topic_models.sparse_lntm_mcem_demo as lntm
from threading import Thread, Event
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, async_mode="threading")
app.debug = True

thread = Thread()


class ConsumeThread(Thread):
    def __init__(self):
        self.delay = 2
        self.e = Event()
        super(ConsumeThread, self).__init__()

    def consume(self):
        for i in range(5):
            # while not self.e.wait(self.delay):
            socketio.emit('consumed', i)
            print('generated!')
            time.sleep(self.delay)

    def run(self):
        self.consume()


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
    # yield '['
    for item in data:
        # yield str(item)
        yield json.dumps(
            {'count': item, 'timing': item * 2})
        time.sleep(2)
    # yield ']'


@app.route('/stream')
def stream_view():
    rows = generate()
    # return Response(
    #     stream_with_context(stream_template('template.html', rows=rows)))
    # return Response(
    # stream_with_context(generate()), mimetype='application/json')
    return Response(generate(), mimetype='application/json')


@socketio.on('connect')
def test_connect():
    print('connected!')
    emit('my response', {'data': 'Connected'})


@socketio.on('consume')
def consuming_test():
    # for str in lntm.timeConsumingTest():
        # emit('consumed', str)
    # for i in range(5):
    #     socketio.emit('consumed', str(i))
    #     time.sleep(2)
    global thread
    if not thread.isAlive():
        thread = ConsumeThread()
    thread.start()


if __name__ == "__main__":
    # app.run(debug=True, port=8080)
    socketio.run(app, port=8080)
