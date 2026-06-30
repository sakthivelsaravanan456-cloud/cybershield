import csv
import io
import json
import os
import sqlite3
from datetime import datetime
from flask import Flask, g, jsonify, request, Response
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "database.db")

# Frontend files are now in project root
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))

# Render provides PORT automatically
PORT = int(os.environ.get("PORT", "5000"))

os.chdir(BASE_DIR)

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
app.config["CORS_HEADERS"] = "Content-Type"

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    return response


def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db


def row_to_dict(row):
    if row is None:
        return None
    return {key: row[key] for key in row.keys()}


def get_auth_payload():
    data = request.get_json(silent=True) or {}
    if request.method == "GET":
        data = {**data, **request.args.to_dict()}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    return email, password


def authenticate_user(email, password):
    if not email or not password:
        return None

    db = get_db()
    user = db.execute(
        "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
        (email,),
    ).fetchone()

    if user is None:
        return None

    if not check_password_hash(user["password_hash"], password):
        return None

    return user


def get_admin_user():
    email, password = get_auth_payload()
    user = authenticate_user(email, password)

    if user is None or str(user["role"]).lower() != "admin":
        return None

    return user


def create_user_progress(user_id):
    db = get_db()

    existing = db.execute(
        "SELECT id FROM progress WHERE user_id = ?",
        (user_id,),
    ).fetchone()

    if existing:
        return

    db.execute(
        """
        INSERT INTO progress
        (user_id, completion, xp, streak, last_login, last_reward_claim, achievements, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            0,
            0,
            0,
            None,
            None,
            json.dumps({}),
            datetime.utcnow().isoformat(),
        ),
    )

    db.commit()


def init_db():
    db = get_db()

    db.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    db.execute(
        """
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            completion INTEGER NOT NULL DEFAULT 0,
            xp INTEGER NOT NULL DEFAULT 0,
            streak INTEGER NOT NULL DEFAULT 0,
            last_login TEXT,
            last_reward_claim TEXT,
            achievements TEXT,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """
    )

    db.execute(
        """
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            level TEXT NOT NULL,
            video_url TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    db.execute(
        """
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id INTEGER,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            duration TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(lesson_id) REFERENCES lessons(id)
        )
        """
    )

    db.execute(
        """
        CREATE TABLE IF NOT EXISTS quiz_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id INTEGER,
            question TEXT NOT NULL,
            options TEXT NOT NULL,
            answer TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(lesson_id) REFERENCES lessons(id)
        )
        """
    )

    db.execute(
        """
        CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            requirements TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    db.execute(
        """
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            target TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            sent_at TEXT
        )
        """
    )

    db.commit()
    upgrade_quiz_questions_table()


def upgrade_quiz_questions_table():
    db = get_db()

    existing_columns = [
        row[1]
        for row in db.execute("PRAGMA table_info(quiz_questions)").fetchall()
    ]

    columns_to_add = {
        "difficulty": "TEXT NOT NULL DEFAULT 'Beginner'",
        "question_type": "TEXT NOT NULL DEFAULT 'MCQ'",
        "image_url": "TEXT",
        "explanation": "TEXT",
        "cybersecurity_tip": "TEXT",
        "related_training": "TEXT",
    }

    for column_name, column_def in columns_to_add.items():
        if column_name not in existing_columns:
            db.execute(
                f"ALTER TABLE quiz_questions ADD COLUMN {column_name} {column_def}"
            )

    db.commit()


@app.teardown_appcontext
def close_db(exception=None):
    db = getattr(g, "_database", None)

    if db is not None:
        db.close()


with app.app_context():
    init_db()


@app.route("/")
def home():
    return app.send_static_file("index.html")


@app.route("/health")
def health():
    return jsonify({"message": "CyberShield backend is running."}), 200


@app.route("/<path:filename>")
def serve_static(filename):
    return app.send_static_file(filename)


@app.route("/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    try:
        data = request.get_json(force=True) or {}
    except Exception as exc:
        return jsonify({"message": "Invalid JSON payload.", "error": str(exc)}), 400

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    role = str(data.get("role", "Technical")).strip() or "Technical"

    if not name or not email or not password:
        return jsonify({
            "message": "Name, email, and password are required.",
            "received": data
        }), 400

    if "@" not in email or "." not in email:
        return jsonify({"message": "Enter a valid email address."}), 400

    db = get_db()

    existing = db.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,),
    ).fetchone()

    if existing:
        return jsonify({"message": "That email address is already registered."}), 409

    password_hash = generate_password_hash(
        password,
        method="pbkdf2:sha256",
        salt_length=16
    )

    db.execute(
        """
        INSERT INTO users (name, email, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            name,
            email,
            password_hash,
            role,
            datetime.utcnow().isoformat(),
        ),
    )

    db.commit()

    user_row = db.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,),
    ).fetchone()

    if user_row:
        create_user_progress(user_row["id"])

    return jsonify({
        "message": "Registered successfully.",
        "user": {
            "name": name,
            "email": email,
            "role": role
        },
    }), 201


@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    data = request.get_json(force=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    user = authenticate_user(email, password)

    if user is None:
        return jsonify({"message": "Invalid email or password."}), 401

    return jsonify({
        "message": "Login successful.",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        },
    }), 200


@app.route("/quiz/questions", methods=["GET"])
def get_quiz_questions():
    level = request.args.get("level", "").strip().title()
    count = int(request.args.get("count", 10)) if request.args.get("count") else 10

    if level not in ("Beginner", "Intermediate", "Advanced"):
        return jsonify({
            "message": "Quiz level must be Beginner, Intermediate, or Advanced."
        }), 400

    db = get_db()

    rows = db.execute(
        """
        SELECT * FROM quiz_questions
        WHERE difficulty = ?
        ORDER BY RANDOM()
        LIMIT ?
        """,
        (level, count),
    ).fetchall()

    questions = []

    for row in rows:
        question = row_to_dict(row)

        try:
            question["options"] = json.loads(question["options"])
        except Exception:
            question["options"] = []

        questions.append(question)

    return jsonify({"questions": questions}), 200


@app.route("/admin/users", methods=["GET"])
def admin_list_users():
    admin = get_admin_user()

    if admin is None:
        return jsonify({"message": "Admin credentials required."}), 401

    db = get_db()

    users = db.execute(
        "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    ).fetchall()

    return jsonify({"users": [row_to_dict(row) for row in users]}), 200


@app.route("/admin/users/<int:user_id>/reset", methods=["POST"])
def admin_reset_user_progress(user_id):
    admin = get_admin_user()

    if admin is None:
        return jsonify({"message": "Admin credentials required."}), 401

    db = get_db()

    db.execute(
        """
        UPDATE progress
        SET completion = 0,
            xp = 0,
            streak = 0,
            last_login = NULL,
            last_reward_claim = NULL,
            achievements = ?,
            updated_at = ?
        WHERE user_id = ?
        """,
        (
            json.dumps({}),
            datetime.utcnow().isoformat(),
            user_id,
        ),
    )

    db.commit()

    return jsonify({"message": "User progress reset."}), 200


@app.route("/admin/lessons", methods=["GET", "POST"])
def admin_manage_lessons():
    admin = get_admin_user()

    if admin is None:
        return jsonify({"message": "Admin credentials required."}), 401

    db = get_db()

    if request.method == "GET":
        lessons = db.execute(
            "SELECT * FROM lessons ORDER BY created_at DESC"
        ).fetchall()

        return jsonify({"lessons": [row_to_dict(row) for row in lessons]}), 200

    data = request.get_json(force=True) or {}

    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    level = str(data.get("level", "")).strip() or "Technical"
    video_url = str(data.get("video_url", "")).strip()

    if not title or not description:
        return jsonify({"message": "Title and description are required."}), 400

    db.execute(
        """
        INSERT INTO lessons (title, description, level, video_url, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            title,
            description,
            level,
            video_url,
            datetime.utcnow().isoformat(),
        ),
    )

    db.commit()

    return jsonify({"message": "Lesson created."}), 201


@app.route("/admin/videos", methods=["GET", "POST"])
def admin_manage_videos():
    admin = get_admin_user()

    if admin is None:
        return jsonify({"message": "Admin credentials required."}), 401

    db = get_db()

    if request.method == "GET":
        videos = db.execute(
            "SELECT * FROM videos ORDER BY created_at DESC"
        ).fetchall()

        return jsonify({"videos": [row_to_dict(row) for row in videos]}), 200

    data = request.get_json(force=True) or {}

    lesson_id = data.get("lesson_id")
    title = str(data.get("title", "")).strip()
    url = str(data.get("url", "")).strip()
    duration = str(data.get("duration", "")).strip()

    if not title or not url:
        return jsonify({"message": "Title and URL are required."}), 400

    db.execute(
        """
        INSERT INTO videos (lesson_id, title, url, duration, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            lesson_id,
            title,
            url,
            duration,
            datetime.utcnow().isoformat(),
        ),
    )

    db.commit()

    return jsonify({"message": "Video created."}), 201


@app.route("/admin/quizzes", methods=["GET", "POST"])
def admin_manage_quizzes():
    admin = get_admin_user()

    if admin is None:
        return jsonify({"message": "Admin credentials required."}), 401

    db = get_db()

    if request.method == "GET":
        quizzes = db.execute(
            "SELECT * FROM quiz_questions ORDER BY created_at DESC"
        ).fetchall()

        return jsonify({"quizzes": [row_to_dict(row) for row in quizzes]}), 200

    data = request.get_json(force=True) or {}

    lesson_id = data.get("lesson_id")
    question = str(data.get("question", "")).strip()
    options = data.get("options")
    answer = str(data.get("answer", "")).strip()
    difficulty = str(data.get("difficulty", "Beginner")).strip().title() or "Beginner"
    question_type = str(data.get("question_type", "MCQ")).strip() or "MCQ"
    image_url = str(data.get("image_url", "")).strip()
    explanation = str(data.get("explanation", "")).strip()
    cybersecurity_tip = str(data.get("cybersecurity_tip", "")).strip()
    related_training = str(data.get("related_training", "")).strip()

    if difficulty not in ("Beginner", "Intermediate", "Advanced"):
        return jsonify({
            "message": "Difficulty must be Beginner, Intermediate, or Advanced."
        }), 400

    if not question or not options or not answer:
        return jsonify({
            "message": "Question, options, and answer are required."
        }), 400

    db.execute(
        """
        INSERT INTO quiz_questions
        (
            lesson_id,
            question,
            options,
            answer,
            difficulty,
            question_type,
            image_url,
            explanation,
            cybersecurity_tip,
            related_training,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            lesson_id,
            question,
            json.dumps(options),
            answer,
            difficulty,
            question_type,
            image_url,
            explanation,
            cybersecurity_tip,
            related_training,
            datetime.utcnow().isoformat(),
        ),
    )

    db.commit()

    return jsonify({"message": "Quiz question created."}), 201


@app.route("/admin/certificates", methods=["GET", "POST"])
def admin_manage_certificates():
    admin = get_admin_user()

    if admin is None:
        return jsonify({"message": "Admin credentials required."}), 401

    db = get_db()

    if request.method == "GET":
        certificates = db.execute(
            "SELECT * FROM certificates ORDER BY created_at DESC"
        ).fetchall()

        return jsonify({"certificates": [row_to_dict(row) for row in certificates]}), 200

    data = request.get_json(force=True) or {}

    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    requirements = str(data.get("requirements", "")).strip()

    if not title or not description:
        return jsonify({"message": "Title and description are required."}), 400

    db.execute(
        """
        INSERT INTO certificates (title, description, requirements, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (
            title,
            description,
            requirements,
            datetime.utcnow().isoformat(),
        ),
    )

    db.commit()

    return jsonify({"message": "Certificate created."}), 201


@app.route("/admin/notifications", methods=["GET", "POST"])
def admin_manage_notifications():
    admin = get_admin_user()

    if admin is None:
        return jsonify({"message": "Admin credentials required."}), 401

    db = get_db()

    if request.method == "GET":
        notifications = db.execute(
            "SELECT * FROM notifications ORDER BY created_at DESC"
        ).fetchall()

        return jsonify({
            "notifications": [row_to_dict(row) for row in notifications]
        }), 200

    data = request.get_json(force=True) or {}

    title = str(data.get("title", "")).strip()
    message = str(data.get("message", "")).strip()
    target = str(data.get("target", "all")).strip()

    if not title or not message:
        return jsonify({"message": "Title and message are required."}), 400

    db.execute(
        """
        INSERT INTO notifications (title, message, target, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (
            title,
            message,
            target,
            datetime.utcnow().isoformat(),
        ),
    )

    db.commit()

    return jsonify({"message": "Notification created."}), 201


@app.route("/admin/analytics", methods=["GET"])
def admin_analytics():
    admin = get_admin_user()

    if admin is None:
        return jsonify({"message": "Admin credentials required."}), 401

    db = get_db()

    total_users = db.execute(
        "SELECT COUNT(*) AS value FROM users"
    ).fetchone()["value"]

    active_users = db.execute(
        "SELECT COUNT(*) AS value FROM progress WHERE completion > 0"
    ).fetchone()["value"]

    average_xp = db.execute(
        "SELECT AVG(xp) AS value FROM progress"
    ).fetchone()["value"] or 0

    return jsonify({
        "total_users": total_users,
        "active_users": active_users,
        "average_xp": round(average_xp, 2),
    }), 200


@app.route("/admin/leaderboard", methods=["GET"])
def admin_leaderboard():
    admin = get_admin_user()

    if admin is None:
        return jsonify({"message": "Admin credentials required."}), 401

    db = get_db()

    leaderboard_rows = db.execute(
        """
        SELECT u.id, u.name, u.email, p.xp, p.completion
        FROM users u
        JOIN progress p ON u.id = p.user_id
        ORDER BY p.xp DESC, p.completion DESC
        LIMIT 10
        """
    ).fetchall()

    return jsonify({
        "leaderboard": [row_to_dict(row) for row in leaderboard_rows]
    }), 200


@app.route("/admin/export/users", methods=["GET"])
def admin_export_users():
    admin = get_admin_user()

    if admin is None:
        return jsonify({"message": "Admin credentials required."}), 401

    db = get_db()

    users = db.execute(
        "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    ).fetchall()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["id", "name", "email", "role", "created_at"])

    for user in users:
        writer.writerow([
            user["id"],
            user["name"],
            user["email"],
            user["role"],
            user["created_at"],
        ])

    response = Response(output.getvalue(), mimetype="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=users_export.csv"

    return response


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=PORT,
        debug=False,
        use_reloader=False
    )