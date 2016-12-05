import { fixtures, build } from '../../utils/factories';

function buildUserAndGroups() {
  return new Promise((resolve, reject) => {
    const generatedValues = {};
    const b1 = build('group', fixtures.group());
    const b2 = build('group', fixtures.group());
    Promise.all([b1, b2])
    .then((values) => {
      generatedValues.groups = values;
      const groupNames = values.map(g => g.name);
      return build('user', fixtures.user({ groups: groupNames }));
    })
    .then((u) => {
      generatedValues.user = u;
      resolve(generatedValues);
    });
  });
}

export default { buildUserAndGroups };
