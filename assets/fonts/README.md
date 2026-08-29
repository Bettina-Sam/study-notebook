# Local Fonts

Physics Notebook vendors its shared site fonts locally so pages do not depend on
Google Fonts at runtime.

## Families in use

- `DM Serif Display`
- `Inter`
- `JetBrains Mono`

## Source

The font binaries in this directory were downloaded from the Google Fonts web
distribution endpoints and correspond to the families currently referenced by
the site.

## Files

- `dm-serif-display-latin.woff2`
- `dm-serif-display-latin-ext.woff2`
- `inter-latin.woff2`
- `inter-latin-ext.woff2`
- `jetbrains-mono-latin.woff2`
- `jetbrains-mono-latin-ext.woff2`

## License files

- `DM_SERIF_DISPLAY-OFL.txt`
- `INTER-OFL.txt`
- `JETBRAINS_MONO-OFL.txt`

## Loading

These fonts are loaded centrally from `css/common.css`. Pages should not add
their own remote font includes for these families.
