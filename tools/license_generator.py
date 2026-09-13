#!/usr/bin/env python3
"""
GhostTweak — Enterprise Ed25519 Offline License Generator
Usage:
    python license_generator.py --sub "Pro Gamer" --hwid "GT-ABCD-1234-EF01" --plan VIP_LIFETIME
    python license_generator.py --sub "Customer 01" --hwid "*" --plan VIP_LIFETIME
    python license_generator.py --sub "Beta Tester" --hwid "GT-ABCD-1234-EF01" --plan DAY_PASS --days 1
"""

import sys
import json
import time
import hmac
import hashlib
import argparse
from cryptography.hazmat.primitives.asymmetric import ed25519

# GhostTweak Master Private Signing Key (Keep private, never distribute with client binary)
MASTER_PRIVATE_KEY_HEX = "5e6bcedda7497bc95c069c2d0d471453a6c832c5dd02da486c38c6d6367f8b18"

def generate_license(sub: str, hwid: str, plan: str, days: int = 0) -> str:
    priv_bytes = bytes.fromhex(MASTER_PRIVATE_KEY_HEX)
    private_key = ed25519.Ed25519PrivateKey.from_private_bytes(priv_bytes)
    public_key = private_key.public_key()

    exp = 0
    if days > 0:
        exp = int(time.time()) + (days * 86400)

    payload_dict = {
        "sub": sub,
        "hwid": hwid.strip().upper(),
        "plan": plan.strip().upper(),
        "exp": exp
    }

    payload_bytes = json.dumps(payload_dict, separators=(',', ':'), sort_keys=True).encode('utf-8')
    signature = private_key.sign(payload_bytes)

    token = f"{payload_bytes.hex()}:{signature.hex()}"
    return token

def main():
    parser = argparse.ArgumentParser(description="GhostTweak Ed25519 Cryptographic License Generator")
    parser.add_argument("--sub", default="Ghost VIP User", help="Customer Name or Organization")
    parser.add_argument("--hwid", default="*", help="Target Machine HWID or * for Universal")
    parser.add_argument("--plan", default=None, help="Subscription Plan: VIP_LIFETIME, DAY_PASS, TRIAL")
    parser.add_argument("--type", default=None, help="Plan alias: lifetime, monthly, day, trial")
    parser.add_argument("--days", type=int, default=0, help="Validity in days (0 = Lifetime)")
    parser.add_argument("--count", type=int, default=1, help="Number of keys to generate (batch mode)")
    parser.add_argument("--output", default=None, help="Output file path to save generated keys")

    args = parser.parse_args()

    # Normalize plan and days
    plan = (args.plan or "VIP_LIFETIME").strip().upper()
    days = args.days

    if args.type:
        t = args.type.strip().lower()
        if t in ("lifetime", "vip", "pro"):
            plan = "VIP_LIFETIME"
            days = 0
        elif t in ("monthly", "month", "mth"):
            plan = "PRO_MONTHLY"
            days = 30
        elif t in ("day", "daypass", "24h"):
            plan = "DAY_PASS"
            days = 1
        elif t in ("trial", "demo"):
            plan = "TRIAL"
            days = 3

    # Derive short human-readable key tag
    plan_tag = "VIP"
    if "DAY" in plan:
        plan_tag = "DAY"
    elif "MTH" in plan or "MONTH" in plan:
        plan_tag = "MTH"
    elif "TRL" in plan or "TRIAL" in plan:
        plan_tag = "TRL"
    elif "CLB" in plan or "CLUB" in plan:
        plan_tag = "CLB"
    elif "PRO" in plan:
        plan_tag = "PRO"

    def compute_short_key(tag: str, hw: str) -> str:
        msg = f"GHOST:{tag}:{hw.strip().upper()}".encode("utf-8")
        sec = bytes.fromhex(MASTER_PRIVATE_KEY_HEX)
        sig = hmac.new(sec, msg, hashlib.sha256).hexdigest().upper()
        return f"GHOST-{tag}-{sig[0:4]}-{sig[4:8]}-{sig[8:12]}"

    keys = []
    short_keys = []
    for i in range(max(1, args.count)):
        sub_name = f"{args.sub} #{i+1}" if args.count > 1 else args.sub
        token = generate_license(sub_name, args.hwid, plan, days)
        keys.append(token)
        short_keys.append(compute_short_key(plan_tag, args.hwid))

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            for idx, (sk, tk) in enumerate(zip(short_keys, keys), 1):
                f.write(f"{sk}\n")
        print(f"[SUCCESS] Successfully generated {len(keys)} key(s) to '{args.output}'")
        print(f"Plan: {plan} (Tag: {plan_tag}) | Validity: {'Lifetime' if days == 0 else f'{days} days'} | Target HWID: {args.hwid}")
        return

    if args.count > 1:
        print("==================================================================")
        print(f"  GhostTweak Batch Generation ({len(keys)} keys) | Plan: {plan}")
        print("==================================================================")
        for idx, sk in enumerate(short_keys, 1):
            print(f"[{idx:03d}] {sk}")
        print("==================================================================")
        return

    print("==================================================================")
    print("  GhostTweak Digital License (Cryptographic)")
    print("==================================================================")
    print(f"Customer : {args.sub}")
    print(f"HWID     : {args.hwid}")
    print(f"Plan     : {plan}")
    print(f"Expiry   : {'Lifetime (Permanent)' if days == 0 else f'{days} days'}")
    print("------------------------------------------------------------------")
    print(f"License Key (Fast Activation):")
    print(f"  {short_keys[0]}")
    print("------------------------------------------------------------------")
    print("Ed25519 Token (Enterprise):")
    print(keys[0])
    print("==================================================================")

if __name__ == "__main__":
    main()
