import AuditLog from '../models/auditLog.model.js';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../utils/constants.js';

class AuditLogRepository {
  async create(entry) {
    return AuditLog.create(entry);
  }

  async findPaginated({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    action,
    actor,
    from,
    to,
  } = {}) {
    const filter = {};

    if (action) filter.action = action;
    if (actor) filter.actor = actor;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('actor', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return { logs, total, page, limit };
  }
}

export default AuditLogRepository;
