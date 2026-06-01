import RefreshToken from '../models/refreshToken.model.js';

class RefreshTokenRepository {
  async create(data) {
    return RefreshToken.create(data);
  }

  async findByToken(token) {
    return RefreshToken.findOne({ token, isRevoked: false }).populate('user');
  }

  async revokeByToken(token) {
    return RefreshToken.findOneAndUpdate(
      { token },
      { isRevoked: true },
      { new: true }
    );
  }

  async revokeAllForUser(userId) {
    return RefreshToken.updateMany(
      { user: userId, isRevoked: false },
      { isRevoked: true }
    );
  }
}

export default RefreshTokenRepository;
