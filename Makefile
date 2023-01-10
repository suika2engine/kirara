usage:
	@echo "Targets: setup run build-win build-mac"

setup:
	npm install

run:
	npm start

build-win:
	npx electron-builder --dir --win --x64

build-mac:
	npx electron-builder --dir --mac --x64
	npx electron-builder --dir --mac --arm64

clean:
	rm -rf dist logs node_modules *~ src/*~
