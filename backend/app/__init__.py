from __future__ import annotations
from typing import Optional
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .models.base import db
from .routes import templates, campaigns, users, tracking, stats, auth


def create_app(config: Optional[dict] = None):
    app = Flask(__name__)
    app.config.update(
        SQLALCHEMY_DATABASE_URI="sqlite:///phishsim.db",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        USE_MEMORY_MAIL=True,
        BASE_URL="http://localhost:5000",
        SMTP_HOST="localhost",
        SMTP_PORT=1025,
        MAIL_SENDER="noreply@phishsim.local",
        JWT_SECRET_KEY="phishsim-dev-secret-change-in-production",
        JWT_ACCESS_TOKEN_EXPIRES=False,
    )
    if config:
        app.config.update(config)

    CORS(app)
    db.init_app(app)
    JWTManager(app)

    for bp in (templates.bp, campaigns.bp, users.bp, tracking.bp, stats.bp, auth.bp):
        app.register_blueprint(bp)

    with app.app_context():
        db.create_all()
        _seed(app)

    return app


def _seed(app):
    from .models.template import Template
    from .models.target_user import TargetUser

    if Template.query.first():
        return

    templates_data = [
        Template(
            name="IT Güvenlik Uyarısı",
            subject="⚠️ Hesabınız Tehlikede - Hemen Doğrulayın",
            category="it",
            html_body="""<div style="font-family:sans-serif;max-width:600px;margin:auto">
<p>Sayın <strong>{{name}}</strong>,</p>
<p>Hesabınıza şüpheli bir giriş tespit edildi. Hesabınızı korumak için
<a href="{{link}}">buraya tıklayarak</a> kimliğinizi doğrulayın.</p>
<p>Bu işlemi 24 saat içinde gerçekleştirmezseniz hesabınız askıya alınacaktır.</p>
<p>BT Güvenlik Ekibi</p></div>""",
        ),
        Template(
            name="İnsan Kaynakları - Maaş Bildirimi",
            subject="Maaş Bildiriminiz Hazır",
            category="hr",
            html_body="""<div style="font-family:sans-serif;max-width:600px;margin:auto">
<p>Merhaba <strong>{{name}}</strong>,</p>
<p>Bu ayki maaş bildiriminiz sisteme yüklendi. Bordronuzu görüntülemek için
<a href="{{link}}">İK Portalı'na giriş yapın</a>.</p>
<p>İnsan Kaynakları Departmanı</p></div>""",
        ),
        Template(
            name="Microsoft 365 - Parola Süresi Doldu",
            subject="Parolanızın Süresi Doldu",
            category="it",
            html_body="""<div style="font-family:sans-serif;max-width:600px;margin:auto;
background:#fff;border:1px solid #e0e0e0;padding:24px;border-radius:8px">
<h2 style="color:#0078d4">Microsoft 365</h2>
<p>Sayın <strong>{{name}}</strong>,</p>
<p>Microsoft 365 hesabınızın parolasının süresi doldu.
Erişiminizin kesilmemesi için <a href="{{link}}" style="color:#0078d4">
parolanızı şimdi güncelleyin</a>.</p>
<hr style="border:none;border-top:1px solid #eee">
<small style="color:#999">Bu e-posta {{email}} adresine gönderildi.</small>
</div>""",
        ),
    ]

    users_data = [
        TargetUser(name="Ahmet Yılmaz", email="ahmet.yilmaz@test.local", department="Bilişim"),
        TargetUser(name="Fatma Kaya", email="fatma.kaya@test.local", department="İnsan Kaynakları"),
        TargetUser(name="Mehmet Demir", email="mehmet.demir@test.local", department="Muhasebe"),
        TargetUser(name="Zeynep Çelik", email="zeynep.celik@test.local", department="Mühendislik"),
        TargetUser(name="Ali Şahin", email="ali.sahin@test.local", department="Satış"),
    ]

    db.session.add_all(templates_data + users_data)
    db.session.commit()
