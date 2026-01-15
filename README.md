# origo-layer_favorites_toolbar
Layer favorites plugin for Origo. Adds a slide-down bar at the top of the window where you can save and restore visible map layers.

I use Github actions to minify and compress. Minified and compressed versions of the files are available as downloadable artefacts [here](https://github.com/Kristianstad/origo-layer_favorites_toolbar/actions/workflows/build-compress.yml).

Initialize with:
`origo.on('load', initLayerFavoritesToolbar());`

Nu finns det ett verktyg för att spara och tända lagerkombinationer som används ofta. Vi kallar det för lagerfavoriter och verktyget kommer man åt genom att föra muspekaren längst upp i kartfönstret, strax ovanför sökfältet (eller dra ned på mobil). Tänd lagerkombinationen som du vill spara, ge lagerfavoriten ett unikt namn och klicka på spara. Man kan förhindra att lagerfavoritverktyget hela tiden gömmer sig genom att klicka på låsikonen. Det finns även ett "Autosläck"-läge som, när det är aktiverat, alltid släcker alla tända lager när man tänder en lagerfavorit. Autosläck-läget aktiveras genom att dubbelklicka på släck lager-ikonen (långklick på mobil).
