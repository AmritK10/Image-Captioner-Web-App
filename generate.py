from keras.models import load_model
from keras.applications.resnet50 import ResNet50
from keras.applications.resnet50 import preprocess_input
from keras.preprocessing.sequence import pad_sequences
from keras.preprocessing import image
import matplotlib.pyplot as plt
import numpy as np
import pickle
import cv2
import sys

#setting hyperparameters
max_length=40

new_model=load_model("Model_data/Img_cap_model.h5")

w2i_file=open("Model_data/words_to_indices.p","rb")
words_to_indices2 = pickle.load(w2i_file)

i2w_file=open("Model_data/indices_to_words.p","rb")
indices_to_words2 = pickle.load(i2w_file)

def greedy_search(photo):
  photo=photo.reshape(1,2048)
  in_text='<start>'
  for i in range(max_length):
    sequence = [words_to_indices2[s] for s in in_text.split(" ") if s in words_to_indices2]
    sequence = pad_sequences([sequence], maxlen=max_length, padding='post')
    y_pred = new_model.predict([photo,sequence],verbose=0)
    y_pred = np.argmax(y_pred[0])
    word = indices_to_words2[y_pred]
    in_text += ' ' + word
    if word == '<end>':
      break
  final = in_text.split()
  final = final[1:-1]
  #final = " ".join(final)
  return final

def beam_search2(photo,k):
  photo=photo.reshape(1,2048)
  in_text='<start>'
  sequence = [words_to_indices2[s] for s in in_text.split(" ") if s in words_to_indices2]
  sequence = pad_sequences([sequence], maxlen=max_length, padding='post')
  y_pred = new_model.predict([photo,sequence],verbose=0)
  predicted=[]
  y_pred=y_pred.reshape(-1)
  for i in range(y_pred.shape[0]):
    predicted.append((i,y_pred[i]))
  predicted=sorted(predicted,key=lambda x:x[1])[::-1]
  b_search=[]
  for i in range(k):
    word = indices_to_words2[predicted[i][0]]
    b_search.append((in_text +' ' + word,predicted[i][1]))
    
  for idx in range(max_length):
    b_search_square=[]
    for text in b_search:
      if text[0].split(" ")[-1]=="<end>":
        break
      sequence = [words_to_indices2[s] for s in text[0].split(" ") if s in words_to_indices2]
      sequence = pad_sequences([sequence], maxlen=max_length, padding='post')
      y_pred = new_model.predict([photo,sequence],verbose=0)
      predicted=[]
      y_pred=y_pred.reshape(-1)
      for i in range(y_pred.shape[0]):
        predicted.append((i,y_pred[i]))
      predicted=sorted(predicted,key=lambda x:x[1])[::-1]
      for i in range(k):
        word = indices_to_words2[predicted[i][0]]
        b_search_square.append((text[0] +' ' + word,predicted[i][1]*text[1]))
    if(len(b_search_square)>0):
      b_search=(sorted(b_search_square,key=lambda x:x[1])[::-1])[:5]
  final=b_search[0][0].split()
  final = final[1:-1]
  #final=" ".join(final)
  return final

Rmodel=load_model("Model_data/ResNet50.h5")

img_path=sys.argv[1]
img=image.load_img(img_path,target_size=(224,224))
x = image.img_to_array(img)
x = np.expand_dims(x, axis=0)
x = preprocess_input(x)
features = Rmodel.predict(x)
photo=features.squeeze()

# img=cv2.imread(img_path)
# plt.imshow(cv2.cvtColor(img,cv2.COLOR_BGR2RGB))

candidate=beam_search2(photo,3)
print(" ".join(candidate))

# candidate=greedy_search(photo)
# print(" ".join(candidate))
