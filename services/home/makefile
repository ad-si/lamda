# Build HTML file for home
build/home.html: views/home.pug | build
	npx pug \
		--obj data.json \
		--out build \
		$<


# Make directory "build"
build:
	mkdir $@


# Remove build artifacts
clean:
	rm -r build
