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


## Software

- [github.com/btwael/zazate.js](https://github.com/btwael/zazate.js):
	Music theory and notation library for javascript and node.js
- [github.com/PencilCode/musical.js](https://github.com/PencilCode/musical.js):
	A sequencing WebAudio synthesizer that supports ABC notation
- [github.com/trevordixon/LilyBin](https://github.com/trevordixon/LilyBin):
	Web-based LilyPond editor [lilybin.com](http://lilybin.com)
- [alphatab.net](http://alphatab.net):
	Cross platform music notation and guitar tablature rendering library


## Websites

- [soundslice.com](http://soundslice.com):
	Learn music better with interactive notation and tabs
- [getinstinct.com](https://getinstinct.com):
	Guitar lessons that listen as you play along
- [chromatik.com](https://chromatik.com):
	Play along with exclusive sheet music of previously unreleased tunes
- [playgroundsessions.com](https://playgroundsessions.com):
	Learn how to play the piano with interactive lessons featuring your favorite songs
- [my.vexflow.com](http://my.vexflow.com):
	Publish content with music notation, guitar tablature, and chord diagrams, without the need for special tools
- [flat.io](https://flat.io):
	The online music score editor for your compositions
- [synthesiagame.com](http://synthesiagame.com/):
	Learn how to play the piano using falling notes
