import userModel from "../../DB/model/user.model.js";
import { asyncHandler } from "../utilies/errorHandling.js";
import { verifyToken } from "../utilies/GenerateAndVerifyToken.js";

export const roles = {
  Admin: "Admin",
  Supervisor: "Supervisor",
  Employee: "Employee",
};

export const auth = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return next(new Error("In-valid bearer key", { cause: 400 }));
    }
    const token = authorization.split(" ")[1];
    if (!token) {
      return next(new Error("Missing token", { cause: 400 }));
    }
    const decoded = verifyToken( {token} );
    if (!decoded?.id) {
      return next(new Error("In-valid token payload", { cause: 400 }));
    }
    const user = await userModel.findById({ _id: decoded.id }).select("userName email image role status changePasswordTime");
    if (!user) {
      return next(new Error(`Not register account`, { cause: 401 }));
    }
    if (parseInt(user?.changePasswordTime?.getTime() / 1000) > decoded.iat) {
      return next(new Error(`Expire token`, { cause: 401 }));
    }
    if (user.status == "blocked") {
      return next(new Error(`blocked account`, { cause: 403 }));
    }
    if (!accessRoles.includes(user.role)) {
      return next(new Error(`Not authorized account`, { cause: 403 }));
    }
    req.user = user;
    return next();
  });
};
