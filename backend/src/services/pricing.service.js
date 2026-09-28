/**
 * Central Pricing Engine
 * Validates, calculates, and verifies fares on the backend.
 * Ensures the platform never trusts unverified prices sent by the frontend.
 */

class PricingService {
  constructor() {
    this.serviceFees = {
      FLIGHT: 150, // ₹150 platform service fee per ticket
      TRAIN: 30,   // ₹30 platform service fee per ticket
      BUS: 25,     // ₹25 platform service fee per ticket
      HOTEL: 200,  // ₹200 platform service fee per room night
    };

    this.taxRates = {
      FLIGHT: 0.12, // 12% GST
      TRAIN: 0.05,  // 5% GST
      BUS: 0.05,    // 5% GST
      HOTEL: 0.12,  // 12% GST
    };

    this.coupons = {
      WELCOME10: { code: 'WELCOME10', discountPercent: 0.10, maxDiscount: 500 },
      FLYHIGH: { code: 'FLYHIGH', discountPercent: 0.15, maxDiscount: 1000 },
      SUPERRAIL: { code: 'SUPERRAIL', discountAmount: 50 },
    };
  }

  calculateFare({ category, baseFare, providerFee = 0, couponCode = null }) {
    if (!category || baseFare === undefined || baseFare < 0) {
      throw new Error('Invalid pricing parameters: category and non-negative baseFare required');
    }

    const cat = category.toUpperCase();
    const serviceFee = this.serviceFees[cat] || 100;
    const taxRate = this.taxRates[cat] || 0.10;

    const subtotal = Number(baseFare) + Number(providerFee);
    const taxes = Math.round(subtotal * taxRate);

    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && this.coupons[couponCode.toUpperCase()]) {
      const coupon = this.coupons[couponCode.toUpperCase()];
      appliedCoupon = coupon.code;

      if (coupon.discountPercent) {
        discountAmount = Math.min(
          Math.round(subtotal * coupon.discountPercent),
          coupon.maxDiscount || Infinity
        );
      } else if (coupon.discountAmount) {
        discountAmount = coupon.discountAmount;
      }
    }

    const totalAmount = Math.max(0, subtotal + taxes + serviceFee - discountAmount);

    return {
      baseFare: Number(baseFare),
      taxes,
      providerFee: Number(providerFee),
      serviceFee,
      discountAmount,
      appliedCoupon,
      totalAmount,
      currency: 'INR',
    };
  }

  validatePriceQuote({ category, itemPrice, requestedTotal, couponCode }) {
    const verifiedPricing = this.calculateFare({
      category,
      baseFare: itemPrice,
      couponCode,
    });

    const isMatch = Math.abs(verifiedPricing.totalAmount - requestedTotal) <= 1; // Allow 1 unit rounding variance

    return {
      isValid: isMatch,
      expectedPricing: verifiedPricing,
      variance: verifiedPricing.totalAmount - requestedTotal,
    };
  }
}

module.exports = new PricingService();
