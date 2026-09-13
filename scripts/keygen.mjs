#!/usr/bin/env node

/**
 * GhostTweak — Cryptographic License Key Generator
 * Generates HMAC-SHA256 license keys bound to HWID or universal keys.
 */

import crypto from 'crypto';
import readline from 'readline';

const SECRET_HEX = '5e6bcedda7497bc95c069c2d0d471453a6c832c5dd02da486c38c6d6367f8b18';
const SECRET = Buffer.from(SECRET_HEX, 'hex');

const PLANS = {
  '1': { tag: 'VIP', name: 'VIP Lifetime (Бессрочная лицензия)', duration: 'Навсегда' },
  '2': { tag: 'MTH', name: 'Pro Monthly (Подписка на 30 дней)', duration: '30 дней' },
  '3': { tag: 'DAY', name: '24h Esports Pass (Турнирный пропуск)', duration: '24 часа' },
  '4': { tag: 'TRL', name: 'Trial Access (Пробный доступ)', duration: '3 дня' },
  '5': { tag: 'CLB', name: 'Cyber Arena / Club LAN (Компьютерные клубы)', duration: 'Навсегда' },
  '6': { tag: 'PRO', name: 'Pro Annual (Годовая лицензия)', duration: '365 дней' },
};

function generateKey(planTag, hwidInput) {
  const cleanHwid = (hwidInput && hwidInput.trim()) ? hwidInput.trim().toUpperCase() : '*';
  const cleanPlan = planTag.trim().toUpperCase();
  const message = `GHOST:${cleanPlan}:${cleanHwid}`;

  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(message);
  const fullHex = hmac.digest('hex').toUpperCase();
  const sig = fullHex.slice(0, 12);

  const formattedKey = `GHOST-${cleanPlan}-${sig.slice(0, 4)}-${sig.slice(4, 8)}-${sig.slice(8, 12)}`;
  return {
    key: formattedKey,
    planTag: cleanPlan,
    hwid: cleanHwid,
    isUniversal: cleanHwid === '*',
  };
}

function printHeader() {
  console.log('\n============================================================');
  console.log('       GHOSTTWEAK — КРИПТОГРАФИЧЕСКИЙ ГЕНЕРАТОР КЛЮЧЕЙ      ');
  console.log('============================================================\n');
}

async function main() {
  printHeader();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    console.log('Выберите тарифный план:');
    for (const [key, val] of Object.entries(PLANS)) {
      console.log(`  [${key}] ${val.name}`);
    }
    console.log('');

    let planChoice = (await question('Введите номер тарифа [1-6] (по умолчанию 1): ')).trim();
    if (!planChoice || !PLANS[planChoice]) {
      planChoice = '1';
    }

    const selectedPlan = PLANS[planChoice];
    console.log(`\nВыбран тариф: ${selectedPlan.name}`);

    console.log('\nПривязка к оборудованию:');
    console.log('  • Если клиент прислал HWID из приложения — введите его.');
    console.log('  • Если хотите создать универсальный ключ (на любой ПК) — просто нажмите Enter.');
    const hwidInput = (await question('\nВведите HWID клиента (или Enter для универсального): ')).trim();

    const result = generateKey(selectedPlan.tag, hwidInput);

    console.log('\n------------------------------------------------------------');
    console.log('СГЕНЕРИРОВАННЫЙ ЛИЦЕНЗИОННЫЙ КЛЮЧ:');
    console.log(`\n   >>>  ${result.key}  <<<\n`);
    console.log(`Тариф:      ${selectedPlan.name}`);
    console.log(`Срок:       ${selectedPlan.duration}`);
    console.log(`Привязка:   ${result.isUniversal ? 'Универсальный мастер-ключ (любой ПК)' : `HWID: ${result.hwid}`}`);
    console.log('------------------------------------------------------------');
    console.log('\nСкопируйте ключ выше и отправьте покупателю в Telegram / чат.\n');

  } finally {
    rl.close();
  }
}

main().catch(console.error);
