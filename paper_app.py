from flask import Flask, jsonify
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
