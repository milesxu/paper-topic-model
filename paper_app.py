from flask import Flask, jsonify
import database_operations as ops
app = Flask(__name__)


@app.route('/')
def Hello():
    return jsonify(message='Hello World!',
                   user='papers')


@app.route('/papers')
def get_papers():
    paper_coll, _ = ops.get_collections()
    result = []
    for paper in paper_coll.find({}):
        result.append({
            'title': paper['title'],
            'authors': paper['authors'],
            'abstract': paper['abstract'],
            'organization': paper['organization'],
            'url': paper['link']
        })
    return jsonify(result)


@app.route('/countries')
def get_countries():
    paper_coll, _ = ops.get_collections()
    pipeline = [{
        '$lookup': {
            'from': 'organization_collection',
            'localField': 'organization',
            'foreignField': 'name',
            'as': 'country'
        }
    }]
    paper_result = []
    for r in paper_coll.aggregate(pipeline):
        paper_result.append({
            'title': r['title'],
            'organization': r['organization'],
            'country': r['country'][0]['country']
        })
    return jsonify(paper_result)


@app.route('/distribute')
def get_distribute():
    paper_coll, _ = ops.get_collections()
    pipeline = [{
        '$lookup': {
            'from': 'organization_collection',
            'localField': 'organization',
                'foreignField': 'name',
                'as': 'country'
                }
    }]
    paper_result = []
    for r in paper_coll.aggregate(pipeline):
        paper_result.append({
            'title': r['title'],
            'organization': r['organization'],
            'country': r['country'][0]['country']
        })
    distribute = {}
    for r in paper_result:
        if r['country'] in distribute:
            distribute[r['country']] += 1
        else:
            distribute[r['country']] = 1
    return jsonify(distribute)
