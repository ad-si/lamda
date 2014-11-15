# Sheetmusic

## Schema

``` yaml
arranger: String
bars: Integer
composer: String
composers: Array<String>
instrument: String
instruments: Array<String>
instrumentTuning: String
lyrics: String
lyricsAuthor: String
name: String
note: String
style: String
tempo: Integer
time: Integer/Integer
title: String
tuning: String
type: String
```


## Lilypond

Convert lilypond files to svg and create preview:

`$ lilypond -d backend=svg -d no-point-and-click -d preview=#t input.ly`
