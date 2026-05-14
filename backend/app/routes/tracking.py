from flask import Blueprint, request, jsonify, render_template_string, redirect
from ..models.campaign import Campaign
from ..models.target_user import TargetUser
from ..services.campaign_service import record_event

bp = Blueprint("tracking", __name__)

LANDING_PAGE = """
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kurumsal Giriş</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5;
         display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .card { background: white; border-radius: 12px; padding: 40px; width: 360px;
          box-shadow: 0 4px 24px rgba(0,0,0,.12); }
  .logo { text-align: center; margin-bottom: 28px; font-size: 22px;
          font-weight: 700; color: #1a1a2e; }
  .logo span { color: #4361ee; }
  label { display: block; font-size: 13px; font-weight: 600;
          color: #444; margin-bottom: 6px; }
  input { width: 100%; padding: 10px 14px; border: 1px solid #ddd;
          border-radius: 8px; font-size: 14px; margin-bottom: 18px; outline: none; }
  input:focus { border-color: #4361ee; }
  button { width: 100%; padding: 12px; background: #4361ee; color: white;
           border: none; border-radius: 8px; font-size: 15px;
           font-weight: 600; cursor: pointer; }
  button:hover { background: #3451d1; }
  .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #aaa; }
</style>
</head>
<body>
<div class="card">
  <div class="logo">🔒 Kurumsal <span>Portal</span></div>
  <form method="POST" action="/submit/{{ campaign_id }}/{{ user_id }}">
    <label>E-posta</label>
    <input type="email" name="email" placeholder="kullanici@kurum.edu.tr" required>
    <label>Şifre</label>
    <input type="password" name="password" placeholder="••••••••" required>
    <button type="submit">Giriş Yap</button>
  </form>
  <div class="footer">© 2026 Kurumsal Sistem</div>
</div>
</body>
</html>
"""

AWARENESS_PAGE = """
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Güvenlik Farkındalığı</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; background: #fff3cd;
         display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .box { background: white; border-left: 6px solid #f59e0b; border-radius: 10px;
         padding: 36px; max-width: 520px; box-shadow: 0 4px 20px rgba(0,0,0,.1); }
  h1 { color: #d97706; margin-bottom: 12px; }
  p { color: #555; line-height: 1.7; margin-bottom: 10px; }
  ul { color: #555; line-height: 2; padding-left: 20px; }
</style>
</head>
<body>
<div class="box">
  <h1>⚠️ Bu bir phishing simülasyonuydu!</h1>
  <p>Bu e-posta ve giriş sayfası, kurumunuzun güvenlik farkındalık eğitimi kapsamında
     gönderilmiş bir <strong>simülasyondu</strong>.</p>
  <p>Gerçek bir saldırıda bilgileriniz çalınabilirdi. Lütfen şunlara dikkat edin:</p>
  <ul>
    <li>Bilinmeyen kaynaklardan gelen linklere tıklamayın</li>
    <li>Şifrenizi hiçbir zaman form aracılığıyla girmeyin</li>
    <li>Şüpheli e-postaları BT birimine bildirin</li>
  </ul>
</div>
</body>
</html>
"""


@bp.get("/track/click/<int:campaign_id>/<int:user_id>")
def track_click(campaign_id, user_id):
    record_event(campaign_id, user_id, "click", request)
    return redirect(f"/landing/{campaign_id}/{user_id}")


@bp.get("/landing/<int:campaign_id>/<int:user_id>")
def landing(campaign_id, user_id):
    record_event(campaign_id, user_id, "open", request)
    return render_template_string(LANDING_PAGE, campaign_id=campaign_id, user_id=user_id)


@bp.post("/submit/<int:campaign_id>/<int:user_id>")
def track_submit(campaign_id, user_id):
    record_event(campaign_id, user_id, "submit", request)
    return render_template_string(AWARENESS_PAGE)
