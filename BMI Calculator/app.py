# app.py
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def calculate_bmi_category(weight_kg, height_cm):
    """Calculate BMI and category."""
    if height_cm <= 0:
        raise ValueError("Height must be positive")
    height_m = height_cm / 100.0
    bmi = weight_kg / (height_m * height_m)
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal weight"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"
    return round(bmi, 1), category

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid data'}), 400
    
    try:
        weight = float(data.get('weight'))
        height_cm = float(data.get('height'))
    except (TypeError, ValueError):
        return jsonify({'error': 'Weight and height must be numbers'}), 400
    
    # Validation ranges
    if weight < 20 or weight > 300:
        return jsonify({'error': 'Weight must be between 20 kg and 300 kg'}), 400
    if height_cm < 50 or height_cm > 250:
        return jsonify({'error': 'Height must be between 50 cm and 250 cm'}), 400
    
    try:
        bmi, category = calculate_bmi_category(weight, height_cm)
        return jsonify({
            'bmi': bmi,
            'category': category,
            'weight': weight,
            'height': height_cm
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)