document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const result = document.getElementById('result');
  const loader = document.getElementById('loader');

  // Preview selected image
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement('img');
        img.src = reader.result;
        img.className = 'w-full mt-4 rounded-md';
        result.innerHTML = ''; // Clear previous results
        result.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });

  // Copy text function
  window.copyText = function () {
    const text = result.innerText;
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(() => alert('Failed to copy text.'));
  };

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
      result.textContent = '⚠️ Please select a file first.';
      result.classList.remove('hidden');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    loader.classList.remove('hidden');
    result.textContent = '⏳ Processing...';
    result.classList.remove('hidden');

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data['Condition Name']) {
        result.innerHTML = `
          <strong>🩺 Condition:</strong> ${data['Condition Name']} (ID: ${data['Condition ID']})<br/><br/>
          <strong>🧾 Extracted Text:</strong><br/>
          <pre style="white-space: pre-wrap; font-family: inherit;">${data['Raw Text']}</pre>
          <br/>
          <button onclick="copyText()" class="bg-blue-500 text-white px-3 py-1 rounded">Copy Text</button>
        `;
      } else {
        result.textContent = data.error || '❌ Prediction failed.';
      }

    } catch (error) {
      console.error('Prediction Error:', error);
      result.textContent = '❌ Error occurred during prediction.';
    } finally {
      loader.classList.add('hidden');
    }
  });
});
