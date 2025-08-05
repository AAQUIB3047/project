import pytesseract
import re
from PIL import Image

def preprocess_image(image_path):
    img = Image.open(image_path).convert("L")  # grayscale
    return img

def extract_text(image):
    return pytesseract.image_to_string(image)

def clean_ocr_text(text):
    text = re.sub(r'[^\w\s]', '', text)  # remove punctuation
    text = re.sub(r'\s+', ' ', text)     # normalize whitespace
    return text.lower()

def extract_sections(text):
    # In case future code makes this a dictionary
    if isinstance(text, dict):
        text = ' '.join(str(v) for v in text.values())
    return text.strip()
