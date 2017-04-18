import express from 'express';
import validate from 'express-validation';
import paramValidation from './validation/group';
import groupCtrl from '../controllers/group';
import groupMiddleware from '../middlewares/group';
import userMiddleware from '../middlewares/user';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .post(validate(paramValidation.createGroup), userMiddleware.isSysAdmin, groupCtrl.createGroup);

router.route('/searchByName/:partialGroupName*?')
  .get(groupCtrl.searchByName);

router.route('/:groupName')
  .get(validate(paramValidation.byName), groupMiddleware.isGroupMember, groupCtrl.getGroup)
  .put(validate(paramValidation.updateGroup), groupMiddleware.isGroupAdmin, groupCtrl.updateGroup)
  .delete(validate(paramValidation.byName), groupMiddleware.isGroupAdmin, groupCtrl.deleteGroup);

router.route('/:groupName/request')
  .post(validate(paramValidation.makeJoinRequest), groupCtrl.makeJoinRequest)
  .put(validate(paramValidation.processJoinRequest),
    groupMiddleware.isGroupAdmin, groupCtrl.processJoinRequest);

router.route('/:groupName/user')
  .post(validate(paramValidation.addUser), groupMiddleware.isGroupAdmin, groupCtrl.addUser);

router.route('/:groupName/user/:userId')
  .delete(validate(paramValidation.userById),
    groupMiddleware.isAdminOrCurrentUser, groupCtrl.removeUser);

router.route('/:groupName/user/:userId/admin')
  .post(validate(paramValidation.userById), groupMiddleware.isGroupAdmin, groupCtrl.addAdmin)
  .delete(validate(paramValidation.userById), groupMiddleware.isGroupAdmin, groupCtrl.removeAdmin);

router.route('/:groupName/escalationpolicy')
  .put(validate(paramValidation.updateEscalationPolicy),
    groupMiddleware.isGroupAdmin, groupCtrl.updateEscalationPolicy)
  .post(validate(paramValidation.byName), groupCtrl.scheduleEPRotation);

router.route('/:groupName/escalationPolicy/:userId')
  .post(validate(paramValidation.overrideUser),
        groupMiddleware.isAdminOrCurrentUser, groupCtrl.overrideUser);

router.route('/:groupName/listSchedule')
  .get(validate(paramValidation.byName), userMiddleware.isSysAdmin, groupCtrl.listSchedules);

// Loads group when API with groupName parameter is hit
router.param('groupName', groupCtrl.load);

export default router;

