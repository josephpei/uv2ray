# uv2ray

A Electron V2ray GUI Client

Based on [electron-ssr](https://github.com/erguotou520/electron-ssr)

Just for study!

## Usage

Instal `v2ray` use pacakge manager such as `pacman`, or download v2ray by yourself(need 4 files `v2ray` `v2ctl` `geosite.dat` `geoip.dat`)

## Project setup
```
yarn
```

### Compiles and hot-reloads for development
```
yarn electron:serve
```

### Compiles and minifies for production
```
yarn electron:build
```

## Country Emoji

Ubuntu `sudo apt install fonts-noto-color-emoji`

Add file `$HOME/.config/fontconfig/conf.d/99-emoji.conf`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <match>
    <test name="family"><string>sans-serif</string></test>
    <edit name="family" mode="append" binding="strong">
      <string>Bitstream Vera Serif</string>
      <string>Noto Color Emoji</string>
    </edit>
  </match>

  <!-- Add emoji generic family -->
  <alias binding="strong">
    <family>emoji</family>
    <default><family>Noto Color Emoji</family></default>
  </alias>

  <!-- Aliases for the other emoji fonts -->
  <alias binding="strong">
    <family>Apple Color Emoji</family>
    <prefer><family>Noto Color Emoji</family></prefer>
  </alias>
  <alias binding="strong">
    <family>Segoe UI Emoji</family>
    <prefer><family>Noto Color Emoji</family></prefer>
  </alias>
  <alias binding="strong">
    <family>Emoji One</family>
    <prefer><family>Noto Color Emoji</family></prefer>
  </alias>
</fontconfig>

```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
