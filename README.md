
#### status
[![Deploy to Heroku](https://github.com/RMvanderGaag/programmeren-4-shareameal/actions/workflows/main.yml/badge.svg)](https://github.com/RMvanderGaag/programmeren-4-shareameal/actions/workflows/main.yml)

## Name
Share a meal

## Description
In deze GitHub repository staat de API voor de wel bekende Share a Meal applicatie. Doormiddel van deze API kan de gebruiker maaltijden aanmaken, verwijderen, inzien etc. ditzelfde kan ook worden gebruikt voor gebruikers. Deze applicatie is gerealiseerd in opdracht van Avans Breda.

De applicatie maakt gebruik van de volgende technieken
- NodeJS
- Body-Parser
- Express
- MySql2
- jsonwebtoken

Verder is de applicatie gedeployed op Heroku. Doormiddel van een pipelie wordt de server automatisch gedeployed wanneer er een nieuwe push is gedaan op de main branch.

De applicatie staat op de volgende website https://share-a-meal-99051382.herokuapp.com/


## Installation
### Requirements
- Node 17.9.0
- XAMMP (Voor lokaal gebruik)
- Postman (Voor gebruik van de POST, PUT, DELETE end points)

### Guide
#### local usage
1. Clone de de repository
2. Open de command line en voer "NPM install" uit
3. Voer vervolgens "NPM run start" uit om de applicatie op te starten
4. Start XAMMP op en zorg dat "Apache" en "MySQL" aan staan
5. Vervolgens kunnen de end points op postman uitgevoerd worden op localhost

#### Online usage
1. Om gelijk de app te gebruiken zonder de code te zien kan postman worden gebruikt en vervolgens de link naar de website ingevoerd worden om de end points te bereiken.

#

Om de verschillende end points te gebruiken kan je naar de volgende site gaan: 
https://shareameal-api.herokuapp.com/docs/#/