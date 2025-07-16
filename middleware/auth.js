export const tokenStore = new Map(); // Store tokens in memory for simplicity

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token || authHeader.split(" ")[0] !== "Bearer") {
    return res.status(401).json({ Error: "Please log in first." });
  } else if (!tokenStore.has(token)) {
    return res.status(403).json({ Error: "User not logged in properly" });
  } else if (tokenStore.get(token).created < Date.now() - 7200000) {
    tokenStore.delete(token);
    return res.status(403).json({ Error: "Please log in again" });
  }

  try {
    const user = tokenStore.get(token);
    req.user = user;
    next();
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return res.status(500).json({ Error: "Some error occured" });
  }
};
