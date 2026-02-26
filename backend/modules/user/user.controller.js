import * as userService from "./user.service.js";

export const me = async (req, res) => {
  try {
    const data = await userService.getMyProfile(
      req.user.userId
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publicProfile = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await userService.getPublicProfile(
      walletAddress
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};