.PHONY: install dev build serve clean lint

install:
	npm install

dev: install
	npm run dev

build: install
	npm run build

serve: build
	npx serve out

clean:
	rm -rf .next out

lint:
	npm run lint
