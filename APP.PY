import os
import pandas as pd
import numpy as np
import pickle
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

# ✅ FIX: Import ocr_utils from correct location
# If ocr_utils.py is in the same folder as app.py
from ocr_utils import preprocess_image, extract_text, clean_ocr_text, extract_sections
# If it's in a subfolder (e.g., utils/ocr_utils.py), use:
# from utils.ocr_utils import preprocess_image, extract_text, clean_ocr_text, extract_sections

# Flask App
app = Flask(__name__)

# Config
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load Model and Tokenizer
model = load_model('model/model.h5')
tokenizer = pickle.load(open('tokenizer.pkl', 'rb'))

# Load Dataset for Label Mapping
dataset_path = 'data/Training.csv'
df = pd.read_csv(dataset_path)
diseases = sorted(df['prognosis'].unique())
label_map = {idx: disease for idx, disease in enumerate(diseases)}

# Helper: Allowed file check
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Routes
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/reports')
def report():
    return render_template('reports.html')


@app.route('/library')
def library():
    return render_template('library.html')

@app.route('/settings')
def setting():
    return render_template('settings.html')

@app.route('/predict', methods=['POST'])
def predict():
    # Validate file in request
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'})

    if file.filename == '':
        return jsonify({'error': 'No file selected'})

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file format'})

    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # OCR Processing
        image = preprocess_image(file_path)
        raw_text = extract_text(image)
        cleaned_text = clean_ocr_text(raw_text)
        extracted_text = extract_sections(cleaned_text)

        # Prepare input for model
        sequence = tokenizer.texts_to_sequences([extracted_text])
        padded = pad_sequences(sequence, padding='post', maxlen=20)

        # Predict
        prediction = model.predict(padded)
        predicted_class = int(np.argmax(prediction, axis=1)[0])
        condition_name = label_map.get(predicted_class, 'Unknown')

        # Result
        return jsonify({
            'Condition ID': predicted_class,
            'Condition Name': condition_name,
            'Raw Text': raw_text
        })

    except Exception as e:
        return jsonify({'error': f'Processing error: {str(e)}'})

if __name__ == '__main__':
    app.run(debug=True)
