# Demonzz1 events bot

### ⚠️ Aby bot działał potrzebny jest [node](https://nodejs.org/en/) i [npm](https://www.npmjs.com/get-npm) (domyślnie instalowany wraz z node) ⚠️

## Instalacja i konfiguracja
1. Odpalamy cmd i używając `cd (ścieżka folderu)` przechodzimy do wcześniej stworzonego folderu, w którym będzie znajdował się bot.
2. Pobieramy pliki z [githuba](https://github.com/szkajpur/twitch-demonzz1-events-bot/archive/master.zip) i przenosimy je do wcześniej wskazanego folderu. Możemy to zrobić również poprzez komendę `git clone https://github.com/szkajpur/twitch-demonzz1-events-bot`
3. Przechodzimy do folderu twitch-demonzz1-events-bot za pomocą `cd twitch-demonzz1-events-bot`
4. W cmd będac w folderze bota wpisujemy `npm i`
5. Zmieniamy nazwę pliku **configexample.json** na **config.json**
6. Edytujemy plik **config.json**
```bash
   "username": "", // nickname
   "oauth": "", // klucz oauth, bierzemy go ze strony https://twitchapps.com/tmi/ ! KOPIUJEMY WRAZ Z OAUTH: !
   "channels": ["demonzz1"], // kanał, do którego ma dołączyć bot
   "heist": "10000", // ilość punktów w heist
   "prefix": "!", // prefix do komendy służącej do testowania bota
   "command": "testbota", // komenda służąca do testowania bota
   "connect": "Połączono ;)", // wiadomość pojawiająca się na czacie po połączeniu się bota
   "bossBotName": "demonzzbot" // nazwa użytkownika na którego ma reagować nasz bot
```
7. Uruchamiamy bota komendą `npm start`
8. Jeśli pojawiła się wiadomość **Pomyślnie połączono do czatu...**, bot działa prawidłowo ;)

## Komendy

- !testbota - Sprawdzenie czy bot działa. Do ustawienia w configu. Każdy może ją uruchomić.
- !ustaw [ilość] - Zmiana ilości heista. Działa tylko dla tego samego użytkownika który hostuje bota.
- !jakiheist - Zwraca aktualnie ustawiony heist. Działa tylko dla tego samego użytkownika który hostuje bota.


## Autor

- [@szkajpur](https://www.twitch.tv/szkajpur)
