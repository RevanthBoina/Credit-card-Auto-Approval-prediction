# Credit Card Approval Prediction System

This project is a web-based Credit Card Approval Prediction System. It includes an end-to-end Machine Learning pipeline to train an approval classification model and a Flask web application to serve the model predictions.

---

## 🚀 Key Features

*   **Machine Learning Pipeline**: Trained using Random Forest, Decision Tree, and Logistic Regression models. The final pipeline utilizes a Random Forest classifier with **95.8% accuracy**.
*   **Web Dashboard**: Built with Flask (Python), allowing users to input applicant demographics (Age, Gender, Income, Education, Assets, etc.) and get instant decision outputs.
*   **EDA Analysis**: Visualizations exploring relationships like Income Distribution, Age Distribution, Gender vs. Approval, and Education Level vs. Approval.

---

## 🛠️ Tech Stack

*   **Frontend**: HTML5, Vanilla CSS, Jinja2 Templates.
*   **Backend**: Python, Flask.
*   **Machine Learning**: Scikit-Learn, Pandas, Joblib.
*   **Data Visualization**: Matplotlib, Seaborn.

---

## 📂 Project Structure

```
├── web/
│   ├── app.py                     # Main Flask Application
│   ├── requirements.txt           # Python Dependency Requirements
│   ├── models/
│   │   └── final_credit_model_pipeline.pkl  # Trained ML Pipeline Model
│   ├── static/
│   │   ├── css/                   # Stylesheets
│   │   ├── js/                    # Client-side scripts
│   │   └── img/                   # EDA visualisations and images
│   └── templates/                 # Jinja2 HTML Layouts (Home, Predict, Result)
```

---

## 💻 Running the App Locally

### 1. Navigate to the web folder
```bash
cd web
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the application
```bash
python app.py
```

Open your browser and navigate to: **http://127.0.0.1:8080**
