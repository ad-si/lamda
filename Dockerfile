from node:15

run mkdir -p /usr/src/app
workdir /usr/src/app

cmd npm run start-prod

copy node_modules node_modules
copy package.json package.json
run npm build --unsafe-perm .

run cd views && npm build --unsafe-perm .
run cd styles && npm build --unsafe-perm .

run cd apps/books      && npm build --unsafe-perm .
run cd apps/contacts   && npm build --unsafe-perm .
run cd apps/events     && npm build --unsafe-perm .
run cd apps/files      && npm build --unsafe-perm .
run cd apps/movies     && npm build --unsafe-perm .
run cd apps/news       && npm build --unsafe-perm .
run cd apps/photos     && npm build --unsafe-perm .
run cd apps/projects   && npm build --unsafe-perm .
run cd apps/sheetmusic && npm build --unsafe-perm .
run cd apps/songs      && npm build --unsafe-perm .
run cd apps/tasks      && npm build --unsafe-perm .
run cd apps/things     && npm build --unsafe-perm .

copy bin bin
copy icons icons
copy api api
copy public public
copy routes routes
copy modules modules
copy server.js server.js
