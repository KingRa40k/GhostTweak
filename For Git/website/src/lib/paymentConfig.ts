export interface PaymentPreset {
  name: string;
  description: string;
  exampleUrl: string;
}

export interface PaymentConfig {
  /**
   * Flag indicating if automated checkout is enabled.
   * When false (default safe mode), the checkout modal informs customers
   * that automated processing is undergoing maintenance and provides an
   * immediate direct contact form to the administrator with pre-filled order data.
   * Set NEXT_PUBLIC_PAYMENT_ENABLED="true" in .env once you configure your link.
   */
  isLivePaymentEnabled: boolean;

  /**
   * Payment gateway URL.
   * Can be a Stripe Payment Link, Lava product page, Boosty donation/target,
   * YooKassa invoice generator, Robokassa payment URL, or Cryptomus checkout.
   */
  paymentGatewayUrl: string;

  /**
   * Primary administrator email for receiving purchase inquiries and proof of payment.
   */
  adminEmail: string;

  /**
   * Customer support email displayed on the site.
   */
  supportEmail: string;

  /**
   * Community Discord or support server link (optional).
   */
  discordUrl?: string;

  /**
   * Reference presets for supported payment systems to help the project owner.
   */
  presets: Record<string, PaymentPreset>;
}

export const PAYMENT_CONFIG: PaymentConfig = {
  isLivePaymentEnabled: process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true' || false,
  paymentGatewayUrl: process.env.NEXT_PUBLIC_PAYMENT_URL || '',
  adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@ghosttweak.com',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@ghosttweak.com',
  discordUrl: process.env.NEXT_PUBLIC_DISCORD_URL || '',

  presets: {
    stripe: {
      name: 'Stripe Payment Links',
      description: 'Ideal for worldwide credit cards, Apple Pay, Google Pay. Generate payment links directly in your Stripe dashboard.',
      exampleUrl: 'https://buy.stripe.com/your_payment_link_hash',
    },
    lava: {
      name: 'Lava.top / Lava.ru',
      description: 'Supports CIS/Russian cards (MIR, Visa, MC), Qiwi, SBP, plus international cards and crypto.',
      exampleUrl: 'https://app.lava.top/products/your_product_id',
    },
    boosty: {
      name: 'Boosty.to',
      description: 'Simple monetization platform accepting Russian cards, PayPal, and international cards.',
      exampleUrl: 'https://boosty.to/your_channel/single-payment/donation',
    },
    yookassa: {
      name: 'YooKassa (ЮКасса)',
      description: 'Leading payment solution for Russian legal entities & self-employed (SBP, Bank Cards, SberPay).',
      exampleUrl: 'https://yookassa.ru/integration/api',
    },
    robokassa: {
      name: 'Robokassa',
      description: 'Versatile gateway with high conversion, SBP, MIR, foreign cards, and crypto.',
      exampleUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx',
    },
    cryptomus: {
      name: 'Cryptomus / NowPayments',
      description: 'Automated crypto payment gateway supporting USDT, BTC, ETH, TON, and LTC.',
      exampleUrl: 'https://pay.cryptomus.com/pay/your_invoice_uuid',
    },
  },
};

