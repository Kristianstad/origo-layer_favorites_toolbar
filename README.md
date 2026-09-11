# origo-layer_favorites_toolbar
Layer favorites/bookmarks plugin for Origo. Adds a slide-down bar at the top of the window where you can save and restore visible map layers or location.

Minified and compressed versions of the files are available [here](https://nightly.link/Kristianstad/origo-layer_favorites_toolbar/workflows/build-compress/main/layerfavorites-compressed-assets.zip).

Initialize with:
`origo.on('load', initLayerFavoritesToolbar());`

<img width="1140" height="190" alt="c46f689c-dbf0-4e07-b7f9-93c061d9926a" src="https://github.com/user-attachments/assets/0045ac91-d2de-40ed-bebb-726582c4cc23" />

# Lagerfavorit
Du kan skapa en egen lagerfavorit med lager som du brukar använda. Verktyget kommer man åt genom att föra muspekaren längst upp i kartfönstret, strax ovanför sökfältet. Du kan låsa fast verktygsfältet genom att klicka på *Lås fast verktygsfältet Lagerfavoriter*.

## Skapa en lagerfavorit

- tänd de lager du vill skapa en favorit av
- döp lagerfavoriten i rutan *Lagerfavorit*
- klicka på *Spara/skriv över lagerfavoriten*
- lagerfavoriten finns nu att välja i rullistan *Tänd lagerfavorit…*

## Redigera en lagerfavorit

- tänd/släck de lager som du vill justera i en befintlig favorit
- skriv in namnet på lagerfavoriten i rutan *Lagerfavorit*
- klicka på *Spara/skriv över lagerfavoriten*

## Ta bort en lagerfavorit

- skriv in namnet på lagerfavoriten i rutan *Lagerfavorit*
- klicka på *Radera angiven lagerfavorit*

## Släck och autosläck

- klicka på *Släck alla lager* för att släcka alla tända lager
- dubbelklicka på *Släck alla lager* för att aktivera funktionen som gör att alla andra tända lager släcks varje gång en lagerfavorit tänds.
