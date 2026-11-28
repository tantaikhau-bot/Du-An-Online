# V35.2.8 — VRM Model Recovery

Render request logs recorded a visit to /play?avatar=original immediately after V35.2.7 deploy. Original mode is not the authored semi-realistic VRM, and the previous HUD mislabeled it as loading. Remove experimental avatar entry links and route all non-VRM avatar query values to /play?avatar=vrm while preserving other query parameters. Production client additionally locks to VRM. Keep existing experimental source files and animation changes. Actual browser/model visibility must still be checked after deployment.
