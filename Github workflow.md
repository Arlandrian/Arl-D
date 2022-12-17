# Github build and deployment setup using actions
## Create token
- Go to settings -> Developer Settings -> Tokens -> Create a new token

- Select workflow scope -> generate token

- Copy token
## Set Token

Set environment variables, either from OS or Hosting provider settings or .env file
https://github.com/{owner}/{repo_name}
- Repo owner name:   MGITHUB_OWNER= 
- Repo name:         MGITHUB_REPO=
- Token you created: MGITHUB_WORKFLOW_TOKEN=