# Movies

Convert video files to .mp4 and use h.264 codec (works with Chrome, Safari, IE):

	$ ffmpeg -i movieName.avi -c:v libx264 -movflags +faststart movieName.mp4


Convert video files to .webm (works with Opera, Chrome, Firefox):

	$ ffmpeg -i movieName.avi -c:v libvpx -movflags +faststart -qmin 0 -qmax 50 -crf 10 -b:v 2M -c:a libvorbis movieName.webm


Concat to .avi files:

	ffmpeg -i moviePart1.avi -i moviePart2.avi \
	-filter_complex '[0:0] [0:1] [1:0] [1:1] concat=n=2:v=1:a=1 [v] [a]' \
	-map '[v]' -map '[a]' -c:v libx264 -movflags +faststart movieName.mp4

