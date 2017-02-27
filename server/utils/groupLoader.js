import groupService from '../services/group';

function bulkScheduleEPRotation() {
  const schedulePromises = [];
  groupService.getAllGroups()
    .then((groups) => {
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].escalationPolicy !== null) {
          schedulePromises.push(groupService.scheduleEPRotation(groups[i]));
        }
      }
      return Promise.all(schedulePromises);
    })
    .then(() => console.log('Group rotation has been scheduled'));
}

export default { bulkScheduleEPRotation };
