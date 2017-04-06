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

function rescheduleDeactivation() {
  const schedulePromises = [];
  const query = { 'escalationPolicy.subscribers': { $exists: true, $ne: [] } };
  return groupService.getGroups(query)
    .then((groups) => {
      for (let i = 0; i < groups.length; i++) {
        const subscribers = groups[i].escalationPolicy.subscribers;
        for (let j = 0; j < subscribers.length; j++) {
          const s = subscribers[j];
          if (s.deactivateDate !== null) {
            schedulePromises.push(groupService.scheduleDeactivateUser(groups[i],
              s.userId,
              s.deactivateDate,
              s.reactivateDate));
          }
        }
      }
      return Promise.all(schedulePromises);
    });
}

function rescheduleReactivation() {
  const schedulePromises = [];
  const query = { 'escalationPolicy.subscribers': { $exists: true, $ne: [] } };
  return groupService.getGroups(query)
    .then((groups) => {
      for (let i = 0; i < groups.length; i++) {
        const subscribers = groups[i].escalationPolicy.subscribers;
        for (let j = 0; j < subscribers.length; j++) {
          if (subscribers[j].reactivateDate !== null) {
            schedulePromises.push(groupService.scheduleReactivateUser(groups[i],
              subscribers[j].userId,
              subscribers[j].deactivateDate,
              subscribers[j].reactivateDate));
          }
        }
      }
      return Promise.all(schedulePromises);
    });
}

export default {
  bulkScheduleEPRotation,
  rescheduleDeactivation,
  rescheduleReactivation
};
