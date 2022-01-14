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