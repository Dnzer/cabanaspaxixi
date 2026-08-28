# Cabanas Paxixi — site + reservas

Site responsivo inspirado no PDF enviado, com seção institucional, cabanas, calendário público e formulário de reserva.

## Rodar localmente

1. Instale Node.js 18+.
2. No terminal, entre na pasta do projeto.
3. Rode `npm install`.
4. Rode `npm start`.
5. Acesse `http://localhost:3000`.

As reservas são armazenadas em `data/reservas.json`, portanto todos os visitantes do mesmo servidor veem o mesmo calendário.

## Produção

Para uso comercial, recomenda-se adicionar banco de dados, painel administrativo, autenticação, confirmação/cancelamento de reservas, pagamento online e/ou integração com WhatsApp/Google Calendar/Booking/Airbnb.


### Fotos das cabanas

Cada card possui um carrossel independente com setas, indicadores, contador e suporte a gesto de deslizar no celular. Para adicionar fotos, edite o array `images` de cada cabana em `public/app.js`:

```js
images: [
  'assets/minha-foto-1.jpg',
  'assets/minha-foto-2.jpg',
  'assets/minha-foto-3.jpg'
]
```

Coloque os arquivos de imagem dentro de `public/assets/`. Você pode adicionar quantas fotos quiser por cabana.
