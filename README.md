# CyberShield

CyberShield is a secure, student-focused cybersecurity awareness platform for UK university learners. It delivers registration, login, training videos, quiz assessment, progress tracking, and certificate generation with a polished responsive UI.

## Features

- Secure student registration and login with hashed passwords
- Responsive dashboard with training, quiz, progress, and certificate screens
- Modern, accessible frontend design
- SQLite backend for lightweight deployment
- CORS-enabled API for local development and demo hosting

## Project structure

- `backend/` — Flask API and SQLite database
- `frontend/` — Responsive static website assets

## Setup

1. Create a Python virtual environment:

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
```

2. Install backend dependencies:

```powershell
pip install -r requirements.txt
```

3. Start the backend server, which now also serves the frontend:

```powershell
python app.py
```

4. Open the app in your browser at:

```powershell
http://127.0.0.1:5000
```

5. If port `5000` is already occupied or returns stale 404 responses, use an alternate port:

```powershell
$env:PORT = 5001
python app.py
```

Then open:

```powershell
http://127.0.0.1:5001
```

Do not run a separate static server for the frontend; the Flask backend serves `index.html`, `script.js`, `style.css`, and frontend assets directly.

## Notes for deployment

- Remove `backend/database.db` from source control and keep a production database file outside the repository.
- Use a production WSGI server such as Gunicorn or Waitress for deployment.
- Configure HTTPS and secure cookies for hosted environments.

## Next incremental improvements

- Add audit logging and role-based access control
- Build a dedicated admin interface for content management
- Add persistent session tokens and refresh token support
- Add full quiz engine with multiple questions and progress persistence
