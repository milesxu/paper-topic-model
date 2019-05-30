import database_operations as ops
from datetime import datetime
from flask_socketio import SocketIO, emit
import json
import time
from flask_cors import CORS
from flask import Flask, jsonify, Response, stream_with_context, request, flash
import examples.topic_models.sparse_lntm_mcem_cpu as lntm_cpu
import examples.topic_models.sparse_lntm_mcem_gpu as lntm_gpu
from threading import Thread, Event
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, async_mode="threading")
# socketio = SocketIO(app, async_mode="eventlet")
app.debug = True

thread = Thread()
gpu_thread = Thread()
cpu_thread = Thread()


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


class GPUThread(Thread):
    def __init__(self, conference, epoch):
        super(GPUThread, self).__init__()
        self.basename = conference
        self.epoch = epoch

    def compute(self):
        path = f'./data/{self.basename}/dataset'
        for e, t, p in lntm_gpu.concise_gpu(path, self.basename, self.epoch):
            socketio.emit('gpu', {'count': e, 'timing': t, 'perplexity': p})
        socketio.emit('complete', 'complete')

    def run(self):
        self.compute()


class CPUThread(Thread):
    def __init__(self, conference, epoch):
        super(CPUThread, self).__init__()
        self.basename = conference
        self.epoch = epoch

    def compute(self):
        path = f'./data/{self.basename}/dataset'
        for e, t, p in lntm_cpu.concise_cpu_origin(
                path, self.basename, self.epoch):
            socketio.emit('cpu', {'count': e, 'timing': t, 'perplexity': p})
        # socketio.emit('complete', 'complete')

    def run(self):
        self.compute()


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


@socketio.on('gpu test')
def gpu_test():
    global gpu_thread
    if not gpu_thread.isAlive():
        gpu_thread = GPUThread()
    gpu_thread.start()


@socketio.on('cpu test')
def cpu_test(json_str):
    conf = json_str['conference']
    epoch = json_str['epoch']
    global cpu_thread
    global gpu_thread
    if not cpu_thread.isAlive():
        cpu_thread = CPUThread(conf, epoch)
    cpu_thread.start()
    cpu_thread.join()
    if not gpu_thread.is_alive():
        gpu_thread = GPUThread(conf, epoch)
    gpu_thread.start()


if __name__ == "__main__":
    # app.run(debug=True, port=8080)
    socketio.run(app, port=8080)
