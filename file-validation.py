import os
import re
import time
import random
import requests
from bs4 import BeautifulSoup

proxies = {
    'http': 'socks5://127.0.0.1:1080'}

base_url = 'http://papers.nips.cc/'

data_path = os.path.join(os.getcwd(), 'data')

year_dir = [year for year in os.listdir(data_path) if os.path.isdir(
    os.path.join(data_path, year))]

for year in year_dir:
    parent = os.path.join(data_path, year)
    intro_dir = os.path.join(parent, 'intro')
    txt_dir = os.path.join(parent, 'txt')

    # open toc file, get list of introduction page links
    toc_path = os.path.join(data_path, 'papers-' + year + '.html')
    with open(toc_path, 'r') as toc_file:
        toc_parsed = BeautifulSoup(toc_file.read(), 'lxml')
    paper_links = [a['href'][7:] for a in toc_parsed.find_all(
        href=re.compile("/paper.+"))]

    # validate intro file
    for paper in paper_links:
        intro_file = os.path.join(intro_dir, paper + '.html')
        if not os.path.isfile(intro_file):
            print(intro_file + ' not exist!')
        with open(intro_file, 'r') as ifile:
            intro_parsed = BeautifulSoup(ifile.read(), 'lxml')
        title = intro_parsed.title
        if not title:
            print(intro_file + ' no title!')
        #title = title.string
        authors = [author.string for author in intro_parsed.find_all(
            'li', 'author')]
        retry = 3
        while (not len(authors) or not title) and retry:
            url = base_url + 'paper/' + paper
            #intro_page = requests.get(url, proxies=proxies)
            intro_page = requests.get(url)
            intro_parsed = BeautifulSoup(intro_page.text, 'lxml')
            title = intro_parsed.title
            authors = [author.string for author in intro_parsed.find_all(
                'li', 'author')]
            time.sleep(5 + random.randint(0, 5))
            retry -= 1
        if len(authors) and title and retry < 3:
            with open(intro_file, 'w') as ifile:
                ifile.write(intro_page.text)
        if not retry:
            print(url)
