import os
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle

from templates.ocr_utils import preprocess_image, extract_text, clean_ocr_text, extract_sections

app = Flask(__name__)

# Configurations
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure uploads folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load model and tokenizer
model = load_model('model/model.h5')

tokenizer = pickle.load(open('tokenizer.pkl', 'rb'))

# Class labels
label_map = {
    0: 'Acute URTI',
    1: 'Type 2 Diabetes',
    2: 'Hypertension',
    3: 'Viral Fever'
}

# File extension check
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            image = preprocess_image(file_path)
            raw_text = extract_text(image)
            cleaned_text = clean_ocr_text(raw_text)
            extracted_text = extract_sections(cleaned_text)

            sequence = tokenizer.texts_to_sequences([extracted_text])
            padded = pad_sequences(sequence, padding='post', maxlen=20)

            prediction = model.predict(padded)
            predicted_class = int(np.argmax(prediction, axis=1)[0])

            result = {
                'Condition ID': predicted_class,
                'Condition Name': label_map.get(predicted_class, 'Unknown'),
                'Raw Text': raw_text
            }

            return jsonify(result)

        except Exception as e:
            return jsonify({'error': str(e)})

    return jsonify({'error': 'Invalid file format'})

if __name__ == '__main__':
    app.run(debug=True)
