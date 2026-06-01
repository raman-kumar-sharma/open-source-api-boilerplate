import ApiError from '../utils/ApiError.js';
import { ROLES } from '../utils/constants.js';
import {
  parsePaginationQuery,
  buildPaginationMeta,
} from '../utils/pagination.js';
import { AUDIT_ACTIONS } from './audit.service.js';

class UserService {
  constructor({ userRepository, auditService }) {
    this.userRepository = userRepository;
    this.auditService = auditService;
  }

  async getUsers(query) {
    const { page, limit, skip, sort, search, searchFields, filter } =
      parsePaginationQuery(query);

    if (filter.isActive !== undefined) {
      filter.isActive = filter.isActive === 'true';
    }

    const { users, total } = await this.userRepository.findAll({
      filter,
      search,
      searchFields,
      sort,
      skip,
      limit,
    });

    return {
      users,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getUserById(id, requester) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (
      requester.role === ROLES.USER &&
      requester.id !== id.toString()
    ) {
      throw ApiError.forbidden('You can only view your own profile');
    }

    return user;
  }

  async updateUser(id, updateData, requester) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (updateData.email) {
      const emailTaken = await this.userRepository.emailExists(updateData.email, id);
      if (emailTaken) {
        throw ApiError.conflict('Email already in use');
      }
    }

    if (updateData.role && requester.role !== ROLES.ADMIN) {
      throw ApiError.forbidden('Only admins can change user roles');
    }

    const updated = await this.userRepository.updateById(id, updateData);

    await this.auditService?.record({
      action: AUDIT_ACTIONS.USER_UPDATE,
      resource: 'user',
      resourceId: id,
      actor: requester.id,
      status: 'success',
      metadata: { fields: Object.keys(updateData) },
    });

    return updated;
  }

  async updateProfile(userId, updateData) {
    if (updateData.email) {
      const emailTaken = await this.userRepository.emailExists(updateData.email, userId);
      if (emailTaken) {
        throw ApiError.conflict('Email already in use');
      }
      updateData.isEmailVerified = false;
    }

    const user = await this.userRepository.updateById(userId, updateData);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  async deleteUser(id, requester) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await this.userRepository.deleteById(id);

    await this.auditService?.record({
      action: AUDIT_ACTIONS.USER_DELETE,
      resource: 'user',
      resourceId: id,
      actor: requester?.id ?? null,
      status: 'success',
      metadata: { email: user.email },
    });

    return { message: 'User deleted successfully' };
  }
}

export default UserService;
