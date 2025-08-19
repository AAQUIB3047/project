import pytesseract
import re
from PIL import Image


def preprocess_image(image_path):
    """
    Open an image, convert it to grayscale for better OCR accuracy.
    """
    return Image.open(image_path).convert("L")


def extract_text(image):
    """
    Extract raw text from an image using Tesseract OCR.
    """
    return pytesseract.image_to_string(image)


def clean_ocr_text(text):
    """
    Clean OCR text:
    - Remove punctuation
    - Normalize whitespace
    - Convert to lowercase
    """
    if not isinstance(text, str):
        text = str(text)

    text = re.sub(r"[^\w\s]", "", text)   # Remove punctuation
    text = re.sub(r"\s+", " ", text)      # Normalize whitespace
    return text.lower().strip()


def extract_sections(text):
    """
    Ensure text is a string.
    If given a dictionary, join all values into a single string.
    """
    if isinstance(text, dict):
        text = " ".join(str(v) for v in text.values())
    return str(text).strip()
