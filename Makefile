# minimal color codes
# END=$'\x1b[0m
# REV=$'\x1b[7m
# GREY=$'\x1b[30m
# RED=$'\x1b[31m
# GREEN=$'\x1b[32m
# CYAN=$'\x1b[36m
# WHITE=$'\x1b[37m

GREEN=\033[0;32m
RED=\033[0;31m
BLUE=\033[0;34m
END=\033[0m
RETRIES=5


NAME = inception

all : $(NAME)

$(NAME) : dev

dev :
	@echo "${GREEN}> Image building 🎉${END}"
	@docker compose --env-file ./srcs/.env -f ./srcs/compose.yaml build
	@echo "${GREEN}> Turning up images 🎉${END}"
	@docker compose -f ./srcs/compose.yaml up -d
	@sleep 10
	@success=false; \
	for i in $$(seq 1 ${RETRIES}); do \
		if curl -f http://localhost:8000/ > /dev/null 2>&1; then \
			success=true; \
			break; \
		else \
			echo "${BLUE}Health check failed (Attempt $$i of ${RETRIES})${END}"; \
			sleep 5; \
		fi; \
	done; \
	if $$success; then \
		echo "${GREEN}> Up and Running 🎉${END}"; \
	else \
		echo "${RED}Health check failed after ${RETRIES} attempts.${END}"; \
		exit 1; \
	fi

prod :
	@echo "${GREEN}> Image building 🎉${END}"
	@docker compose --env-file=./build/.env -f ./srcs/compose.yaml build
	@echo "${GREEN}> Turning up images 🎉${END}"
	@docker compose -f ./srcs/compose.yaml up -d


	
down :
	@echo "${GREEN}> Turning down images ❌${END}"
	@docker compose -f ./srcs/compose.yaml down; \

down-volume: down
	@echo "${GREEN}> Deleting all volumes 🧹${END}"
	@docker compose -f ./srcs/compose.yaml down -v; \

re:
	@make down
	@make clean
	@make

clean: down
	@echo "${GREEN}> Cleaning and deleting all images 🧹${END}"
	@ { docker volume ls -q ; echo null; }

.PHONY:	all re down clean up build