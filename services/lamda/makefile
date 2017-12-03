# Build HTML files to render contacts
build/contacts.html: views/Main.elm
	elm-make \
		--output $@ \
		$<

# Make directory "build"
build:
	mkdir $@
