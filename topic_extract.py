import sys
import os
import json


def topic_extract(src, dest):
    word_dict = {}
    if not os.path.isfile(src):
        print('source file error!')
        return
    with open(src) as result:
        for line in result.readlines():
            if line.startswith('Epoch'):
                continue
            elif line.startswith('Topic'):
                keywords = line.strip().split(':')[1].strip().split()
                # print(keywords)
                for w in keywords:
                    if w in word_dict:
                        word_dict[w] += 1
                    else:
                        word_dict[w] = 1
    # print(word_dict)
    keywords = sorted(word_dict.keys())
    # print(keywords)
    for i in range(0, len(keywords) - 1):
        s, l = keywords[i], keywords[i + 1]
        if l.startswith(s) and l.endswith('s'):
            word_dict[s] += word_dict.pop(l, None)
    # print(word_dict)
    # print(sum(word_dict.values()))
    wordList = word_dict.items()
    wordList = sorted(wordList, key=lambda x: x[1], reverse=True)
    for w in wordList:
        print(w[1], w[0])
    if dest:
        result = [{"name": k, "weight": word_dict[k]} for k in word_dict]
        with open(dest, 'w') as dfile:
            json.dump(result, dfile)


if __name__ == '__main__':
    # print(len(sys.argv))
    if len(sys.argv) < 3:
        topic_extract(sys.argv[1], '')
    else:
        topic_extract(sys.argv[1], sys.argv[2])
