from node:8

run mkdir -p /usr/src/app
workdir /usr/src/app

cmd npm run start-prod

copy node_modules node_modules
copy package.json package.json
run npm build --unsafe-perm .

run cd linked_modules/lamda-views && npm build --unsafe-perm .
run cd linked_modules/lamda-styles && npm build --unsafe-perm .

run cd node_modules/books      && npm build --unsafe-perm .
run cd node_modules/contacts   && npm build --unsafe-perm .
run cd node_modules/events     && npm build --unsafe-perm .
run cd node_modules/files      && npm build --unsafe-perm .
run cd node_modules/movies     && npm build --unsafe-perm .
run cd node_modules/news       && npm build --unsafe-perm .
run cd node_modules/photos     && npm build --unsafe-perm .

# run cd node_modules/projects   && npm build --unsafe-perm .
# => Breaks as directory is never created

# npm install git+ssh://git@github.com/adius/projects
# TODO: Needs rights to access the bitbucket website

run cd node_modules/sheetmusic && npm build --unsafe-perm .
run cd node_modules/songs      && npm build --unsafe-perm .
run cd node_modules/tasks      && npm build --unsafe-perm .
run cd node_modules/things     && npm build --unsafe-perm .

copy bin bin
copy icons icons
copy api api
copy public public
copy routes routes
copy modules modules
copy server.js server.js
