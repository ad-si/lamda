# Build HTML file for home
source/home/build/home.html: source/home/views/home.pug | source/home/build
	cd source/home/build
	npx pug \
		--obj data.json \
		--out build \
		$<


# Make directory "source/home/build"
source/home/build:
	mkdir $@


# Remove build artifacts
clean:
	-rm -r source/home/build
