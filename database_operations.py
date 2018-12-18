from pymongo import MongoClient


def get_collections():
    client = MongoClient()
    paper = client['paper_db']
    paper_coll = paper['paper_info']
    org_coll = paper['organization_collection']
    return paper_coll, org_coll
