#!/usr/bin/env python3
"""
GhostTweak — Enterprise Automated License & Database Server
A lightweight, self-contained monetization server with SQLite database and payment webhooks.

Features:
- Built-in SQLite database (licenses.db)
- Cryptographic Ed25519 digital signature issuance
- REST API for automated sales funnels (Webhooks, Stripe, FunPay, Robokassa)
- CLI management: generate, list, revoke licenses
- Zero external frameworks required (runs on Python 3.8+ with 'cryptography' library)

Usage:
  1. Start Webhook / REST API Server:
     python license_server.py --serve --port 8080

  2. Issue License via CLI:
     python license_server.py --create --sub "PlayerOne" --hwid "GT-A1B2-C3D4-E5F6" --plan VIP_LIFETIME

  3. List all issued licenses:
     python license_server.py --list
"""

import sys
import os
import json
import time
import sqlite3
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from cryptography.hazmat.primitives.asymmetric import ed25519

# GhostTweak Master Private Signing Key
MASTER_PRIVATE_KEY_HEX = "5e6bcedda7497bc95c069c2d0d471453a6c832c5dd02da486c38c6d6367f8b18"
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "licenses.db")
SERVER_API_KEY = "GHOST-SECRET-ADMIN-KEY-2026"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS licenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            hwid TEXT NOT NULL,
            plan TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            is_active INTEGER DEFAULT 1,
            payment_id TEXT
        )
    """)
    conn.commit()
    conn.close()

import hmac
import hashlib

def compute_key_sig(plan_tag: str, hwid: str) -> str:
    clean_hwid = hwid.strip().upper()
    message = f"GHOST:{plan_tag}:{clean_hwid}".encode("utf-8")
    secret = bytes.fromhex(MASTER_PRIVATE_KEY_HEX)
    sig = hmac.new(secret, message, hashlib.sha256).hexdigest().upper()
    return sig[:12]

def generate_hardware_key(hwid: str, plan: str = "VIP_LIFETIME", days: int = 0) -> tuple:
    plan_clean = plan.strip().upper()
    tag = "VIP"
    if "DAY" in plan_clean or "PASS" in plan_clean:
        tag = "DAY"
        if days == 0:
            days = 1
    elif "MTH" in plan_clean or "MONTH" in plan_clean:
        tag = "MTH"
        if days == 0:
            days = 30
    elif "TRL" in plan_clean or "TRIAL" in plan_clean:
        tag = "TRL"
        if days == 0:
            days = 3
    elif "CLB" in plan_clean or "CLUB" in plan_clean:
        tag = "CLB"
    elif "PRO" in plan_clean:
        tag = "PRO"
        if days == 0:
            days = 365

    sig = compute_key_sig(tag, hwid)
    key = f"GHOST-{tag}-{sig[0:4]}-{sig[4:8]}-{sig[8:12]}"

    now = int(time.time())
    exp = 0 if days == 0 else now + (days * 86400)
    return key, exp, now

def issue_ed25519_token(sub: str, hwid: str, plan: str, days: int = 0) -> tuple:
    # Retained for backward compatibility
    priv_bytes = bytes.fromhex(MASTER_PRIVATE_KEY_HEX)
    private_key = ed25519.Ed25519PrivateKey.from_private_bytes(priv_bytes)

    now = int(time.time())
    exp = 0
    if days > 0:
        exp = now + (days * 86400)

    payload_dict = {
        "sub": sub.strip(),
        "hwid": hwid.strip().upper(),
        "plan": plan.strip().upper(),
        "exp": exp
    }

    payload_bytes = json.dumps(payload_dict, separators=(',', ':'), sort_keys=True).encode('utf-8')
    signature = private_key.sign(payload_bytes)
    token = f"{payload_bytes.hex()}:{signature.hex()}"

    return token, exp, now

def create_license_record(customer_name: str, hwid: str, plan: str, days: int = 0, payment_id: str = None) -> dict:
    init_db()
    # Issue uniform standard key: GHOST-{PLAN}-{XXXX}-{XXXX}-{XXXX}
    token, exp, now = generate_hardware_key(hwid, plan, days)

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO licenses (token, customer_name, hwid, plan, expires_at, created_at, is_active, payment_id)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    """, (token, customer_name, hwid.upper(), plan.upper(), exp, now, payment_id))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "token": token,
        "customer": customer_name,
        "hwid": hwid.upper(),
        "plan": plan.upper(),
        "expires_at": exp,
        "created_at": now
    }

def rebind_license_hwid(license_id: int, new_hwid: str) -> dict:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM licenses WHERE id = ?", (license_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return {"success": False, "error": "Лицензия не найдена"}

    lic = dict(row)
    now = int(time.time())
    days_left = 0
    if lic["expires_at"] > now:
        days_left = max(1, int((lic["expires_at"] - now) / 86400))

    clean_hwid = new_hwid.strip().upper()
    new_token, exp, _ = generate_hardware_key(clean_hwid, lic["plan"], days_left)

    cursor.execute("""
        UPDATE licenses
        SET token = ?, hwid = ?
        WHERE id = ?
    """, (new_token, clean_hwid, license_id))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "token": new_token,
        "hwid": clean_hwid,
        "plan": lic["plan"],
        "customer": lic["customer_name"],
        "expires_at": lic["expires_at"]
    }

def list_all_licenses():
    init_db()
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM licenses ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

class LicenseAPIHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, data: dict):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self._send_json(200, {"status": "ok", "service": "GhostTweak License Authority", "time": int(time.time())})
            return

        if parsed.path == "/api/licenses":
            auth = self.headers.get("X-API-Key")
            if auth != SERVER_API_KEY:
                self._send_json(403, {"error": "Unauthorized. Invalid X-API-Key header."})
                return
            records = list_all_licenses()
            self._send_json(200, {"count": len(records), "licenses": records})
            return

        self._send_json(404, {"error": "Endpoint not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            payload = json.loads(body) if body else {}
        except Exception:
            self._send_json(400, {"error": "Malformed JSON body"})
            return

        # 1. API: Create License (for Webhook or Store Integration)
        if parsed.path == "/api/create_license":
            auth = self.headers.get("X-API-Key")
            if auth != SERVER_API_KEY:
                self._send_json(403, {"error": "Unauthorized. Invalid X-API-Key header."})
                return

            sub = payload.get("customer", "Ghost VIP Customer")
            hwid = payload.get("hwid", "*")
            plan = payload.get("plan", "VIP_LIFETIME")
            days = int(payload.get("days", 0))
            payment_id = payload.get("payment_id", f"MANUAL-{int(time.time())}")

            res = create_license_record(sub, hwid, plan, days, payment_id)
            self._send_json(200, res)
            return

        # 2. Webhook: Payment Provider Notification (e.g. Stripe / Robokassa / Lava)
        if parsed.path == "/api/webhook/payment":
            payment_status = payload.get("status", "paid")
            if payment_status in ["paid", "confirmed", "succeeded"]:
                sub = payload.get("customer_email", payload.get("user_id", "Online Customer"))
                hwid = payload.get("hwid", "*")
                plan = payload.get("plan", "VIP_LIFETIME")
                days = int(payload.get("days", 0))
                payment_id = payload.get("payment_id", payload.get("invoice_id", str(int(time.time()))))

                res = create_license_record(str(sub), hwid, plan, days, payment_id)
                self._send_json(200, {"status": "success", "license": res})
            else:
                self._send_json(200, {"status": "ignored", "reason": "Payment not completed"})
            return

        self._send_json(404, {"error": "Endpoint not found"})

def run_server(port: int = 8080):
    init_db()
    server_address = ('', port)
    httpd = HTTPServer(server_address, LicenseAPIHandler)
    print("==================================================================")
    print(f"  GhostTweak License Authority & Database Server")
    print(f"  Running on: http://localhost:{port}")
    print(f"  Database  : {DB_FILE}")
    print(f"  Admin Key : {SERVER_API_KEY}")
    print("==================================================================")
    print(f"Endpoints:")
    print(f"  POST /api/create_license   -> Create & sign license (Admin Auth)")
    print(f"  POST /api/webhook/payment  -> Automatic payment provider webhook")
    print(f"  GET  /api/licenses         -> List all issued licenses (Admin Auth)")
    print(f"  GET  /api/health           -> Healthcheck")
    print("==================================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Server stopped gracefully.")

def main():
    parser = argparse.ArgumentParser(description="GhostTweak Automated License Server & Database")
    parser.add_argument("--serve", action="store_true", help="Start HTTP REST API & Webhook Server")
    parser.add_argument("--port", type=int, default=8080, help="Port to listen on (default: 8080)")
    parser.add_argument("--create", action="store_true", help="Issue a new license to DB via CLI")
    parser.add_argument("--sub", default="Gamer VIP", help="Customer Name or Email")
    parser.add_argument("--hwid", default="*", help="Customer Machine HWID (* for Universal)")
    parser.add_argument("--plan", default="VIP_LIFETIME", choices=["VIP_LIFETIME", "DAY_PASS", "TRIAL"])
    parser.add_argument("--days", type=int, default=0, help="Duration in days (0 for permanent)")
    parser.add_argument("--list", action="store_true", help="List all issued licenses in database")

    args = parser.parse_args()

    if args.serve:
        run_server(args.port)
    elif args.create:
        res = create_license_record(args.sub, args.hwid, args.plan, args.days, f"CLI-{int(time.time())}")
        print("\n[SUCCESS] New License Created & Saved to Database:")
        print(json.dumps(res, indent=2))
    elif args.list:
        rows = list_all_licenses()
        print(f"\nTotal licenses in database: {len(rows)}")
        for r in rows:
            print(f"ID: {r['id']} | Customer: {r['customer_name']} | HWID: {r['hwid']} | Plan: {r['plan']} | Exp: {r['expires_at']}")
            print(f"Token: {r['token']}\n")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
