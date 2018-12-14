import os
import re
from bs4 import BeautifulSoup

data_base_path = os.path.join(os.getcwd(), 'data')

no_author_outlier = ['7422-a-loss-framework-for-calibrated-anomaly-detection']

organizations = {
    'university': set(),
    'institute': set(),
    'corporation': set()
}

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


def classify_by_org(org_str, paper):
    university = re.compile(
        'universit[yé]|Politecnico di Milano|Technion.+Israel'
        '|UC (Berkeley|Los Angeles)'
        '|universi(tat|dade)|UIUC'
        '|Télécom ParisTech'
        '|ETH Zürich'
        '|TU Dortmund'
        '|ÉTS Montreal'
        '|U\\. of Ontario Inst\\. of Tech\\.'
        '|Universität'
        '|Seattle, WA 98195|UCLA',
        flags=re.I)
    if re.search(university, org_str):
        organizations['university'].add(paper)
        return True
    institute = re.compile(
        'institute|MIT|Inria|KAIST|ETH Zurich|college'
        '|EPFL', flags=re.I)
    if re.search(institute, org_str):
        organizations['institute'].add(paper)
        return True
    corporation = re.compile(
        'Google|IBM|Microsoft|Adobe|Tencent|Intel|Deepmind|Alibaba|Uber|AimBrain'
        '|Research Center|Huawei|Element AI|ntt software innovation center'
        '|Inc\\.|Amazon|Baidu',
        flags=re.I)
    if re.search(corporation, org_str):
        organizations['corporation'].add(paper)
        return True
    if re.search("École Polytechnique Fédérale de Lausanne", org_str):
        organizations['university'].add(paper)
        return True
    return False


year_dir = [year for year in os.listdir(data_base_path) if os.path.isdir(
    os.path.join(data_base_path, year))]

for year in year_dir:
    parent = os.path.join(data_base_path, year)
    intro = os.path.join(parent, 'intro')
    pdf = os.path.join(parent, 'pdf')
    txt = os.path.join(parent, 'txt')
    for fstr in os.listdir(intro):
        intro_file_path = os.path.join(intro, fstr)
        # read title and author info from intro files
        with open(intro_file_path, 'r') as intro_file:
            intro_parsed = BeautifulSoup(intro_file.read(), 'lxml')
            title = intro_parsed.title.string
            # authors = [author.string for author in intro_parsed.find_all(
            #     'li', 'author')]
            # if not len(authors):
            #     print('author error!')
            #     print(title)
            #     continue
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
                # search for the (first) author name
                while True:
                    name_str = txt_file.readline().rstrip()
                    lines += 1
                    name_str = ''.join(
                        s for s in name_str if s.isalpha() or s.isspace()
                        or s == ',')
                    if len(name_str) > 1:
                        # print(name_str)
                        break
                # search for the organization of the first author
                while lines < read_limit:
                    org_str = txt_file.readline().rstrip()
                    lines += 1
                    if len(org_str) > 1 and classify_by_org(org_str, fstr):
                        break
                if lines >= read_limit:
                    print(fstr[0:4])
