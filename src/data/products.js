import joyImage from '../assets/JOY 770.png';
import noelImage from '../assets/NOEL 370.png';
import santaImage from '../assets/SANTA 170.jpeg';

export const products = [
  {
    id: 1,
    name: 'Christmas Warmth',
    basePrice: 150000,
    image: joyImage,
    description: 'Hampers personal dengan sentuhan kehangatan Natal, cocok untuk sahabat atau kerabat dekat.',
    weight: '± 1.0 kg',
    includes: [
      'Artisan Cookies (1 Toples)',
      'Hot Chocolate Blend (100g)',
      'Premium Tea Blend',
      'Christmas Box Standard',
      'Red Ribbon'
    ]
  },
  {
    id: 2,
    name: 'Christmas Blessing',
    basePrice: 200000,
    image: noelImage,
    description: 'Bingkisan penuh berkat untuk dinikmati bersama keluarga di malam Natal.',
    weight: '± 1.5 kg',
    includes: [
      'Assorted Cookies (2 Toples)',
      'Sparkling Juice (750ml)',
      'Fruit Cake Slice',
      'Rattan Basket',
      'Festive Ribbon & Ornament'
    ]
  },
  {
    id: 3,
    name: 'Christmas Premium',
    basePrice: 350000,
    image: santaImage,
    description: 'Koleksi mewah dengan item eksklusif untuk kesan yang tak terlupakan.',
    weight: '± 2.5 kg',
    includes: [
      'Premium Nastar (1 Toples)',
      'Kastengel (1 Toples)',
      'Imported Chocolate Truffles',
      'Sparkling Juice (750ml)',
      'Aromatherapy Candle',
      'Exclusive Hardbox'
    ]
  },
  {
    id: 4,
    name: 'Corporate Joy',
    basePrice: 400000,
    image: joyImage,
    description: 'Bingkisan elegan yang dirancang khusus untuk mengapresiasi mitra bisnis atau rekan kerja Anda.',
    weight: '± 2.0 kg',
    includes: [
      'Gourmet Cookies (2 Toples)',
      'Premium Roasted Coffee',
      'Exclusive Tumbler',
      'Leather Note Book',
      'Corporate Hardbox'
    ]
  },
  {
    id: 5,
    name: 'Holy Night Box',
    basePrice: 125000,
    image: noelImage,
    description: 'Hampers simpel dan manis untuk memberikan kejutan kecil di hari Natal.',
    weight: '± 0.8 kg',
    includes: [
      'Gingerbread Man Cookies',
      'Hot Chocolate Sachet',
      'Marshmallow',
      'Classic Red Box'
    ]
  }
];
