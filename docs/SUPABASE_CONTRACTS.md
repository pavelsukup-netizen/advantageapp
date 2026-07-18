# Supabase contracts

Frontend je oddělený od databázového schématu. Komunikuje pouze se dvěma veřejnými Edge Functions. Díky tomu lze později měnit tabulky, scraper i generování PDF bez zásahů do GitHub Pages aplikace.

## 1. `public-product-catalog`

### Request

```http
GET /functions/v1/public-product-catalog
```

### Response

```json
{
  "products": [
    {
      "id": "cf-element",
      "name": "CF Element",
      "subtitle": "Cenově dostupný základní model",
      "category": "Povrchové úpravy a omílání",
      "image": "https://.../cf-element.webp",
      "lead": "Krátký popis produktu.",
      "segments": ["Šperkařství", "Dental"],
      "features": [
        ["Nízké pořizovací náklady", "Popis výhody."]
      ],
      "specs": [
        ["Provedení", "Samostatně stojící"]
      ],
      "usage": [
        ["Šperkařství", "Popis použití."]
      ]
    }
  ]
}
```

Edge Function by měla vracet pouze aktivní a publikovatelné produkty, seřazené podle pořadí pro výstavu.

## 2. `send-product-pdf`

### Request

```http
POST /functions/v1/send-product-pdf
Content-Type: application/json
```

```json
{
  "productId": "cf-element",
  "productName": "CF Element",
  "email": "jan.novak@firma.cz",
  "language": "Čeština",
  "consent": true,
  "source": "exhibition-tablet"
}
```

### Success response

```json
{
  "ok": true,
  "messageId": "provider-message-id"
}
```

### Error response

```json
{
  "ok": false,
  "error": "Human-readable error"
}
```

## Bezpečnostní pravidla

- `service_role`, API klíč e-mailové služby a přístupové údaje ke scraperu patří pouze do Supabase Secrets.
- Edge Function musí validovat e-mail, `productId`, jazyk i souhlas.
- Doporučené je omezení počtu požadavků a logování odeslání.
- CORS povol jen pro konkrétní GitHub Pages doménu a případnou lokální vývojovou adresu.
- PDF URL nebo přílohu generuj na serveru. Prohlížeč nemá dostat privátní přístup do Storage.
