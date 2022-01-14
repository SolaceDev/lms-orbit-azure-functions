# LMS Orbit Integration

## Env Setup
- Get your [Orbit token](https://docs.orbit.love/reference/authorization)
- Create a [local.settings.json](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node?tabs=v2#environment-variables) file with the following

```
{
    "IsEncrypted": false,
    "Values": {
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "ORBIT_TOKEN": "<insert your orbit token>"
    }
  }
```

## Local development 
- Install dependencies `npm install`
- Run Azure Function(s) locally `npm run start`

## Deploying Azure Function to production
Contact [Tamimi](https://github.com/TamimiGitHub)