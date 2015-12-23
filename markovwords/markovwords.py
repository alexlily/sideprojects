import nltk
from nltk.corpus import brown

words = list(brown.words())
bigrams = [(words[i].lower(), words[i+1].lower()) for i in range(len(words)-1)]
print(nltk.FreqDist(bigrams).most_common())