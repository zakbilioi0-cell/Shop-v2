const PRODUCTS = {
  'gayo-arabika': {
    name: 'Gayo Arabika',
    origin: 'Aceh, 1.200 mdpl',
    note: 'Karamel, jeruk sitrun, akhir yang bersih',
    price: 500,
  },
  'toraja-arabika': {
    name: 'Toraja Arabika',
    origin: 'Sulawesi Selatan, 1.500 mdpl',
    note: 'Rempah, tanah basah, body tebal',
    price: 95000,
  },
  'flores-bajawa': {
    name: 'Flores Bajawa',
    origin: 'Nusa Tenggara Timur, 1.300 mdpl',
    note: 'Cokelat gelap, karamel gosong',
    price: 90000,
  },
  'mandheling': {
    name: 'Mandheling',
    origin: 'Sumatera Utara, 1.100 mdpl',
    note: 'Herbal, kayu manis, low acidity',
    price: 80000,
  },
};

module.exports = (req, res) => {
  res.status(200).json(PRODUCTS);
};

module.exports.PRODUCTS = PRODUCTS;
