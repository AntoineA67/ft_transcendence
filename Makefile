# minimal color codes
END=$'\x1b[0m
REV=$'\x1b[7m
GREY=$'\x1b[30m
RED=$'\x1b[31m
GREEN=$'\x1b[32m
CYAN=$'\x1b[36m
WHITE=$'\x1b[37m

NAME = inception

all : $(NAME)

$(NAME) : dev

dev :
	@echo "${YELLOW}> Image building 🎉${END}"
	@docker compose --env-file ./srcs/.env -f ./srcs/compose.yaml build
	@echo "${YELLOW}> Turning up images 🎉${END}"
	@docker compose -f ./srcs/compose.yaml up -d

prod :
	@echo "${YELLOW}> Image building 🎉${END}"
	@docker compose --env-file=./.env.prod -f ./srcs/compose.yaml build
	@echo "${YELLOW}> Turning up images 🎉${END}"
	@docker compose -f ./srcs/compose.yaml up -d


	
down :
	@echo "${YELLOW}> Turning down images ❌${END}"
	@docker compose -f ./srcs/compose.yaml down -v

re:
	@make down
	@make clean
	@make

clean: down
	@echo "${YELLOW}> Cleaning and deleting all images 🧹${END}"
	@ { docker volume ls -q ; echo null; }

.PHONY:	all re down clean up build