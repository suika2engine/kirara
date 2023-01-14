usage:
	@echo "Targets: setup run win mac"

setup:
	npm install

run:
	npm start

win:
	npx electron-builder --win --x64

mac:
	npx electron-builder --mac --x64

clean:
	rm -rf dist logs node_modules *~ src/*~
