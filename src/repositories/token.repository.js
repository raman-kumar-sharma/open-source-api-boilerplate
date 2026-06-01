import Token from '../models/token.model.js';

class TokenRepository {
  async create(data) {
    return Token.create(data);
  }

  async findValidToken(hashedToken, type) {
    return Token.findOne({
      token: hashedToken,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).populate('user');
  }

  async markAsUsed(id) {
    return Token.findByIdAndUpdate(id, { isUsed: true }, { new: true });
  }

  async deleteByUserAndType(userId, type) {
    return Token.deleteMany({ user: userId, type });
  }
}

export default TokenRepository;
