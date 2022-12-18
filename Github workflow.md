# Github build and deployment setup using actions
## Create token
- Go to settings -> Developer Settings -> Tokens -> Create a new token
- Select workflow scope -> generate token
- Copy token
## Set Env Vars as Secrets
- Open github repo page
https://github.com/{owner}/{repo_name}
- Go to settings -> environments -> create new env
- Add all env vars as secret (see template.env file)
- MGITHUB_OWNER: Repo owner name
- MGITHUB_REPO: Repo name
- MGITHUB_WORKFLOW_TOKEN: Token you created
## Dont forget
- Dont forget to change the environment name from the workflow file
"./github/workflows/build-deploy.yml"