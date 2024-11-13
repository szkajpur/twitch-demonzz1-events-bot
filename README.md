# twitch-demonzz1-events-bot

Prosty bot odpowiadający na boss, ffa i heist u demonza. (I tak giveaway wygra widz gucia)

## Co potrzebujesz

- [Node.js](https://nodejs.org/) (wersja 18 lub wyższa)
- [pnpm](https://pnpm.io/) package manager

## Instalacja

1. Skopiuj repo:
```bash
git clone https://github.com/szkajpur/twitch-demonzz1-events-bot
cd twitch-demonzz1-events-bot
```

2. Zainstaluj biblioteki używając pnpm:
```bash
pnpm install
```

## Konfiguracja

1. Skopiuj `.envDefault` i nadaj mu nazwę `.env`

```env
TWITCH_USERNAME=forsen
TWITCH_OAUTH=
TWITCH_CHANNEL=demonzz1
COMMAND_PREFIX=!
STATUS_COMMAND=status
CONNECT_MESSAGE=Pomyślnie połączono z czatem! MrDestructoid
BOSS_BOT_NAME=demonzzbot
HEIST_AMOUNT=1000
BAND_ON_PERMA=true
```

### Wyjaśnienie zmiennych

- `TWITCH_USERNAME`: Twój nick na ttv
- `TWITCH_OAUTH`: Oauth Token (bez "oauth:" na początku)
- `TWITCH_CHANNEL`: Kanał do którego się połączysz
- `COMMAND_PREFIX`: Prefiks dla poleceń (domyślnie: !)
- `STATUS_COMMAND`: Komenda do sprawdzania czy bot działa
- `CONNECT_MESSAGE`: Co napisze bot po połączeniu
- `BOSS_BOT_NAME`: Nick bota od bossów
- `HEIST_AMOUNT`: Ilość heista
- `BAND_ON_PERMA`: Czy pisać "BAND" w przypadku permów (true/false)

## Jak zdobyć Twitch OAuth Token

1. Wejdź na [TwitchTokenGenerator](https://twitchtokengenerator.com/)
2. Kliknij `Bot Chat Token`
3. Rozwiąż Captchę jak jest
4. Token jest w `Generated Tokens` -> `ACCESS_TOKEN`

## Odpalanie bota

1. Zbuduj bota:
```bash
pnpm run build
```

2. Wystartuj bota:
```bash
pnpm run start
```

## Dostępne komendy

- `!status` - Check if the bot is working
- `!ustaw [amount]` - Set heist amount (bot owner only)
- `!jakiheist` - Check current heist amount (bot owner only)

## Auto-Odpowiedzi

Bot będzie automatycznie odpowiadał na poniższe wiadomości:
- `Type !boss to join!` → `!boss`
- `Type !ffa to join!` → `!ffa`
- `-Everyone can Join!- In order to join type !heist (amount).` → `!heist [ustawiony_heist]`
