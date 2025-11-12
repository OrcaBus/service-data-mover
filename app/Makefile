.PHONY: *

install:
	@poetry update

lint: install
	@poetry run ruff format .

check: lint
	@poetry run ruff check .

fix: lint
	@poetry run ruff check --fix .

dm: install
	@poetry run dm $(COMMAND)

clean:
	rm -rf data && rm -rf .ruff_cache
