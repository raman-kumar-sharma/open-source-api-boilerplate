import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  getUsers = asyncHandler(async (req, res) => {
    const result = await this.userService.getUsers(req.query);
    sendSuccess(res, HTTP_STATUS.OK, 'Users retrieved successfully', result.users, result.meta);
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await this.userService.getUserById(req.params.id, req.user);
    sendSuccess(res, HTTP_STATUS.OK, 'User retrieved successfully', user);
  });

  updateUser = asyncHandler(async (req, res) => {
    const user = await this.userService.updateUser(req.params.id, req.body, req.user);
    sendSuccess(res, HTTP_STATUS.OK, 'User updated successfully', user);
  });

  deleteUser = asyncHandler(async (req, res) => {
    const result = await this.userService.deleteUser(req.params.id, req.user);
    sendSuccess(res, HTTP_STATUS.OK, result.message);
  });

  updateProfile = asyncHandler(async (req, res) => {
    const user = await this.userService.updateProfile(req.user.id, req.body);
    sendSuccess(res, HTTP_STATUS.OK, 'Profile updated successfully', user);
  });
}

export default UserController;
