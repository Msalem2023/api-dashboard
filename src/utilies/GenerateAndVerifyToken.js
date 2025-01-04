import  jwt  from "jsonwebtoken";
export const generateToken = ({
  payload = {},
  signature = process.env.TOKEN_SIGNATURE} = {}) => {
  const token = jwt.sign(payload, signature);
  return token;
};


export function verifyToken({token}) {
    try {
        const decoded = jwt.verify(token,process.env.TOKEN_SIGNATURE);
        return decoded;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}