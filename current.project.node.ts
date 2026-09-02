/*

npx prisma format
npx prisma migrate dev
npx prisma generate


---

-------------> Biome <-----------
installation : 

npm i -D -E @biomejs/biome
npx @biomejs/biome init


now to enable them add vscode exention

------->>> special if need <<--------

check file -> formater 
npx @biomejs/biome format ./src

apply formater 
npx @biomejs/biome format --write ./src


to run : 
npm run format:check       
npm run format:fix  


npx @biomejs/biome lint ./src ./public

add them on scripts on packge.jsonfile :

"lint:check" : "npx @biomejs/biome lint ./src"

npx @biomejs/biome lint --write ./src

script : 
"lint:fix" : "npx @biomejs/biome lint --write ./src"

scripte run : 
npm run lint:check
npm run lint:fix           

---------

npm i
npm i --save-dev @types/node


















*/