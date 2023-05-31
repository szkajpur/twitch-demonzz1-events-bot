# Demonzz1 events bot

### ⚠️ Aby bot działał potrzebny jest [node](https://nodejs.org/en/download) i [npm](https://www.npmjs.com/get-npm) (domyślnie instalowany wraz z node) ⚠️

## Instalacja i konfiguracja
1. Odpalamy cmd i używając `cd (ścieżka folderu)` przechodzimy do wcześniej stworzonego folderu, w którym będzie znajdował się bot.
2. Pobieramy pliki z [githuba](https://github.com/szkajpur/twitch-demonzz1-events-bot/archive/master.zip) i przenosimy je do wcześniej wskazanego folderu. Możemy to zrobić również poprzez komendę `git clone https://github.com/szkajpur/twitch-demonzz1-events-bot`
3. Przechodzimy do folderu twitch-demonzz1-events-bot za pomocą `cd twitch-demonzz1-events-bot`
4. W cmd będac w folderze bota wpisujemy `npm i`
5. Zmieniamy nazwę pliku `configexample.json` na `config.json`
6. Edytujemy plik `config.json`
   - w `username` ustawiany nick na swój
   - w `oauth` bierzemy ACCESS TOKEN ze stronki [twitchtokengenerator](https://twitchtokengenerator.com/) (musicie tam wybrać token dla bota)
   - w `command` polecam zmienić na coś innego
   - heista można zmieniać w locie
7. Uruchamiamy bota komendą `npm start`
8. Jeśli pojawiła się wiadomość `Pomyślnie połączono do czatu...`, bot działa prawidłowo ;)

## Komendy

- `!testbota` - Sprawdzenie czy bot działa. Do ustawienia w configu. Każdy może ją uruchomić.
- `!ustaw [ilość]` - Zmiana ilości heista. Działa tylko dla tego samego użytkownika który hostuje bota.
- `!jakiheist` - Zwraca aktualnie ustawiony heist. Działa tylko dla tego samego użytkownika który hostuje bota.


## Autor

- [@szkajpur](https://www.twitch.tv/szkajpur)
