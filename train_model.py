import numpy as np
import pickle
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense

# Sample training data (replace with your real cleaned text and labels)
texts = [
    "acute upper respiratory tract infection",
    "type 2 diabetes mellitus",
    "hypertension stage 1",
    "viral fever with body pain"
]

labels = [0, 1, 2, 3]  # Replace with your actual condition IDs

# Tokenization
tokenizer = Tokenizer(num_words=1000, oov_token="<OOV>")
tokenizer.fit_on_texts(texts)
sequences = tokenizer.texts_to_sequences(texts)
padded = pad_sequences(sequences, padding='post', maxlen=20)

# Convert labels to numpy array
labels = np.array(labels)

# Define model
model = Sequential()
model.add(Embedding(input_dim=1000, output_dim=16, input_length=20))
model.add(LSTM(32))
model.add(Dense(4, activation='softmax'))  # Assuming 4 classes

model.compile(loss='sparse_categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

# Train model
model.fit(padded, labels, epochs=10)

# Save model and tokenizer
model.save('model/model.h5')
with open('model/tokenizer.pkl', 'wb') as f:
    pickle.dump(tokenizer, f)
