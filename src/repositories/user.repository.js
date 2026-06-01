import User from '../models/user.model.js';
import { buildSearchFilter } from '../utils/pagination.js';

class UserRepository {
  async create(userData) {
    return User.create(userData);
  }

  async findById(id, includePassword = false) {
    const query = User.findById(id);
    if (includePassword) {
      query.select('+password +loginAttempts +lockUntil');
    }
    return query.exec();
  }

  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password +loginAttempts +lockUntil');
    }
    return query.exec();
  }

  async findAll({ filter, search, searchFields, sort, skip, limit }) {
    const mongoFilter = buildSearchFilter(filter, search, searchFields);
    const [users, total] = await Promise.all([
      User.find(mongoFilter).sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(mongoFilter),
    ]);
    return { users, total };
  }

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id) {
    return User.findByIdAndDelete(id).exec();
  }

  async emailExists(email, excludeId = null) {
    const filter = { email: email.toLowerCase() };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const count = await User.countDocuments(filter);
    return count > 0;
  }
}

export default UserRepository;
