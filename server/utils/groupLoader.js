import groupService from '../services/group';

function bulkScheduleEPRotation() {
  const schedulePromises = [];
  return groupService.getGroups({})
    .then((groups) => {
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].escalationPolicy !== null) {
          schedulePromises.push(groupService.scheduleEPRotation(groups[i]));
        }
      }
      return Promise.all(schedulePromises);
    });
}

export default { bulkScheduleEPRotation };
