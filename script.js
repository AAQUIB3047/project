document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const result = document.getElementById('result');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
      result.textContent = 'Please select a file';
      result.classList.remove('hidden');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

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
          <strong>🩺 Condition:</strong> ${data['Condition Name']} (ID: ${data['Condition ID']})<br/>
          <strong>🧾 Extracted Text:</strong><br/>${data['Raw Text']}
        `;
      } else {
        result.textContent = data.error || 'Prediction failed.';
      }

    } catch (error) {
      console.error(error);
      result.textContent = '❌ Error occurred during prediction.';
    }
  });
});
