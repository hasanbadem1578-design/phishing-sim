from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Simple single-admin credential (set via env in production)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "phishsim2026"


@bp.post("/login")
def login():
    data = request.get_json()
    if (
        data.get("username") == ADMIN_USERNAME
        and data.get("password") == ADMIN_PASSWORD
    ):
        token = create_access_token(identity=ADMIN_USERNAME)
        return jsonify({"access_token": token})
    return jsonify({"error": "Kullanıcı adı veya şifre hatalı"}), 401


@bp.get("/me")
def me():
    # Frontend uses this to verify token is still valid
    from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
    try:
        verify_jwt_in_request()
        return jsonify({"username": get_jwt_identity()})
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401
