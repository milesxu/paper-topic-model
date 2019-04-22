# -*- coding: utf-8 -*-

# TODO: Remove reference and authors

import os
from sklearn.feature_extraction.text import CountVectorizer
from scipy.sparse import save_npz
from stopwords import stop_words

filenames = os.listdir('txt')
os.makedirs("result", exist_ok=True)

corpus = []

for filename in filenames:
    with open("txt/" + filename, encoding='utf-8', mode='r') as f:
        # content = f.read()
        add = False
        content = ""
        for line in f.readlines():
            if "References" in line:
                break
            if add:
                content += line
            if "Abstract" in line:
                add = True
    if len(content) > 0:
        corpus.append(content)
        with open("result/" + filename, encoding='utf-8', mode='w') as f:
            f.write(content)

N = len(corpus)

vectorizer = CountVectorizer(token_pattern=r"(?u)\b[a-z]\w\w+\b", min_df=30.1/N,
                             stop_words=stop_words)
X = vectorizer.fit_transform(corpus)
vocab = vectorizer.get_feature_names()

save_npz('nips.npz', X)
with open('nips_vocab.txt', encoding='utf-8', mode='w') as f:
    for word in vocab:
        f.write(word + '\n')
