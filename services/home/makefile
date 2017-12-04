# Build HTML file for home
build/home.html: views/home.pug | build
	npx pug \
		--obj env.json. \
		--out build \
		$<

# Make directory "build"
build:
	mkdir $@
