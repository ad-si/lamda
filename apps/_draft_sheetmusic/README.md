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

Convert Lilypond files to SVG and create preview:

```sh
lilypond \
  -d backend=svg \
  -d no-point-and-click \
  -d preview=#t \
  input.ly
```


## Image Optimization


### Convert to Grayscale

1. Rotate image
2. Convert to grayscale
3. Increases the contrast by stretching the intensity values and
    blacks-out max 2% and whites-out max 1% of the pixels
4. Convert to PNG

```sh
mogrify \
  -auto-orient \
  -colorspace gray \
  -normalize \
  -format png \
  *.jpeg
```


### Image Binarization

How to create binary (black & white) images from photos/scans.

1. Make sure the image is saved in sRGB colorspace (should be by default).
  Otherwise: `$ convert <source-image> -colorspace sRGB <output-image>`
  or `$ convert <source-image> -set colorspace sRGB <output-image>` to fix the meta-data if the image-data is already in sRGB but was accidentally labeled as RGB.
1. Increase size of sRGB image to around 4-9 MP with e.g.
`$ convert <source-image> -colorspace RGB -resize 200% -colorspace sRGB <output-image>`
  or for small size changes (especially resizing of bw-images) use `-adaptive-resize`
1. Convert gamma adjusted sRGB image to grayscale images like this:
  `$ convert <source-image> -fx '(r+g+b)/3' <output-image>`
  (See [Color-to-Grayscale: Does the Method Matter in Image Recognition?](http://plosone.org/article/info%3Adoi%2F10.1371%2Fjournal.pone.0029740) for a detailed discussion about the best algorithm.)
1. Use otsu's method or a local threshold algorithm to generate a black and white image from the grayscale image.
  (See [Fred's ImageMagick Scripts](http://fmwconcepts.com/imagemagick/) for implementations)
  `$ otsuthresh <source-image> <output-image>`
  `$ localthresh <source-image> <output-image>`
  The local threshold algorithm should be favored when the input-image or the background is not uniformly bright. In order to get good results the radius should be larger than the features that are to be detected.


### Conversion to PDF (Optional)

This uses a maximum size smaller than half a laptop screen,
to give a good overview when opening it on a laptop.
The images are simply resized to fit that maximum size without
changing the aspect ratio.
Although eventually you should of course fit it to the height
of your device for maximum readability.

Use following command in a directory of PNG images:

```bash
img2pdf \
  --imgsize=A6 \
  --output="$(basename "$(pwd)")".pdf \
  *.png
```
