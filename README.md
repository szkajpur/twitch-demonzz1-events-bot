# Demonzz1 events bot

### ⚠️ Aby bot działał potrzebny jest [node](https://nodejs.org/en/download) i npm (npm domyślnie instalowany wraz z node) ⚠️

## Instalacja i konfiguracja
1. Pobieramy projekt [github](https://github.com/szkajpur/twitch-demonzz1-events-bot/archive/master.zip) lub poprzez `git clone https://github.com/szkajpur/twitch-demonzz1-events-bot`
2. Przechodzimy do folderu twitch-demonzz1-events-bot za pomocą `cd twitch-demonzz1-events-bot`
3. Instalujemy biblioteki `npm i`
4. Zmieniamy nazwę pliku `configexample.json` na `config.json`
5. Edytujemy plik `config.json`
   - w `username` ustawiamy swój nick
   - w `oauth` bierzemy ACCESS TOKEN ze stronki [twitchtokengenerator](https://twitchtokengenerator.com/) (bot token)
   - w `command` polecam zmienić na coś innego
   - heista można zmieniać w czasie rzeczywistym
6. Uruchamiamy bota komendą `npm start`
7. Jeśli pojawiła się wiadomość `Pomyślnie połączono do czatu...`, bot działa prawidłowo ;)

## Komendy

- `!testbota` - Sprawdzenie czy bot działa. Każdy może ją uruchomić.
- `!ustaw [ilość]` - Zmiana ilości heista. 
- `!jakiheist` - Zwraca aktualnie ustawiony heist.


## Autor

- [@szkajpur](https://www.twitch.tv/szkajpur)
