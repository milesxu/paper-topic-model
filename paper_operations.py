import os
import sys
import regex
import time
import random
import json
import requests
import argparse
from bs4 import BeautifulSoup

org_names = {
    'US': ['University of Southern California',
           'University of California', 'Johns Hopkins University',
           'IBM Research', 'Texas A& M University',
           'Carnegie Mellon University',
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
           'Toyota Technological Institute at Chicago', 'uw',
           'Boston University',
           'California Institute of Technology', 'University at Buffalo',
           'Dartmouth College', 'Lehigh University', 'Google', 'M.I.T.',
           'University of Wisconsin-Madison', 'University of Florida', 'Facebook',
           'google', 'University of Virginia', 'Michigan State University',
           'University of Wisconsin', 'NVIDIA', 'UC Merced',
           'University of Wisconsin - Madison', 'Villanova University',
           'Los Alamos National Laboratory', 'Snap Research',
           'Rochester Institute of Technology', 'Portland State University',
           'George Mason University', 'Siemens Corporate Technology',
           'State University of New York',
           'The University of Tennessee', 'UMass Amherst',
           'The University of Kansas',
           'Institute for Robotics and Intelligent Systems',
           'Information Sciences Institute', 'Wayne State University',
           'Apple Inc',
           'UW-Madison', 'Colorado State University', 'Indiana University',
           'Northwestern University', 'U. of Southern California',
           'UC San Diego', 'Lawrence Livermore National Laboratory', 'UT-Austin',
           'Rice University', 'Colorado School of Mines', 'ImaginationAI LLC',
           'Boston Children’s Hospital', 'UMD',
           'National Institutes of Health',
           'National Institutes of Health Clinical Center',
           'Drexel University', 'Intel Corporation', 'UC Santa Barbara',
           'GMEMS Technologies and Spectimbre', 'Salesforce Research',
           'UCSF', 'U NI', 'National Institute of Mental Health',
           'Wichita State University', 'Disney Research',
           'Franklin & Marshall College', 'DePaul University',
           'University of Kentucky', 'Loyola Marymount University',
           'Two Sigma', 'BAE Systems FAST Labs', 'SUNY at Albany',
           'Vanderbilt University', 'Loyola Marymount University',
           'Yahoo Research', 'Magic Leap', 'Harvard Medical School',
           'Disney Research', 'Georgia Institute of Technology',
           'Rutgers Business School', 'Boston College',
           'Pennsylvania State University', 'Georgia Instiute of Technology',
           'Florida State University', 'Amazon', 'Chan-Zuckerberg Biohub',
           'Worcester Polytechnic Institute', 'Cold Spring Harbor',
           'OpenAI', 'Cargenie Mellon University', 'Temple University',
           'Arizona State University', 'UNC Chapel Hill',
           'Information Directorate', 'University of Nevada',
           'HRL Laboratories', 'University of Delaware',
           'University of Houston', 'umd', 'HP Inc', 'MVTec',
           'University of Notre Dame', 'Laboratory for Physical Sciences',
           'North Carolina State University',
           'Uber Advanced Technologies Group', 'Toyota Research Institute',
           'Illinois Institute of Technology', 'nuTonomy',
           'Flordia International University', 'IBM research'],
    'GB': ['University College London', 'University of Oxford',
           'Imperial College London', 'DeepMind', 'University of Warwick',
           'University of Cambridge', 'PROWLER.io',
           'University of Edinburgh', 'University of Western Ontario',
           'University of Glasgow', 'Queen Mary University of London',
           'AimBrain Ltd.', 'University of Bath', 'University of Manchester',
           'The University of Nottingham', 'University of Surrey',
           'Durham University', 'Mitsubishi Electric Research Laboratories',
           'University of East Anglia', 'University of Bristol',
           'Kingston University', 'University of Birmingham',
           'University of Southampton', 'Babylon Health',
           'The Alan Turing Institute', 'Amazon Cambridge',
           'University of Sheffield', 'University of Nottingham',
           'University of Warwick', 'Newcastle University', 'Cambridge',
           'University of Liverpool', 'Faculty', 'Cardiff University',
           'Queen’s University Belfast', 'University of York', 'Ariel AI',
           'ISEE.AI'],
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
           'Hulu LLC', 'Hangzhou Dianzi University', 'Beihang University',
           'Huazhong University of Science and Technology', 'Xiamen University',
           'Xi’an Jiaotong University', 'Jiangnan University',
           'Wuhan University', 'Harbin Institute of Technology',
           'Alibaba Group',
           'University of Electronic Science and Technology of China',
           'DeepMotion', 'ShanghaiTech University', 'Sichuan University',
           'Chinese Academy of Science', 'Communication University of China',
           'Xian Jiaotong University', 'Face++',
           'Northwestern Polytechnical University', 'Shanghaitech University',
           'South China University of Technology',
           'East China Normal University',
           'Nanjing Institute of Advanced Artificial Intelligence',
           'Shenzhen University', 'Southeast University', 'Anhui University',
           'JD AI Research', 'CAS', 'Sensetime', 'Malong Technologies',
           'UCAS', 'Hikvision Research Institute', 'JD.COM'],
    'TW': ['HTC Research', 'National Tsing Hua University',
           'National Taiwan University', 'National Chiao Tung University',
           'National Tsing Hua Uiversity'],
    'HK': ['The Chinese University of Hong Kong', 'The University of Hong Kong',
           'The Hong Kong University of Science and Technology',
           'The Hong Kong Polytechnic University',
           'Hong Kong University of Science and Technology',
           'University of Hong Kong', 'Hong Kong Baptist University', 'HKUST'],
    'AT': ['University of Innsbruck', 'University of Vienna',
           'Graz University of Technology', 'TU Wien',
           'Institute of Science and Technology Austria',
           'Klosterneuburg', 'Johannes Kepler University Linz'],
    'KR': ['Korea Advanced Institute of Science and Technology', 'KAIST',
           'Seoul National University', 'Yonsei University', 'Lunit Inc.',
           'Ulsan National Institute of Science and Technology', 'UNIST',
           'Korea University', 'DGIST', 'POSTECH',
           'Electronics and Telecommunications Research Institute',
           'NAVER Corp.', 'Pohang University of Science and Technology',
           'Artificial Intelligence Research Institute', 'LG Electronics',
           'Korea university', 'Chung-Ang University', 'Samsung Semiconductor'],
    'ZA': ['Stellenbosch University',
           'University of the Witwatersrand'],
    'CH': ['École Polytechnique Fédérale de Lausanne', 'ETH Zürich',
           'ETH Zürich', 'ETH Z URICH',
           'EPFL', 'ETH Zurich', 'University of Geneva',
           'The Swiss AI Lab IDSIA', 'University of Bern',
           'University of Basel', 'IDSIA', 'The Swiss AI Lab',
           'École Polytechnique Fédérale Lausanne', 'ETH, Zurich',
           'NNAISENSE', 'Idiap Research Institute'],
    'JP': ['The University of Tokyo', 'RIKEN Center for Brain Science',
           'Keio Univ.', 'Keio University',
           'National Institute of Advanced Industrial Science and Technology',
           'The University of Electro-Communications',
           'Toyota Central R&D Labs.',
           'Sony Imaging Products & Solutions Inc.',
           'Okinawa Institute of Science and Technology Graduate University',
           'NTT Media Intelligence Laboratories', 'Osaka University',
           'OIST Graduate University', 'National Institute of Informatics',
           'Saitama University', 'Tokyo Metropolitan University',
           'Nara Institute of Science and Technology (NAIST)',
           'Kyoto University', 'Tohoku University',
           'Nagoya Institute of Technology',
           'NTT Communication Science Laboratories',
           'Nagoya Institute of Technology', 'RIKEN AIP',
           'Preferred Networks', 'University of Tokyo',
           'NEC Corporation', 'LAPRAS Inc', 'Hitachi', 'Waseda University',
           'Kobe University', 'Chubu University',
           'RIKEN Center for Advanced Intelligence Project'],
    'NL': ['University of Amsterdam', 'Radboud University',
           'Navinfo Europe Research', 'Delft University of Technology'],
    'CA': ['McGill University', 'University of Toronto',
           'University of Waterloo', 'University of British Columbia',
           'University of Alberta', 'University of Calgary',
           'Element AI', 'D-Wave Systems Inc.',
           'U. of Ontario Inst. of Tech.', 'Simon Fraser University',
           'Vector Institute', 'ÉTS Montreal', 'York University',
           'Uber ATG Toronto', 'University of Manitoba', 'Ryerson University',
           'Dalhousie University', 'Université de Montréal',
           'Borealis AI', 'Montreal Institute for Learning Algorithms (MILA)',
           'MILA', 'Quebec', 'Mila', 'Université de Sherbrooke',
           'Layer6 AI'],
    'FR': ['Université Paris-Saclay', 'University of Rennes', 'EURECOM',
           'PSL Research University', 'Ecole Polytechnique',
           'Sorbonne Université', 'École Normale Supérieure',
           'fifty-five', 'Inria', 'Université Claude Bernard Lyon 1',
           'Université de Bordeaux', 'Université Paris-Saclay',
           'Centre de Recherche en Informatique Signal et Automatique de Lille',
           'University of Bordeaux', 'Sorbonne université',
           'University Paris-Est', 'Université Clermont Auvergne',
           'Paris Seine University', 'Université Paris-Est',
           'UPMC Sorbonne Universités', 'Sorbonne Universite',
           'CEA List', 'ENSAE-CREST', 'France Orange Labs Lannion',
           'Université d’Artois', 'Télécom ParisTech', 'IDEMIA', 'INRIA',
           'King Abdullah University of Science & Technology',
           'Université de Toulouse', 'Institut Polytechnique de Paris',
           'Telecom ParisTech', 'Sharif University of Technolog', 'Criteo',
           'Université Paris Saclay', 'Normandy University',
           'University ParisSaclay', 'IRISA', 'Univ. ParisSud',
           'Normandie Univ', 'NAVER LABS Europe', 'Technicolor', 'valeo.ai',
           'Univ. Paris-Est'],
    'IT': ['Università degli Studi di Pavia', 'Politecnico di Torino',
           'Politecnico di Milano', 'Sapienza University',
           'Istituto Italiano di Tecnologia', 'University of Trento',
           'University of Pisa', 'University of Milan', 'University of Pisa',
           'University of Verona', 'Università degli Studi di Udine',
           'University of Modena and Reggio Emilia',
           'University of Bologna', 'University of Padova'],
    'DE': ['TU Dortmund University',
           'Bosch Center for Artificial Intelligence',
           'Max-Planck Institute for Intelligent Systems',
           'Max-Planck-Institute for Intelligent Systems',
           'Max Planck Institute for Intelligent Systems',
           'Max Planck Institute for Intelligent Systems',
           'Max Planck Institute for Informatics',
           'Max-Planck Institute for Informatics',
           'University of Tübingen', 'MPI-SWS',
           'Technische Universität München',
           'TU Darmstadt', 'École polytechnique fédérale de Lausanne',
           'Ostwestfalen-Lippe University of Applied Sciences',
           'Friedrich-Schiller-Universität Jena',
           'Freie Universität Berlin',
           'École Polytechnique Fédérale de Lausanne',
           'TU Dortmund', 'Technical University of Munich',
           'Amazon Berlin', 'Technische Universität Darmstadt',
           'Karlsruhe Institute of Technology',
           'The Research Institute of the Free State of Bavaria',
           'University of Tübingen', 'Technische Universität München',
           'German Research Center for Artificial Intelligence (DFKI)',
           'MPI Informatics',
           'Heidelberg Collaboratory for Image Processing (HCI)',
           'Heidelberg University', 'University of Bonn', 'Robert Bosch GmbH',
           'Heidelberg Collaboratory for Image Processing',
           'University of Konstanz', 'Hochschule Fulda', 'Kiel University',
           'Universität Hamburg', 'Visual Learning Lab Heidelberg',
           'German Cancer Research Center', 'Siemens AG Munich',
           'Bielefeld University', 'Technische Universität Darmstadt',
           'TU Kaiserslautern', 'Bielefeld University',
           'Universität Bonn', 'Zalando Research', 'Paderborn University',
           'University of Freiburg', 'Goethe University',
           'University of Bremen', 'University of Göttingen', 'Labatie-AI',
           'NEC Laboratories Europe', 'Saarland University',
           'Ludwig Maximilian University of Munich',
           'University of Hamburg', 'MPI for Informatics', 'CSBD',
           'Sony Europe', 'German Research Center for Artificial Intelligence',
           'Leibniz Universität Hannover'],
    'AU': ['The University of Sydney', 'University of Technology Sydney',
           'Macquarie University', 'University of Melbourne',
           'Deakin University', 'UNSW Sydney',
           'Australian National University', 'University of Adelaide',
           'University of Wollongong', 'University of Sydney',
           'The University of Adelaide', 'CSIRO', 'Monash University',
           'University of Queensland'],
    'PK': ['Information Technology University Lahore'],
    'TH': ['Vidyasirimedhi Institute of Science and Technology'],
    'RU': ['Skolkovo Institute of Science and Technology',
           'Moscow Institute of Physics and Technology',
           'Lomonosov Moscow State University',
           'Samsung AI Center Moscow'],
    'ES': ['Universitat Autònoma de Barcelona',
           'Universidad Carlos III de Madrid', 'University of Malaga',
           'Institut de Robòtica i Informàtica Industrial',
           'Universitat Autònoma de Barcelona',
           'Telefónica Research', 'Universitat Politècnica de Catalunya',
           'Universitat Pompeu Fabra', 'Universidad de Valladolid', 'UAB'],
    'DK': ['IT University of Copenhagen', 'University of Copenhagen',
           'Aarhus University', 'Technical University of Denmark',
           'University of Aarhus'],
    'IL': ['Weizmann Institute of Science', 'Tel Aviv University',
           'Bar Ilan University', 'Bar-Ilan University',
           'Technion', 'Israel Institute of Technology',
           'The Hebrew University of Jerusalem',
           'Ariel University', 'Tel-Aviv University',
           'The Open University of Israel', 'Ben-Gurion University',
           'University of Haifa', 'Hailo technologies', 'Techion IIT',
           'Samsung Israel'],
    'SG': ['National University of Singapore',
           'Singapore University of Technology and Design',
           'Nanyang Technological University',
           'Singapore Management University',
           'Singapore University Of Technology And Design',
           'Institute of High Performance Computing', 'A*STAR'],
    'BR': ['Universidade Federal de Minas Gerais', 'UFMG',
           'Pontifı́cia Universidade Católica', 'PUCRIO',
           'Universidade Federal de São Carlos',
           'Pontifícia Universidade Católica',
           'Federal University of Rio Grande do Sul',
           'Pontifícia Universidade Católica do Rio Grande do Sul'],
    'PL': ['Jagiellonian University',
           'Wroclaw University of Science and Technology',
           'Poznan University of Technology'],
    'BE': ['KU Leuven', 'Ghent University',
           'Université Catholique de Louvain',
           'Université Libre de Bruxelles'],
    'IN': ['Indian Institute of Science', 'Indian Institute of Technology',
           'IIT Kanpur', 'IIIT Delhi', 'IIT Madras', 'IIT Bombay',
           'IIIT-Delhi'],
    'FI': ['Aalto University'],
    'SE': ['Lund University', 'Uppsala University', 'KTH',
           'Linköping University', 'Linköping University',
           'Mapillary Research', 'Mapillary'],
    'CL': ['Universidad de Chile'],
    'HU': ['MTA SZTAKI'],
    'CZ': ['Czech Technical University', 'CTU'],
    'SA': ['King Abdullah University of Science and Technology (KAUST)',
           'Saudi Aramco', 'KAUST'],
    'GR': ['National Technical University of Athens',
           'Technical University of Crete'],
    'CO': ['University of South Carolina', 'University of Missouri'],
    'AE': ['Inception Institute of Artificial Intelligence'],
    'IE': ['Dublin City University', 'University College Dublin'],
    'UA': ['Ukrainian Catholic University'],
    'PT': ['INESC TEC Porto', 'University of Coimbra'],
    'SI': ['University of Ljubljana'],
    'UY': ['Universidad de la República'],
    'NO': ['University of Bergen', 'Kongsberg Seatex'],
    'TR': ['Koç University', 'Bilkent University',
           'Middle East Technical University'],
    'MO': ['University of Macau']
}

outlier = {
    'cvpr2018': ['Fang_Weakly_and_Semi_CVPR_2018_paper',
                 'Wang_Modulated_Convolutional_Networks_CVPR_2018_paper',
                 'Zlateski_On_the_Importance_CVPR_2018_paper',
                 'Mo_Uncalibrated_Photometric_Stereo_CVPR_2018_paper',
                 'Liu_Learning_Markov_Clustering_CVPR_2018_paper',
                 'Ravi_Show_Me_a_CVPR_2018_paper',
                 'Li_Learning_Intrinsic_Image_CVPR_2018_paper',
                 'Zhou_Explicit_Loss-Error-Aware_Quantization_CVPR_2018_paper'],
    'iclr2019': ['BJgK6iA5KX', 'Bkg6RiCqY7', 'Bkx0RjA9tX', 'ByxPYjC5KQ:Deakin University',
                 'H1lJJnR5Ym', 'HJe62s09tX', 'Ske5r3AqK7', 'SylKoo0cKm',
                 'r1lWUoA9FQ', 'rJNwDjAqYX', 'rJxHsjRqFQ', 'rylIAsCqYm',
                 'ByxkijC5FQ'],
    'icml2018': ['garnelo18a:DeepMind'],
    'icml2019': ['huang19f:Apple Inc', 'lamb19a:Mila']
}


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


def paper_list(basic_path):
    links = os.path.join(basic_path, 'links.txt')
    pages = os.path.join(basic_path, 'pages.txt')
    titles = os.path.join(basic_path, 'titles.txt')
    with open(links, 'r') as lfile:
        with open(pages, 'r') as pfile:
            with open(titles, 'r') as tfile:
                for link, page, title in zip(lfile, pfile, tfile):
                    yield link.strip(), page.strip(), title.strip()


def org_extract(txt_path):
    '''
    TODO: add outliers' info directly
    '''
    if not os.path.isfile(txt_path):
        _, tail = os.path.split(txt_path)
        print(tail + ' not found!')
    read_limit = 120
    temp_list = [name for val in list(org_names.values()) for name in val]
    names = regex.compile(r"\L<orgs>", orgs=temp_list, flags=regex.UNICODE)
    org_str, found, lines = '', False, 0
    with open(txt_path, 'r') as txt_file:
        while lines < read_limit:
            org_str += txt_file.readline().rstrip() + ' '
            lines += 1
            results = names.search(org_str)
            if results:
                return results[0]
        # results = regex.compile(r"ETH Zürich").search(org_str)
        if 'ETH Zürich' in org_str:
            return 'ETH Zürich'
        print(f'{txt_path} org not found!')
        return ''


def cvpr_crawler(page_parsed):
    authors = page_parsed.find('div', {'id': 'authors'}).i.string.strip()
    abstract = page_parsed.find('div', {'id': 'abstract'}).string.strip()
    return authors, abstract


def iclr_crawler(page_parsed):
    authors = page_parsed.find(
        'h3', {'class': 'signatures author'}).string.strip()
    abstract = page_parsed.find(
        'span', {'class': 'note-content-value'}).string.strip()
    return authors, abstract


def icml_crawler(page_parsed):
    authors = page_parsed.find(
        'div', {'id': 'authors', 'class': 'authors'})
    if authors is None:
        authors = ''
    else:
        authors = authors.string.split(',')
        authors = [s.strip('; \n') for s in authors]
        authors = ','.join(authors)
    abstract = page_parsed.find(
        'div', {'id': 'abstract', 'class': 'abstract'})
    if abstract is None or abstract.string is None:
        abstract = ''
    else:
        abstract = abstract.string.strip()
    return authors, abstract


def basic_json_construct(dst_file):
    basic_path = os.path.dirname(dst_file)
    base_name = os.path.basename(basic_path)
    papers = []
    for link, page, title in paper_list(basic_path):
        paper = {
            'conference': base_name,
            'pdf': link,
            'intro': page,
            'title': title,
        }
        papers.append(paper)
    with open(dst_file, 'w+') as dfile:
        json.dump(papers, dfile)


def paper_info_build(basic_path, org_build=False, crawl=False,
                     write=False):
    papers = []
    json_file = os.path.join(basic_path, 'papers.json')
    if not os.path.isfile(json_file):
        basic_json_construct(json_file)
    with open(json_file, 'r') as jfile:
        papers = json.load(jfile)
    for paper in papers:
        pdf_name = paper['pdf'].split('/')[-1]
        if not pdf_name.endswith('.pdf'):
            pdf_name = pdf_name.split('=')[-1] + '.pdf'
        txt_name = pdf_name[0:-3] + 'txt'
        txt_path = os.path.join(basic_path, 'txt', txt_name)
        if org_build:
            paper['organization'] = org_extract(txt_path)
        if crawl:
            retry = 0
            authors, abstract = '', ''
            base_name = os.path.basename(basic_path)
            while (not authors or not abstract) and retry < 3:
                intro = requests.get(paper['intro'])
                intro_parsed = BeautifulSoup(intro.text, 'lxml')
                if base_name.startswith('cvpr'):
                    authors, abstract = cvpr_crawler(intro_parsed)
                elif base_name.startswith('iclr'):
                    authors, abstract = iclr_crawler(intro_parsed)
                elif base_name.startswith('icml'):
                    authors, abstract = icml_crawler(intro_parsed)
                time.sleep(5 + random.randint(0, 5))
                retry += 1
            print(authors, abstract)
            paper['authors'] = authors
            paper['abstract'] = abstract
            # papers.append(paper)
    if write:
        with open(json_file, 'w+') as jfile:
            json.dump(papers, jfile)


def generate_org_json():
    # print(org_names.items())
    org_list = []
    for key, value in org_names.items():
        org_list.append({
            'country': key,
            'organizations': value
        })
    with open('orgs.json', 'w+') as ofile:
        json.dump(org_list, ofile)


if __name__ == "__main__":
    # parser = argparse.ArgumentParser()
    # parser.add_argument('path', type=str, help='path for papers')
    # parser.add_argument('-org', default=False, action='store_true',
    #                     help='whether extract org name from txt file')
    # parser.add_argument('-crawl', default=False, action='store_true',
    #                     help='whether extract org name from txt file')
    # parser.add_argument('-write', default=False, action='store_true',
    #                     help='whether extract org name from txt file')
    # args = parser.parse_args()
    # print(args.path, args.org, args.crawl, args.write)
    # paper_info_build(args.path, args.org, args.crawl, args.write)
    generate_org_json()
