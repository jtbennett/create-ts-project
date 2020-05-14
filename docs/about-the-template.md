# About the template - @jtbennett/ts-project

## Tools

### Dev tools

- **Typescript**. I prefer strong typing most of the time. It protects me against my own silly mistakes. When I do need something more dynamic, it's easy to do. Project references help speed up build times during development.

- **Jest**. For no reason other than I use create-react-app, jest is built-into that, and I'd like to have one testing tool for everything.

- **eslint**. Standard for JavaScript and (more recently) Typescript, and has good integration with editors.

- **yarn**. Because this template is structured as a monorepo, yarn workspaces work well for me. (Mostly. There are a few things I wish it did, but plugins may let me build those myself.)

- **ts-node**. As noted below, the server app is built with node/express. In dev, ts-node loads and transpiles to js on the fly, which avoids building and outputting .js files.

- **prettier**. All default settings, except with trailingCommas: "all". I often reorder a parameter list or a object literal's properties. Having a trailing comma on the last item means not having to add/remove commas. All other prettier settings are purely cosmetic, so the defaults mean never having to discuss formatting.

- **Docker**. I prefer not to install anything on my machine that I don't absolutely have to. Installing Docker once allows me to use all kinds of databases and servers for local development without installing anything else.

- **VS Code**. You don't need to use VS Code, but you may need some additional set up in your editor for prettifying, linting, etc. I have created some VS Code Tasks, which you can ignore or recreate in your editor.

### Ops tools

- **GitHub actions**. There are many good CI services available, but I already have GitHub setup, so using actions for automated testing and building is easy.

- **GitHub package registry**. To publish things publicly, I'd use npm, Docker hub, etc. But I already have GitHub setup, so using its registry private packages and docker images is easy.

- **Docker**.

  Builds happen entirely inside of a Dockerfile. That means I can easily move my build process from one CI service to another. (While I like GitHub actions, my clients may have their own tools that I'm required to use.)

  Also, Many of my gray hairs come from subtle unexpected differences between environments. I like knowing that the exact binary image I deploy to production is the same one I deployed and tested in other environments. So the output of my build process is a Docker image. It also means that I can deploy the same build output to Heroku, AWS Elastic Beanstalk, Azure K8s service, Google K8s Engine, or anywhere else that supports running a Docker image.
