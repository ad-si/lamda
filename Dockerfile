from node:8

run mkdir -p /usr/src/app
workdir /usr/src/app

cmd npm run start-prod

copy node_modules node_modules
copy package.json package.json
run npm build --unsafe-perm .

run cd views && npm build --unsafe-perm .
run cd styles && npm build --unsafe-perm .

run cd books      && npm build --unsafe-perm .
run cd contacts   && npm build --unsafe-perm .
run cd events     && npm build --unsafe-perm .
run cd files      && npm build --unsafe-perm .
run cd movies     && npm build --unsafe-perm .
run cd news       && npm build --unsafe-perm .
run cd photos     && npm build --unsafe-perm .

# run cd node_modules/projects   && npm build --unsafe-perm .
# => Breaks as directory is never created

# npm install git+ssh://git@github.com/adius/projects
# TODO: Needs rights to access the bitbucket website

run cd sheetmusic && npm build --unsafe-perm .
run cd songs      && npm build --unsafe-perm .
run cd tasks      && npm build --unsafe-perm .
run cd things     && npm build --unsafe-perm .

copy bin bin
copy icons icons
copy api api
copy public public
copy routes routes
copy modules modules
copy server.js server.js
