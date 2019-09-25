name=worker-inspector
image=databox/$(name)

build:
	docker build --force-rm --no-cache -t $(image) .

dev:
	docker run -it --rm --name=$(name).dev $(image)