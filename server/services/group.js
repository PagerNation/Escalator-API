import Joi from 'joi';
import Group from '../models/group';

/**
 * Get a group by name
 * @param {groupName} - the name of the group
 * @returns {Promise<Group, APIError>}
 */
function getGroup(groupName) {
  return Group.get(groupName);
}

/**
 * Deletes a group by name
 * @param {groupName} - the name of the group
 * @returns {Promise<APIError>}
 */
function deleteGroup(groupName) {
  return Group.delete(groupName);
}

/**
 * Creates a group with the given object
 * @param {groupObject} - the details for the new group
 * @returns {Promise<Group, APIError>}
 */
function createGroup(groupObject) {
  const groupSchema = Joi.object().keys({
    name: Joi.string().required(),
    users: Joi.array().items(Joi.string().hex().length(24))
  });

  return new Promise((resolve, reject) => {
    Joi.validate(groupObject, groupSchema, (err, value) => {
      if (err) {
        return reject(err);
      }
      resolve(Group.create(value));
    });
  });
}

/**
 * Updates the group with the given name
 * @param {groupName} - the name of the group to update
 * @param {groupObject} - the details of the group after update
 * @returns {Promise<Group, APIError>}
 */
function updateGroup(groupName, groupObject) {
  const groupSchema = Joi.object().keys({
    name: Joi.string(),
    users: Joi.array().items(Joi.string().hex().length(24))
  });

  return new Promise((resolve, reject) => {
    Joi.validate(groupObject, groupSchema, (err, value) => {
      if (err) {
        return reject(err);
      }
      resolve(Group.findOneAndUpdate({ name: groupName }, value, { new: true }));
    });
  });
}

export default { getGroup, deleteGroup, createGroup, updateGroup };
