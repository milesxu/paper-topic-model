# -*- coding: utf-8 -*-

# TODO: Remove reference and authors

import os
import sys
import json
from sklearn.feature_extraction.text import CountVectorizer
from scipy.sparse import save_npz
from stopwords import stop_words

path = './data/2018/txt'


def process_txt(path, process=True):
    filenames = os.listdir(path)
    basename = os.path.basename(path)
    filejson = basename + '-filename.json'
    with open(filejson, 'w+') as jfile:
        json.dump(filenames, jfile)
    if process:
        corpus = []
        for filename in filenames:
            with open(path + '/' + filename, encoding='utf-8', mode='r') as f:
                content = f.read()
                if len(content) > 0:
                    corpus.append(content)
        N = len(corpus)
        vectorizer = CountVectorizer(
            token_pattern=r"(?u)\b[a-z]\w\w+\b", min_df=30.1/N,
            stop_words=stop_words)
        X = vectorizer.fit_transform(corpus)
        vocab = vectorizer.get_feature_names()

        save_npz(f'{basename}.npz', X)
        with open(f'{basename}_vocab.txt', encoding='utf-8', mode='w') as f:
            for word in vocab:
                f.write(word + '\n')


if __name__ == "__main__":
    process_txt(sys.argv[1])
