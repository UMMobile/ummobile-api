<p align="center">
  <img src="./icon.png" width="86" alt="Nest Logo" />
</p>

<p align="center">
  The API that collect any other APIs that the app for the Montemorelos University use.
</p>

# Usage
**This project will not run without the rigth variables declared in the `.env` file.**

You will have to request to the project leader the `.env` file to work in the development environment.


## Installation
```bash
npm install
```

## Running the app
```bash
npm run start

# watch mode
npm run start:dev
```

# Project scaffolding
## `config`
Contains the configuration of the API. Load the environment variables. The file `configuration.ts` export all the configurations files.
## `endpoints`
Contains all the sections of the API. Each directory inside contains a controller, module & a service file. Also can contains a `dto`, `entities` & `tests` directories.
## `service`
Contains the services used in differents modules.
- `acaAuth`: Get an academic token to use it for the academic services.
- `guards`: Contains the guards to authorize the endpoints.
- `http`: Contains the individual custom HTTP modules for the different services.

## `statics`
Contains static information like the types or the rules list. All the types are exported from `types.ts`.

## `utils`
Module that contains useful functions that are used everywhere.

# Stay in touch
- Author - [Jonathan Gomez](https://jonathangomz.github.io)
