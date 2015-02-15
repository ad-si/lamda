# Things

## Schema

```
asin: Asin
brand: String
dateOfPurchase: Date
description: String
careInstructions:
  - Wash at or below x°C, Hand wash, Do not wash
  - Bleaching allowed, Non-chlorine bleach only, Do not bleach
  - Tumble drying, Tumble drying (low temperature), Tumble drying (normal), Do not tumble dry
  - Drying, Line dry, Dry flat, Drip dry, Dry in the shade, Line dry in the shade, Dry flat in shade, Drip dry in shade
  - Ironing, Iron at low temperature, Iron at medium temperature, Iron at high temperature, Do not iron
  - Cleaning, Dry clean (Hydrocarbon solvent only (HCS)), Gentle cleaning with hydrocarbon solvents, Very gentle cleaning with hydrocarbon solvents, Dryclean, tetrachloroethylene (PCE) only, Gentle cleaning with PCE, Very gentle cleaning with PCE, Do not dry clean
  - Professional wet cleaning, Gentle wet cleaning, Very gentle wet cleaning, Professional wet cleaning is not allowed

  - Do not use fabric softener
  - Use mild detergent only
  - Wash with like colors
  - Wash and iron inside out
  - Remove promptly after wash
  - Wash before use
  - Wash separately
color: Color
ean: Ean
fabric: String
features:
  first: String
  second: String
form: String
gift:
  by: Name
  for: String
id: Id
importer: Object
location: Location  # Current location of the thing
model: String
name: String
note: String
originalPrice: Price
pointOfProduction: Location
pointOfPurchase: Location
price: Price
patent: Id
producedAt: Date
size: Size
type: String
urls: Urls
weight: Weight
```

Laundry symbols: [wikipedia.org/wiki/Laundry_symbol](http://en.wikipedia.org/wiki/Laundry_symbol)
