# Save tokenizer (after fitting it during model training)
import pickle
from keras.preprocessing.text import Tokenizer

# Example data
texts = ["This is a medical report.", "This patient has fever and cold."]

# Step 1: Fit tokenizer
tokenizer = Tokenizer(num_words=5000, oov_token="<OOV>")
tokenizer.fit_on_texts(texts)

# Step 2: Save it
with open('model/tokenizer.pkl', 'wb') as f:
    pickle.dump(tokenizer, f)
    