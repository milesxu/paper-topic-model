import re
import os
import time
import random
import requests
from bs4 import BeautifulSoup

base_url = 'http://papers.nips.cc/'

data_base_path = 'data'

if not os.path.exists(os.path.join(os.getcwd(), data_base_path)):
    os.mkdir(data_base_path)
os.chdir(data_base_path)

nips_home = requests.get(base_url)
home_parsed = BeautifulSoup(nips_home.text, 'lxml')
year_links = home_parsed.find_all(href=re.compile(".+-\\d+-\\d{4}"))
year_link_str = [a['href'] for a in year_links]

for link in year_link_str[0:1]:
    year = link[-4:]
    paper_fstr = 'papers-' + year + '.html'
    if not os.path.isfile(os.path.join(os.getcwd(), paper_fstr)):
        year_page = requests.get(base_url + link)
        with open(paper_fstr, 'w') as html_file:
            html_file.write(year_page.text)
            print(paper_fstr + ' downloaded.')
        year_parsed = BeautifulSoup(year_page.text, 'lxml')
    else:
        with open(paper_fstr, 'r') as html_file:
            year_parsed = BeautifulSoup(html_file.read(), 'lxml')
    if not os.path.exists(os.path.join(os.getcwd(), year)):
        os.mkdir(year)
    os.chdir(year)
    paper_links = year_parsed.find_all(href=re.compile("/paper.+"))
    paper_link_str = [a['href'] for a in paper_links]
    if not os.path.exists(os.path.join(os.getcwd(), 'intro')):
        os.mkdir('intro')
    if not os.path.exists(os.path.join(os.getcwd(), 'pdf')):
        os.mkdir('pdf')
    for paper in paper_link_str:
        pname = paper[7:]
        pname_fstr = pname + '.html'
        if not os.path.isfile(os.path.join(os.getcwd(), 'intro', pname_fstr)):
            paper_intro = requests.get(base_url + paper)
            with open('intro/' + pname_fstr, 'w') as html_file:
                html_file.write(paper_intro.text)
                print('introduction of ' + pname + ' downloaded.')
            paper_parsed = BeautifulSoup(paper_intro.text, 'lxml')
        else:
            with open('intro/' + pname_fstr, 'r') as html_file:
                paper_parsed = BeautifulSoup(html_file.read(), 'lxml')
        pdf_str = pname + '.pdf'
        if not os.path.isfile(os.path.join(os.getcwd(), 'pdf', pdf_str)):
            pdf_link = paper_parsed.find(
                href=re.compile("/paper.+pdf$"))['href']
            pdf_content = requests.get(base_url + pdf_link)
            with open('pdf/' + pdf_str, 'wb') as pdf_file:
                pdf_file.write(pdf_content.content)
                print('PDF doc of ' + pname + ' downloaded')
        time.sleep(5 + random.randint(0, 5))
