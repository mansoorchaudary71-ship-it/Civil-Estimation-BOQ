const fs = require('fs');
const file = 'firestore.rules';
let content = fs.readFileSync(file, 'utf8');

// Replace isValidProject
const isValidProjectOld = `    function isValidProject(data) {
      return data.keys().hasAll(['name', 'ownerId', 'memberIds', 'roles', 'memberEmails', 'createdAt', 'updatedAt']) &&
             data.name is string && data.name.size() <= 200 &&
             data.ownerId is string && data.ownerId.size() <= 128 &&
             data.memberIds is list && data.memberIds.size() <= 50 &&
             (data.memberIds.size() == 0 || data.memberIds[0] is string) &&
             data.roles is map &&
             data.memberEmails is map &&
             data.createdAt is number &&
             data.updatedAt is number &&
             data.get('location', '') is string &&
             data.get('type', '') is string &&
             data.get('startDate', '') is string &&
             (data.get('budget', 0) is number || data.get('budget', '') is string);
    }`;

const isValidProjectNew = `    function isValidProject(data) {
      return data.keys().hasAll(['name', 'ownerId', 'memberIds', 'roles', 'memberEmails', 'createdAt', 'updatedAt']) &&
             data.name is string && data.name.size() <= 200 &&
             data.ownerId is string && data.ownerId.size() <= 128 &&
             data.memberIds is list && data.memberIds.size() <= 50 &&
             (data.memberIds.size() == 0 || data.memberIds[0] is string) &&
             data.roles is map &&
             data.memberEmails is map &&
             data.createdAt is number &&
             data.updatedAt is number &&
             data.get('location', '') is string &&
             data.get('type', '') is string &&
             data.get('startDate', '') is string &&
             (data.get('budget', 0) is number || data.get('budget', '') is string) &&
             (data.get('shareLinkEnabled', false) is bool) &&
             (data.get('shareToken', '') is string) &&
             (data.get('shareRole', 'viewer') is string) &&
             (data.get('lastUsedShareToken', '') is string);
    }`;

// Replace match /projects/{projectId}
const matchProjectsOld = `    match /projects/{projectId} {
      allow get: if isSignedIn() && existing().memberIds.hasAny([request.auth.uid]);
      allow list: if isSignedIn() && resource.data.memberIds.hasAny([request.auth.uid]);
      allow create: if isSignedIn() && isValidId(projectId) && isValidProject(incoming()) && incoming().ownerId == request.auth.uid && incoming().roles[request.auth.uid] == 'owner' && incoming().memberIds.hasAny([request.auth.uid]);
      allow update: if isSignedIn() && existing().memberIds.hasAny([request.auth.uid]) && existing().roles[request.auth.uid] in ['owner', 'editor'] && isValidId(projectId) && isValidProject(incoming()) && incoming().ownerId == existing().ownerId && incoming().createdAt == existing().createdAt &&
                    incoming().diff(existing()).affectedKeys().hasOnly(['name', 'location', 'type', 'startDate', 'budget', 'memberIds', 'roles', 'memberEmails', 'updatedAt']);
      allow delete: if isSignedIn() && existing().ownerId == request.auth.uid;
    }`;

const matchProjectsNew = `    match /projects/{projectId} {
      allow get: if isSignedIn() && existing().memberIds.hasAny([request.auth.uid]);
      allow list: if isSignedIn() && resource.data.memberIds.hasAny([request.auth.uid]);
      allow create: if isSignedIn() && isValidId(projectId) && isValidProject(incoming()) && incoming().ownerId == request.auth.uid && incoming().roles[request.auth.uid] == 'owner' && incoming().memberIds.hasAny([request.auth.uid]);
      allow update: if isSignedIn() && isValidId(projectId) && isValidProject(incoming()) && incoming().ownerId == existing().ownerId && incoming().createdAt == existing().createdAt && (
        (
          existing().memberIds.hasAny([request.auth.uid]) && existing().roles[request.auth.uid] in ['owner', 'editor'] &&
          incoming().diff(existing()).affectedKeys().hasOnly(['name', 'location', 'type', 'startDate', 'budget', 'memberIds', 'roles', 'memberEmails', 'updatedAt', 'shareLinkEnabled', 'shareToken', 'shareRole', 'lastUsedShareToken'])
        ) || (
          !existing().memberIds.hasAny([request.auth.uid]) &&
          existing().shareLinkEnabled == true &&
          incoming().lastUsedShareToken == existing().shareToken &&
          incoming().memberIds.hasAll(existing().memberIds) &&
          incoming().memberIds.hasAll([request.auth.uid]) &&
          incoming().memberIds.size() == existing().memberIds.size() + 1 &&
          incoming().roles[request.auth.uid] == existing().shareRole &&
          incoming().diff(existing()).affectedKeys().hasOnly(['memberIds', 'roles', 'memberEmails', 'lastUsedShareToken', 'updatedAt'])
        )
      );
      allow delete: if isSignedIn() && existing().ownerId == request.auth.uid;
    }`;

content = content.replace(isValidProjectOld, isValidProjectNew);
content = content.replace(matchProjectsOld, matchProjectsNew);

fs.writeFileSync(file, content);
console.log("Patched rules");
