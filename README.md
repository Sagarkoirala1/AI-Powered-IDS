# AI Powered Intrusion Detection System (AI-Powered-IDS)

## Overview
An AI-driven Intrusion Detection System (IDS) that uses Machine Learning models to classify network traffic as normal or malicious. The project follows a three-tier architecture consisting of a React, Tailwind frontend, Node.js backend, and Python ML service.

## Features
- Machine learning based intrusion detection
- Web dashboard for predictions
- REST API integration
- Logistic Regression and SVM based models
- Model persistence using Joblib files

## Tech Stack

### Frontend
- React.js
- Tailwind CSS

### Backend
- Node.js
- Express.js

### AI / Machine Learning
- Python
- Scikit-learn
- Pandas
- NumPy
- Joblib

## Project Architecture

```text
Frontend (React)
        ↓
Backend API (Node.js)
        ↓
Python ML Service
        ↓
Preprocessing (Encoder + Scaler)
        ↓
Trained Model (.pkl)
        ↓
Prediction Result
```


## Machine Learning Pipeline
1. Dataset preprocessing
2. Feature encoding
3. Feature scaling
4. Model training using Logistic Regression and SVM
5. Saving trained models:
   - ids_model.pkl
   - scaler.pkl
   - encoder.pkl
6. Real-time prediction through API endpoints

## Installation

### Clone Repository
```bash
git clone <https://github.com/Sagarkoirala1/AI-Powered-IDS.git>
cd AI-Powered-IDS
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm start
```

### ML Service
```bash
cd AI-ML
pip install -r requirement.txt
python app.py
```

## Typical Workflow
1. User enters network traffic data.
2. React frontend sends request to backend.
3. Backend forwards request to Python ML API.
4. ML model predicts attack/normal traffic.
5. Result is returned and displayed on dashboard.

## Dataset
The use of cybersecurity traffic datasets for intrusion detection.

## Future Improvements
- Real-time packet sniffing
- Deep learning models
- Alert notification system
- Threat analytics dashboard
- User authentication

## Contributors
- Sagar Koirala Saurav Khanal Ashwin Acharya and Saugat Pudasaini

## License

