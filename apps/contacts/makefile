# Build HTML files to render contacts
build/contacts.html: views/Main.elm | build
	elm-make \
		--output $@ \
		$<

# Make directory "build"
build:
	mkdir $@
