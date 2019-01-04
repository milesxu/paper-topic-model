from pymongo import MongoClient


def get_collections():
    client = MongoClient()
    paper = client['paper_db']
    paper_coll = paper['paper_info']
    org_coll = paper['organization_collection']
    country_coll = paper['country_code']
    return paper_coll, org_coll, country_coll


def get_papers():
    papers, _, _ = get_collections()
    result = []
    for paper in papers.find({}):
        result.append({
            'title': paper['title'],
            'authors': paper['authors'],
            'abstract': paper['abstract'],
            'organization': paper['organization'],
            'url': paper['link']
        })
    return result


def get_countries():
    papers, _, _ = get_collections()
    pipeline = [{
        '$lookup': {
            'from': 'organization_collection',
            'localField': 'organization',
            'foreignField': 'name',
            'as': 'country'
        }
    }]
    paper_result = []
    for r in papers.aggregate(pipeline):
        paper_result.append({
            'title': r['title'],
            'organization': r['organization'],
            'country': r['country'][0]['country_code']
        })
    return paper_result


def get_distribute():
    numbers = {}
    for paper in get_countries():
        code = paper['country']
        if code in numbers:
            numbers[code] += 1
        else:
            numbers[code] = 1
    #print(numbers, sum(numbers.values()))
    result = []
    _, _, countries = get_collections()
    for country in countries.find({}):
        num = numbers[country['code']] if country['code'] in numbers else 0
        result.append({
            'id': country['code'],
            'name': country['name'],
            'value': num
        })
    return result
