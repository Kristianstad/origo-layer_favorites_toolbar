# origo-layer_favorites_toolbar
Layer favorites/bookmarks plugin for Origo. Adds a slide-down bar at the top of the window where you can save and restore visible map layers or location.

Minified and compressed versions of the files are available [here](https://nightly.link/Kristianstad/origo-layer_favorites_toolbar/workflows/build-compress/main/layerfavorites-compressed-assets.zip).

Initialize with:
`origo.on('load', initLayerFavoritesToolbar());`

<img width="765" height="112" alt="image" src="https://github.com/user-attachments/assets/1096f6c5-f90d-43d4-b063-965803e1f57d" />

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
