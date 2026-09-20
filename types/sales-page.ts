export type SalesPaymentMethod = "cod" | "bank_transfer";

export interface SalesPageBenefit {
  title: string;
  description: string;
}

export interface SalesPageTestimonial {
  name: string;
  quote: string;
}

export interface SalesPageFaq {
  question: string;
  answer: string;
}

export interface SalesOrderFormConfig {
  heading: string;
  subheading: string;
  submitLabel: string;
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showQuantity: boolean;
  allowCod: boolean;
  allowBankTransfer: boolean;
  defaultPaymentMethod: SalesPaymentMethod;
}

export interface SalesPageConfig {
  headline: string;
  subheadline: string;
  description: string;
  heroImageUrl: string;
  ctaLabel: string;
  accentColor: string;
  benefits: SalesPageBenefit[];
  testimonials: SalesPageTestimonial[];
  faqs: SalesPageFaq[];
  form: SalesOrderFormConfig;
  thankYouHeadline: string;
  thankYouMessage: string;
}

export interface SalesPageProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  description: string | null;
  images: string[] | null;
  stock: number;
  is_active: boolean;
}

export interface SalesPage {
  id: string;
  name: string;
  slug: string;
  product_id: string;
  is_published: boolean;
  meta_pixel_id: string | null;
  config: SalesPageConfig;
  created_at: string;
  updated_at: string;
  product?: SalesPageProduct | null;
}

export const DEFAULT_SALES_PAGE_CONFIG: SalesPageConfig = {
  headline: "A better way to get the gadget you want",
  subheadline: "Original products, fair prices, and dependable delivery across Ghana.",
  description: "Tell customers why this product is the right choice and what makes the offer special.",
  heroImageUrl: "",
  ctaLabel: "Order Now",
  accentColor: "#D4A843",
  benefits: [
    { title: "100% authentic", description: "Quality checked before dispatch." },
    { title: "Fast delivery", description: "Reliable delivery across Ghana." },
    { title: "Secure ordering", description: "Bank transfer or payment on delivery." },
  ],
  testimonials: [],
  faqs: [
    {
      question: "Are Authentic Gadget products quality checked?",
      answer: "Products are checked before dispatch, and our team can confirm specification and availability details before fulfilment.",
    },
    {
      question: "Where do you deliver?",
      answer: "We deliver across Ghana. Delivery timing and any location-specific details are confirmed with the customer.",
    },
    {
      question: "Which payment options are available?",
      answer: "Customers can use bank transfer or payment on delivery when those options are enabled for the sales page.",
    },
  ],
  form: {
    heading: "Place your order",
    subheading: "Complete the form and our team will confirm your order.",
    submitLabel: "Place Order",
    showEmail: true,
    showPhone: true,
    showAddress: true,
    showQuantity: true,
    allowCod: true,
    allowBankTransfer: true,
    defaultPaymentMethod: "cod",
  },
  thankYouHeadline: "Thank you for your order!",
  thankYouMessage: "Your order has been received. Our team will contact you shortly to confirm delivery.",
};
