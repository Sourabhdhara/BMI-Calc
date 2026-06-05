// static/script.js
document.addEventListener('DOMContentLoaded', () => {
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultCard = document.getElementById('resultCard');
    const bmiValueSpan = document.querySelector('.bmi-value');
    const categoryPill = document.getElementById('categoryPill');
    const healthNoteDiv = document.getElementById('healthNote');
    const errorMsgDiv = document.getElementById('errorMsg');
    const downloadBtn = document.getElementById('downloadDocBtn');

    let currentResult = null;  // store latest {bmi, category, weight, height}

    function showError(message) {
        errorMsgDiv.textContent = message;
        errorMsgDiv.classList.remove('hidden');
        resultCard.classList.add('hidden');
        setTimeout(() => {
            errorMsgDiv.classList.add('hidden');
        }, 3000);
    }

    function updateCategoryStyle(category) {
        let bgColor, textColor;
        switch(category) {
            case 'Underweight':
                bgColor = '#fef9c3';
                textColor = '#854d0e';
                healthNoteDiv.innerHTML = '🍎 You may need to gain weight. Consult a nutritionist.';
                break;
            case 'Normal weight':
                bgColor = '#dcfce7';
                textColor = '#166534';
                healthNoteDiv.innerHTML = '✅ Great! Maintain a balanced diet and active lifestyle.';
                break;
            case 'Overweight':
                bgColor = '#ffedd5';
                textColor = '#9a3412';
                healthNoteDiv.innerHTML = '🏃‍♂️ Moderate exercise and portion control can help.';
                break;
            case 'Obese':
                bgColor = '#fee2e2';
                textColor = '#b91c1c';
                healthNoteDiv.innerHTML = '⚠️ Consider lifestyle changes and consult a doctor.';
                break;
            default: 
                bgColor = '#e2e8f0';
                textColor = '#1e293b';
        }
        categoryPill.style.backgroundColor = bgColor;
        categoryPill.style.color = textColor;
    }

    async function calculateBMI() {
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);

        if (isNaN(weight) || isNaN(height)) {
            showError('Please enter valid numbers for weight and height.');
            return;
        }

        try {
            const response = await fetch('/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weight, height })
            });
            const data = await response.json();

            if (data.error) {
                showError(data.error);
                return;
            }

            // Success
            currentResult = {
                bmi: data.bmi,
                category: data.category,
                weight: data.weight,
                height: data.height,
                date: new Date().toLocaleString()
            };

            bmiValueSpan.innerText = data.bmi;
            categoryPill.innerText = data.category;
            updateCategoryStyle(data.category);
            resultCard.classList.remove('hidden');
            errorMsgDiv.classList.add('hidden');
        } catch (err) {
            showError('Network error. Please try again.');
            console.error(err);
        }
    }

    function downloadAsDoc() {
        if (!currentResult) {
            showError('No result to download. Please calculate BMI first.');
            return;
        }

        const docContent = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>BMI Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                    h1 { color: #2563eb; }
                    .result-box { background: #f0f4ff; padding: 20px; border-radius: 20px; margin-top: 20px; }
                    .bmi { font-size: 28px; font-weight: bold; }
                    .category { font-size: 20px; margin: 10px 0; }
                    hr { margin: 20px 0; }
                </style>
            </head>
            <body>
                <h1>🧾 BMI Health Report</h1>
                <p><strong>Generated on:</strong> ${currentResult.date}</p>
                <div class="result-box">
                    <p><strong>Weight:</strong> ${currentResult.weight} kg</p>
                    <p><strong>Height:</strong> ${currentResult.height} cm</p>
                    <p class="bmi">BMI: ${currentResult.bmi}</p>
                    <p class="category">Category: <strong>${currentResult.category}</strong></p>
                    <hr>
                    <p><em>${healthNoteDiv.innerHTML.replace(/<[^>]*>/g, '')}</em></p>
                    <p style="font-size:12px; color:gray;">BMI = weight(kg) / height(m)². Not a medical diagnosis.</p>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([docContent], { type: 'application/msword' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `BMI_Report_${currentResult.bmi}_${currentResult.category}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    calculateBtn.addEventListener('click', calculateBMI);
    downloadBtn.addEventListener('click', downloadAsDoc);

    // Also allow pressing Enter on input fields
    weightInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculateBMI(); });
    heightInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculateBMI(); });
});