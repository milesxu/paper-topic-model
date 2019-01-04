import sys
import os
import re
import regex
from pymongo import MongoClient
from bs4 import BeautifulSoup

data_base_path = os.path.join(os.getcwd(), 'data')
base_url = 'http://papers.nips.cc/paper/'
no_author_outlier = {
    '7422-a-loss-framework-for-calibrated-anomaly-detection': [
        'Aditya Krishna Menon', 'Robert C. Williamson']
}

client = MongoClient()
paper_db = client['paper_db']

iso_codes = {}
with open('iso-country-code.txt') as code_file:
    lines = code_file.readlines()
    for line in lines[1:]:
        name, code = line.strip().split(';')
        iso_codes[code] = name

country_code = paper_db['country_code']
country_code.delete_many({})
country_code.insert_many([{"code": key, "name": value}
                          for key, value in iso_codes.items()])


org_names = {
    'US': [
        'University of Southern California',
        'University of California', 'Johns Hopkins University',
        'IBM Research', 'Texas A& M University', 'Carnegie Mellon University',
        'Princeton University', 'University of Colorado Colorado Springs',
        'University of Chicago', 'Google Research', 'Google Brain',
        'Stevens Institute of Technology', 'Stanford University', 'MIT',
        'United Technologies Research Center', 'Intel Labs',
        'University of Illinois', 'Massachussetts Institute of Technology',
        'Microsoft Research', 'Caltech', 'WUSTL', 'Purdue University',
        'University of Texas', 'University of Massachusetts',
        'Cornell University and Cornell Tech', 'Google AI',
        'University of Washington', 'Columbia University', 'Google Inc.',
        'Brandeis University', 'University of Georgia', 'TTI at Chicago',
        'University of Minnesota', 'Cornell University',
        'Georgia Institute of Technology', 'Texas A&M University',
        'Yale University', 'Georgia State University',
        'University of Pennsylvania', 'University of Central Florida',
        'Massachusetts Institute of Technology',
        'University of Pittsburgh', 'Uber AI Labs', 'University of Colorado',
        'Brown University', 'UCLA', 'Georgia Tech', 'Harvard University',
        'Pittsburgh', 'Schlumberger Software Technology Innovation Center',
        'Weill Cornell Medicine', 'University of Maryland',
        'State University of New York at Buffalo', 'UIUC',
        'Indiana University Bloomington', 'Oregon State University',
        'Fred Hutchinson Cancer Research Center', 'Salk Institute',
        'Playground Global', 'The Ohio State University', 'UC Berkeley',
        'Stanford Graduate School of Business', 'Intel AI Lab',
        'George Washington University', 'University of Michigan',
        'University of Iowa', 'Tableau Software',
        'Harvey Mudd College', 'Iowa State University',
        'University of Miami', 'Penn State University',
        'Washington University', 'Stony Brook University',
        'USC Information Sciences Institute',
        'Binghamton University', 'University of North Carolina',
        'Rensselaer Polytechnic Institute', 'The Voleon Group', 'Microsoft',
        'Amazon Research', 'UT Austin', 'IBM', 'Adobe Research',
        'Duke University', 'Northeastern University', 'Facebook AI Research',
        'Stanford', 'UC Los Angeles', 'Rutgers University',
        'New York University', 'University of Rochester',
        'University of Utah', 'West Virginia University',
        'Toyota Technological Institute at Chicago', 'uw', 'Boston University',
        'California Institute of Technology', 'University at Buffalo',
        'Dartmouth College', 'Lehigh University', 'Google', 'M.I.T.',
        'University of Wisconsin-Madison', 'University of Florida', 'Facebook',
        'google', 'University of Virginia'],
    'GB': ['University College London', 'University of Oxford',
           'Imperial College London', 'DeepMind', 'University of Warwick',
           'University of Cambridge', 'PROWLER.io',
           'University of Edinburgh', 'University of Western Ontario',
           'University of Glasgow', 'Queen Mary University of London',
           'AimBrain Ltd.', 'University of Bath', 'University of Manchester'],
    'CN': ['Tianjin University', 'National University of Defense Technology',
           'Xidian University', 'Shanghai Jiao Tong University',
           'Tencent AI Lab', 'Peking University', 'Tsinghua University',
           'Fudan University', 'Dalian University of Technology',
           'University of Science and Technology of China',
           'Chinese Academy of Sciences', '4Paradigm Inc.',
           'SenseTime', 'Beijing University of Posts and Telecommunications',
           'Sun Yat-sen University', 'Nankai University',
           'Nanjing University', 'Sun Yat-Sen University',
           'Shenzhen Key Laboratory of Computational Intelligence',
           'Renmin University of China', 'Baidu Research', 'Huawei',
           'New York University Shanghai', 'Zhejiang University',
           'Hulu LLC', 'Hangzhou Dianzi University'],
    'TW': ['HTC Research', 'National Tsing Hua University'],
    'HK': ['The Chinese University of Hong Kong', 'The University of Hong Kong'],
    'AT': ['University of Innsbruck', 'University of Vienna'],
    'KR': [
        'Korea Advanced Institute of Science and Technology', 'KAIST',
        'Seoul National University', 'Yonsei University', 'Lunit Inc.',
        'Ulsan National Institute of Science and Technology', 'UNIST'],
    'ZA': ['Stellenbosch University',
           'University of the Witwatersrand'],
    'CH': ['École Polytechnique Fédérale de Lausanne', 'ETH Zürich',
           'EPFL', 'ETH Zurich', 'University of Geneva',
           'The Swiss AI Lab IDSIA'],
    'JP': ['The University of Tokyo', 'RIKEN Center for Brain Science',
           'Keio Univ.', 'Keio University',
           'National Institute of Advanced Industrial Science and Technology',
           'The University of Electro-Communications',
           'Toyota Central R&D Labs.',
           'Sony Imaging Products & Solutions Inc.',
           'Okinawa Institute of Science and Technology Graduate University'],
    'NL': ['University of Amsterdam', 'Radboud University',
           'Navinfo Europe Research'],
    'CA': ['McGill University', 'University of Toronto',
           'University of Waterloo', 'University of British Columbia',
           'University of Alberta', 'University of Calgary',
           'Element AI', 'D-Wave Systems Inc.',
           'U. of Ontario Inst. of Tech.', 'Simon Fraser University',
           'Vector Institute', 'ÉTS Montreal'],
    'FR': ['Université Paris-Saclay', 'University of Rennes', 'EURECOM',
           'PSL Research University', 'Ecole Polytechnique',
           'Sorbonne Université', 'École Normale Supérieure',
           'fifty-five', 'Inria', 'Université Claude Bernard Lyon 1',
           'Université de Bordeaux', 'Université Paris-Saclay'],
    'IT': ['Università degli Studi di Pavia', 'Politecnico di Torino',
           'Politecnico di Milano', 'Sapienza University',
           'Istituto Italiano di Tecnologia'],
    'DE': ['TU Dortmund University',
           'Bosch Center for Artificial Intelligence',
           'Max-Planck Institute for Intelligent Systems',
           'Max-Planck-Institute for Intelligent Systems',
           'Max Planck Institute for Intelligent Systems',
           'Max Planck Institute for Informatics',
           'University of Tübingen', 'MPI-SWS',
           'Technische Universität München',
           'TU Darmstadt', 'École polytechnique fédérale de Lausanne',
           'Ostwestfalen-Lippe University of Applied Sciences',
           'Friedrich-Schiller-Universität Jena',
           'Freie Universität Berlin',
           'École Polytechnique Fédérale de Lausanne',
           'TU Dortmund', 'Technical University of Munich',
           'Amazon Berlin', 'Technische Universität Darmstadt'],
    'AU': ['The University of Sydney', 'University of Technology Sydney',
           'Macquarie University', 'University of Melbourne',
           'Deakin University', 'UNSW Sydney',
           'Australian National University'],
    'PK': ['Information Technology University Lahore'],
    'TH': ['Vidyasirimedhi Institute of Science and Technology'],
    'RU': ['Skolkovo Institute of Science and Technology',
           'Moscow Institute of Physics and Technology',
           'Lomonosov Moscow State University'],
    'ES': ['Universitat Autònoma de Barcelona',
           'Universidad Carlos III de Madrid'],
    'DK': ['IT University of Copenhagen', 'University of Copenhagen',
           'Aarhus University'],
    'IL': ['Weizmann Institute of Science', 'Tel Aviv University',
           'Bar Ilan University', 'Bar-Ilan University',
           'Technion', 'Israel Institute of Technology',
           'The Hebrew University of Jerusalem',
           'Ariel University'],
    'SG': ['National University of Singapore',
           'Singapore University of Technology and Design',
           'Nanyang Technological University',
           'Singapore Management University'],
    'BR': ['Universidade Federal de Minas Gerais', 'UFMG'],
    'PL': ['Jagiellonian University',
           'Wroclaw University of Science and Technology',
           'Poznan University of Technology'],
    'BE': ['KU Leuven'],
    'IN': ['Indian Institute of Science', 'Indian Institute of Technology'],
    'FI': ['Aalto University'],
    'SE': ['Lund University', 'Uppsala University', 'KTH'],
    'CL': ['Universidad de Chile']
}

organizations = []
for key, values in org_names.items():
    for name in values:
        org = {
            'name': name,
            'country_code': key,
            'other_names': []
        }
        organizations.append(org)

org_coll = paper_db['organization_collection']
org_coll.delete_many({})
org_coll.insert_many(organizations)

papers = []
paper_coll = paper_db['paper_info']
paper_coll.delete_many({})
read_limit = 75


def test_abbreviation(src, title):
    abbreviation_dict = {
        'VAEs': 'Variational Autoencoders',
        'CNNs?': 'Networks?'
    }
    src_last = src.split(' ')[-1]
    if src_last in abbreviation_dict and title.endswith(
            abbreviation_dict[src_last]):
        return True
    return False


# def classify_by_org(org_str, paper):
#     university = re.compile(
#         'universit[yé]|Politecnico di|Technion.+Israel'
#         '|UC (Berkeley|Los Angeles)'
#         '|universi(tat|dade)|UIUC'
#         '|Télécom ParisTech'
#         '|ETH Zürich'
#         '|TU Dortmund'
#         '|ÉTS Montreal'
#         '|U\\. of Ontario Inst\\. of Tech\\.'
#         '|Universität'
#         '|Seattle, WA 98195|UCLA'
#         '|Università',
#         flags=re.I)
#     if re.search(university, org_str):
#         organizations['university'].add(paper)
#         return True
#     institute = re.compile(
#         'institute|MIT|Inria|KAIST|ETH Zurich|college'
#         '|EPFL', flags=re.I)
#     if re.search(institute, org_str):
#         organizations['institute'].add(paper)
#         return True
#     corporation = re.compile(
#         'Google|IBM|Microsoft|Adobe|Tencent|Intel|Deepmind|Alibaba|Uber|AimBrain'
#         '|Research Center|Huawei|Element AI|ntt software innovation center'
#         '|Inc\\.|Amazon|Baidu',
#         flags=re.I)
#     if re.search(corporation, org_str):
#         organizations['corporation'].add(paper)
#         return True
#     if re.search("École Polytechnique Fédérale de Lausanne", org_str):
#         organizations['university'].add(paper)
#         return True
#     return False


year_dir = [year for year in os.listdir(data_base_path) if os.path.isdir(
    os.path.join(data_base_path, year))]

for year in year_dir:
    parent = os.path.join(data_base_path, year)
    intro = os.path.join(parent, 'intro')
    pdf = os.path.join(parent, 'pdf')
    txt = os.path.join(parent, 'txt')
    not_yet = []
    for fstr in os.listdir(intro):
        intro_file_path = os.path.join(intro, fstr)
        fname = fstr[:-5]
        # construct paper info item
        paper = {
            'conference': 'NIPS',
            'year': 2018,
            'link': base_url + fname
        }
        # read title and author info from intro files
        with open(intro_file_path, 'r') as intro_file:
            intro_parsed = BeautifulSoup(intro_file.read(), 'lxml')
            title = intro_parsed.title.string
            paper['title'] = title
            authors = [author.string for author in intro_parsed.find_all(
                'li', 'author')]
            if not len(authors) and fname in no_author_outlier.keys():
                authors = no_author_outlier[fname]
            paper['authors'] = authors
            # get abstract from intro file
            paper['abstract'] = intro_parsed.find(
                'p', class_='abstract').string
            # get corresponding txt file name
            link_name = intro_parsed.find(
                href=re.compile("/paper.+.pdf$"))['href'][7:-4]
            txt_file_path = os.path.join(txt, link_name + '.txt')
            if not os.path.isfile(txt_file_path):
                print(link_name + '.txt not exist!')
            title_compact = ''.join(title.split(' '))
            title_last = re.split(' |-', title)[-1]
            last_matches = re.compile(
                re.escape(title_last[:-1]) + r".*$", flags=re.I)
            with open(txt_file_path, 'r') as txt_file:
                tstr, test, result, lines = '', None, False, 0
                while len(tstr) < len(title):
                    tstr += txt_file.readline().rstrip()
                    lines += 1
                    test = re.search(last_matches, tstr)
                    if test or test_abbreviation(tstr, title):
                        result = True
                        break
                    tstr += ' '
                if not result:
                    print('match error!')
                    print(title)
                    print(tstr)
                # # search for the (first) author name
                # while True:
                #     name_str = txt_file.readline().rstrip()
                #     lines += 1
                #     name_str = ''.join(
                #         s for s in name_str if s.isalpha() or s.isspace()
                #         or s == ',')
                #     if len(name_str) > 1:
                #         # print(name_str)
                #         break
                # # search for the organization of the first author
                # while lines < read_limit:
                #     org_str = txt_file.readline().rstrip()
                #     lines += 1
                #     if len(org_str) > 1 and classify_by_org(org_str, fstr):
                #         break
                # # if lines >= read_limit:
                # #     print(fstr[0:4])
                # org_str += ' ' + txt_file.readline().rstrip()
                # print(fstr[0:4], org_str)
                temp_list = [
                    name for val in list(org_names.values()) for name in val]
                names = regex.compile(r"\L<orgs>", orgs=temp_list)
                org_str, found = '', False
                while lines < read_limit:
                    org_str += txt_file.readline().rstrip() + ' '
                    lines += 1
                    results = names.search(org_str)
                    if results:
                        paper['organization'] = results[0]
                        found = True
                        break
                if not found:
                    not_yet.append(int(fstr[0:4]))
        papers.append(paper)
    print(sorted(not_yet))
    paper_coll.insert_many(papers)
